/**
 * 把 eval/results.json 渲染成 eval/results.md（方案第 6 节的评测表）。
 * 用法：node --import tsx eval/render_results.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '/Users/leiyu/学科实践大作业'

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

function pct(n: number, d: number): string {
  return d === 0 ? '—' : `${Math.round((n / d) * 100)}%`
}

function main() {
  const rows = JSON.parse(readFileSync(join(ROOT, 'eval/results.json'), 'utf8')) as Row[]
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const pluginRows = rows.filter(r => r.group === '插件')
  const controlRows = rows.filter(r => r.group === '对照组')

  const sum = (rs: Row[], pick: (r: Row) => number) => rs.reduce((a, r) => a + pick(r), 0)
  const pluginQuote = { hit: sum(pluginRows, r => r.quoteHit), total: sum(pluginRows, r => r.quoteTotal) }
  const controlQuote = { hit: sum(controlRows, r => r.quoteHit), total: sum(controlRows, r => r.quoteTotal) }
  const pluginFact = { m: sum(pluginRows, r => r.factMatched), t: sum(pluginRows, r => r.factTotal) }
  const controlFact = { m: sum(controlRows, r => r.factMatched), t: sum(controlRows, r => r.factTotal) }
  const pluginComplete = pluginRows.filter(r => r.complete).length

  const table = (rs: Row[]) => [
    '| arXiv | 论文 | 笔记完整 | 引用命中 | 工具调用成功/次数 | 事实记号核对 |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rs.map(r =>
      `| ${r.id} | ${r.title.slice(0, 42)}${r.title.length > 42 ? '…' : ''} | ${r.complete ? '✅' : `❌（缺 ${r.missing.join('/')}）`} | ${r.quoteHit}/${r.quoteTotal}（${pct(r.quoteHit, r.quoteTotal)}） | ${r.group === '插件' ? `${r.toolOk}/${r.toolCalls}` : '—'} | ${r.factMatched}/${r.factTotal} |`,
    ),
  ].join('\n')

  const md = `# 论文领航 · 评测结果（${now}）

模型：DeepSeek-V4.1-Flash（推理等级 High）。插件组 = 完整四工具链 + 引用校验；对照组 = 同一批论文，只在提示里贴摘要、不提供任何工具，要求按同一笔记结构产出。

## 插件组（${pluginRows.length} 篇）

${table(pluginRows)}

## 摘要对照组（${controlRows.length} 篇）

${table(controlRows)}

## 汇总对比

| 指标 | 插件组 | 摘要对照组 |
| --- | --- | --- |
| 笔记六字段完整 | ${pluginComplete}/${pluginRows.length} | ${controlRows.filter(r => r.complete).length}/${controlRows.length} |
| 引用逐字命中率 | ${pluginQuote.hit}/${pluginQuote.total}（**${pct(pluginQuote.hit, pluginQuote.total)}**） | ${controlQuote.hit}/${controlQuote.total}（${pct(controlQuote.hit, controlQuote.total)}） |
| 事实关键记号命中 | ${pluginFact.m}/${pluginFact.t}（${pct(pluginFact.m, pluginFact.t)}） | ${controlFact.m}/${controlFact.t}（${pct(controlFact.m, controlFact.t)}） |
| 平均工具调用次数 | ${(sum(pluginRows, r => r.toolCalls) / Math.max(1, pluginRows.length)).toFixed(1)} | 0（无工具） |

## 口径说明

- **引用逐字命中**：笔记里的每条 quote，与离线抽取的论文全文（与插件同一套 PDF 抽取代码）做「仅合并空白后逐字包含」比对。写入笔记时 write_note 已经挡过一次；此处是对最终落盘内容的独立复核。
- **事实记号核对**：自动从每篇 3 个标准事实（eval/papers.jsonl）里抽出关键记号（数字、方法名、数据集名），检查是否出现在笔记 JSON 中。这是近似核对，每篇仍需按方案人工复核一遍；单篇记号未命中不等于事实错误。
- 工具调用统计来自插件轨迹（eval/traces/tool-calls.jsonl）。
- 长论文（2303.18223，约 90 页）不进评测表，仅用于第 4 周的上下文裁剪验收：其 read_section 轨迹每条 ≤ 12000 字符、总读入远小于整篇正文。
`

  writeFileSync(join(ROOT, 'eval/results.md'), md)
  console.log('已写出 eval/results.md')
}

main()
