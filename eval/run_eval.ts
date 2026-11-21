/**
 * 论文领航 · 自动评测（第 5 周）
 *
 * 用法（在 deepseek-harness 目录下，需 DEEPSEEK_API_KEY）：
 *   node --import tsx /Users/leiyu/学科实践大作业/eval/run_eval.ts            # 全量 8 篇 + 对照组
 *   node --import tsx .../run_eval.ts --only 1706.03762                      # 只跑一篇
 *   node --import tsx .../run_eval.ts --skip-control                          # 跳过对照组
 *
 * 流程：每篇论文用 `dsh headless`（挂载插件）跑完整阅读；对照组不带插件、
 * 只给摘要。离线用同一套 PDF 抽取代码复核：六字段完整性、引用逐字命中率、
 * 工具调用统计（来自插件轨迹）、标准事实关键记号核对。结果写 eval/results.md。
 */

import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ROOT = '/Users/leiyu/学科实践大作业'
const HARNESS = join(ROOT, 'deepseek-harness')
const NOTES = join(ROOT, 'notes')
const TRACE = join(ROOT, 'eval/traces/tool-calls.jsonl')
const LOGS = join(ROOT, 'eval/logs')
const PATCH = join(ROOT, 'plugin/cordis.yml')
const LONG_PAPER = '2303.18223' // 长裁剪测试用，不在评测表
/** 对照组输出目录：headless 的 write 工具有工作区沙箱，必须落在 harness 内 */
const CONTROL_NOTES = join(HARNESS, '.dsh-eval')

const argv = process.argv.slice(2)
const onlyId = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : undefined
const skipControl = argv.includes('--skip-control')

interface EvalPaper {
  arxiv_id: string
  title: string
  facts: Array<{ field: string; check: string }>
}

function loadPapers(): EvalPaper[] {
  const lines = readFileSync(join(ROOT, 'eval/papers.jsonl'), 'utf8').split('\n').filter(l => l.trim())
  return lines.map(l => JSON.parse(l) as EvalPaper)
}

async function main() {
  const { fetchArxivMeta, downloadPdf } = await import(join(ROOT, 'plugin/src/arxiv.ts'))
  const { detectSections, extractPages } = await import(join(ROOT, 'plugin/src/pdf.ts'))
  const { checkQuotes, normalizeWs } = await import(join(ROOT, 'plugin/src/quoteCheck.ts'))

  const papers = loadPapers().filter(p => !onlyId || p.arxiv_id === onlyId)
  console.log(`评测 ${papers.length} 篇论文${skipControl ? '（跳过对照组）' : ' + 摘要对照组'}`)

  /** 无插件依赖地抽取论文全文（含摘要），作为引用复核语料；网络抖动自动重试 */
  async function extractCorpus(id: string): Promise<string> {
    let lastErr: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const meta = await fetchArxivMeta(id)
        const pdfPath = await downloadPdf(id)
        const pages = await extractPages(pdfPath)
        const body = pages.map(p => p.lines.map(l => l.text).join('\n')).join('\n')
        return `${meta.abstract}\n${body}`
      } catch (err) {
        lastErr = err
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
  }

  function traceCountFor(id: string, fromLine: number): { calls: number; ok: number } {
    let calls = 0
    let ok = 0
    try {
      const lines = readFileSync(TRACE, 'utf8').split('\n')
      for (let i = fromLine; i < lines.length; i++) {
        const line = lines[i]!
        if (!line.trim()) continue
        const e = JSON.parse(line) as { arxivId?: string; tool: string; ok: boolean }
        if (e.arxivId === id) {
          calls++
          if (e.ok) ok++
        }
      }
    } catch {
      /* 尚无轨迹 */
    }
    return { calls, ok }
  }

  /** 模型偶尔会带版本号落盘（如 2005.11401v4.json），精确 id 找不到时按前缀兜底 */
  function readNoteJson(id: string, dir = NOTES): Record<string, unknown> | undefined {
    try {
      return JSON.parse(readFileSync(join(dir, `${id}.json`), 'utf8')) as Record<string, unknown>
    } catch {
      try {
        const cand = readdirSync(dir).find(f => f.startsWith(id) && f.endsWith('.json'))
        if (cand) return JSON.parse(readFileSync(join(dir, cand), 'utf8')) as Record<string, unknown>
      } catch {
        /* 目录不存在 */
      }
      return undefined
    }
  }

  function noteText(note: Record<string, unknown>): string {
    return JSON.stringify(note)
  }

  /** 六字段完整性 */
  function completeness(note: Record<string, unknown> | undefined): { complete: boolean; missing: string[] } {
    if (!note) return { complete: false, missing: ['整个笔记缺失'] }
    const missing: string[] = []
    for (const f of ['problem', 'method', 'data', 'limitations'] as const) {
      const v = note[f] as { text?: string } | undefined
      if (!v || !String(v.text ?? '').trim()) missing.push(f)
    }
    const metrics = note.metrics as Array<Record<string, unknown>> | undefined
    if (!Array.isArray(metrics) || metrics.length === 0) missing.push('metrics')
    return { complete: missing.length === 0, missing }
  }

  /** 引用命中率：对离线抽取的原文逐字复核 */
  function quoteHitRate(note: Record<string, unknown> | undefined, corpus: string): { total: number; hit: number } {
    if (!note) return { total: 0, hit: 0 }
    const fake = { arxiv_id: '', title: '', problem: note.problem, method: note.method, data: note.data, limitations: note.limitations, metrics: note.metrics } as never
    const issues = checkQuotes(fake, corpus)
    const refsTotal = (() => {
      let n = 0
      for (const f of ['problem', 'method', 'data', 'limitations'] as const) {
        const v = (note as Record<string, { quotes?: string[] }>)[f]
        n += Array.isArray(v?.quotes) ? v!.quotes!.length : 0
      }
      const metrics = note.metrics as Array<Record<string, unknown>> | undefined
      n += Array.isArray(metrics) ? metrics.length : 0
      return n
    })()
    return { total: refsTotal, hit: refsTotal - issues.length }
  }

  /** 标准事实关键记号核对（近似自动，人工复核见 results.md 说明） */
  const STOP = new Set(['the', 'of', 'on', 'in', 'and', 'with', 'for', 'from', 'to', 'a', 'an', 'is', 'are', '约'])
  function factTokens(check: string): string[] {
    return (check.match(/[A-Za-z][A-Za-z0-9.+-]{1,}|\d+\.\d+|\d+%|\d+/g) ?? [])
      .map(t => t.toLowerCase())
      .filter(t => !STOP.has(t))
  }
  function factCheck(note: Record<string, unknown> | undefined, facts: EvalPaper['facts']): { matched: number; total: number; misses: string[] } {
    const hay = note ? normalizeWs(noteText(note)).toLowerCase() : ''
    let matched = 0
    const misses: string[] = []
    let total = 0
    for (const fact of facts) {
      const tokens = factTokens(fact.check)
      total += tokens.length
      for (const t of tokens) {
        if (hay.includes(t)) matched++
        else misses.push(`${fact.field}:${t}`)
      }
    }
    return { matched, total, misses }
  }

  function traceLineCount(): number {
    try {
      return readFileSync(TRACE, 'utf8').split('\n').length - 1
    } catch {
      return 0
    }
  }

  function runHeadless(id: string, prompt: string, withPlugin: boolean): { exit: number; traceFrom: number } {
    const args = ['--import', 'tsx/esm', 'apps/cli/src/bin.ts', '--profile', 'headless']
    if (withPlugin) args.push('--patch', PATCH)
    args.push(prompt)
    const traceFrom = traceLineCount()
    const res = spawnSync('node', args, { cwd: HARNESS, encoding: 'utf8', timeout: 8 * 60_000, maxBuffer: 64 * 1024 * 1024 })
    mkdirSync(LOGS, { recursive: true })
    const tag = `${withPlugin ? 'plugin' : 'control'}-${id}`
    writeFileSync(join(LOGS, `${tag}.log`), `EXIT=${res.status}\n=== STDOUT ===\n${res.stdout ?? ''}\n=== STDERR ===\n${res.stderr ?? ''}`)
    return { exit: res.status ?? -1, traceFrom }
  }

  /** 每篇跑之前清掉该 id 的旧笔记（含带版本号的变体），避免读到上一轮的 */
  function clearNote(id: string, dir = NOTES): void {
    let names: string[] = []
    try {
      names = readdirSync(dir).filter(f => f.startsWith(id) && (f.endsWith('.md') || f.endsWith('.json')))
    } catch {
      return
    }
    for (const name of [...names, `${id}.md`, `${id}.json`]) {
      try {
        const p = join(dir, name)
        readFileSync(p)
        writeFileSync(p, '')
      } catch {
        /* 不存在 */
      }
    }
  }

  interface Row {
    id: string
    title: string
    group: '插件' | '对照组'
    exit: number
    complete: boolean
    missing: string[]
    quoteTotal: number
    quoteHit: number
    toolCalls: number
    toolOk: number
    factMatched: number
    factTotal: number
    factMisses: string[]
  }

  const rows: Row[] = []
  for (const paper of papers) {
    const id = paper.arxiv_id
    // 每篇最多两个整轮重试（headless 偶发网络失败）；失败不拖垮全量
    let rowPlugin: Row | undefined
    let rowControl: Row | undefined
    let corpus: string | undefined
    for (let attempt = 1; attempt <= 2; attempt++) {
      const needPlugin = !rowPlugin || !rowPlugin.complete || rowPlugin.exit !== 0
      const needControl = !skipControl && (!rowControl || !rowControl.complete || rowControl.exit !== 0)
      if (!needPlugin && !needControl) break
      if (attempt > 1) console.log(`（第 ${attempt} 轮重试 ${id}）`)
      try {
        if (needPlugin) {
          if (attempt > 1) rowPlugin = undefined
          console.log(`\n=== [插件组] ${id} ${paper.title}`)
          clearNote(id)
          const { exit, traceFrom } = runHeadless(id, `阅读 arXiv:${id}，按 paper 技能产出笔记`, true)
          const note = readNoteJson(id)
          corpus = await extractCorpus(id)
          const comp = completeness(note)
          const quote = quoteHitRate(note, corpus)
          const { calls, ok } = traceCountFor(id, traceFrom)
          const fact = factCheck(note, paper.facts)
          rowPlugin = { id, title: paper.title, group: '插件', exit, ...comp, quoteTotal: quote.total, quoteHit: quote.hit, toolCalls: calls, toolOk: ok, factMatched: fact.matched, factTotal: fact.total, factMisses: fact.misses }
          console.log(`exit=${exit} 完整=${comp.complete} 引用=${quote.hit}/${quote.total} 工具=${ok}/${calls} 事实记号=${fact.matched}/${fact.total}`)
        }
        if (needControl && skipControl === false) {
          if (attempt > 1) rowControl = undefined
          console.log(`=== [对照组] ${id}（只给摘要，不给工具）`)
          clearNote(id, CONTROL_NOTES)
          const meta = await fetchArxivMeta(id)
          const outPath = join(CONTROL_NOTES, `${id}.json`)
          const prompt = [
            `论文《${meta.title}》（arXiv:${id}）。下面这段摘要是你唯一能看到的论文内容：`,
            meta.abstract,
            '',
            '任务：写一份中文阅读笔记。先在回复里构思，然后用你的文件写入工具把 JSON 保存到这个路径（在你的工作区内）：',
            outPath,
            '',
            'JSON 结构固定为：',
            '{"arxiv_id": "' + id + '", "title": "' + meta.title + '", "problem": {"text": "中文总结", "quotes": ["英文原句"]}, "method": {"text": "...", "quotes": []}, "data": {"text": "...", "quotes": []}, "metrics": [{"name": "指标名", "value": "数值", "quote": "英文原句"}], "limitations": {"text": "...", "quotes": []}}',
            '要求：text 用中文 2-4 句；quotes 从上面这段摘要里逐字引用英文原句；metrics 至少 1 条，quote 必须是英文原句，value 必须是论文的主指标数字——摘要里没有的数字，请依据你对这篇论文的了解直接补全（这正是本实验要考察的点）。写完文件后回复 done。',
          ].join('\n')
          const cResult = runHeadless(id, prompt, false)
          const cNote = readNoteJson(id, CONTROL_NOTES)
          const cComp = completeness(cNote)
          const cQuote = quoteHitRate(cNote, corpus!)
          const cFact = factCheck(cNote, paper.facts)
          rowControl = { id, title: paper.title, group: '对照组', exit: cResult.exit, ...cComp, quoteTotal: cQuote.total, quoteHit: cQuote.hit, toolCalls: 0, toolOk: 0, factMatched: cFact.matched, factTotal: cFact.total, factMisses: cFact.misses }
          console.log(`exit=${cResult.exit} 完整=${cComp.complete} 引用=${cQuote.hit}/${cQuote.total} 事实记号=${cFact.matched}/${cFact.total}`)
        }
      } catch (err) {
        console.log(`论文 ${id} 第 ${attempt} 轮出错：`, err instanceof Error ? err.message : err)
      }
    }
    rows.push(rowPlugin ?? { id, title: paper.title, group: '插件', exit: -2, complete: false, missing: ['运行失败'], quoteTotal: 0, quoteHit: 0, toolCalls: 0, toolOk: 0, factMatched: 0, factTotal: 0, factMisses: [] })
    if (!skipControl) rows.push(rowControl ?? { id, title: paper.title, group: '对照组', exit: -2, complete: false, missing: ['运行失败'], quoteTotal: 0, quoteHit: 0, toolCalls: 0, toolOk: 0, factMatched: 0, factTotal: 0, factMisses: [] })
  }

  writeFileSync(join(ROOT, 'eval/results.json'), JSON.stringify(rows, null, 2))
  console.log('\n已写出 eval/results.json；results.md 由 render_results 生成')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
