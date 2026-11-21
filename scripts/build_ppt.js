/* 论文领航 · 答辩 PPT 构建（12 页）
 * 运行：NODE_PATH=$(npm root -g) node scripts/build_ppt.js
 * 评测表自动读取 eval/results.json（存在时）。
 */
const pptxgen = require('pptxgenjs')
const { readFileSync, existsSync } = require('node:fs')
const { join } = require('node:path')

const ROOT = '/Users/leiyu/学科实践大作业'
// 调色板：背景 / 主色 / 强调（全局只用这几个常量）
const BG_DARK = '0F1115', BG = 'F6F7FA', CARD = 'FFFFFF'
const PRIMARY = '4D6BFE', PRIMARY_DK = '2B44B8'
const ACCENT = '0E9F6E', RED = 'C0392B'
const TEXT = '1B2233', MUTED = '66708A', LINE = 'D9DEE8'
const FONT = 'PingFang SC'
const W = 13.33, H = 7.5, M = 0.55

const pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE'
pres.author = '学科实践三'
pres.title = '论文领航 —— DeepSeek Harness 论文阅读插件'

const bu = () => ({ code: '25B8', indent: 12 })
const rule = (s, x, y, w) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: LINE, width: 1 } })

function pageHeader(s, kicker, title) {
  s.background = { color: BG }
  s.addText(kicker, { x: M, y: 0.34, w: 8, h: 0.3, fontSize: 12.5, color: PRIMARY, bold: true, fontFace: FONT, margin: 0 })
  s.addText(title, { x: M, y: 0.62, w: W - 2 * M, h: 0.72, fontSize: 30, color: TEXT, bold: true, fontFace: FONT, margin: 0 })
}
function foot(s, n) {
  s.addText(`论文领航 · 学科实践三 · ${n}/12`, { x: W - 3.2, y: H - 0.42, w: 2.7, h: 0.3, fontSize: 10.5, color: MUTED, align: 'right', fontFace: FONT, margin: 0 })
}
function stat(s, x, y, w, num, label, color = PRIMARY) {
  s.addText(num, { x, y, w, h: 1.0, fontSize: 60, bold: true, color, fontFace: FONT, margin: 0 })
  s.addText(label, { x, y: y + 1.02, w, h: 0.55, fontSize: 13.5, color: MUTED, fontFace: FONT, margin: 0 })
}

/* ---------- 1 封面（深色） ---------- */
{
  const s = pres.addSlide()
  s.background = { color: BG_DARK }
  s.addText('学科实践三 · A+ 协同编程 · 期末答辩', { x: M, y: 0.8, w: 9, h: 0.4, fontSize: 15, color: '8FA3FF', fontFace: FONT, margin: 0 })
  s.addText('论文领航', { x: M, y: 1.55, w: 11, h: 1.3, fontSize: 66, bold: true, color: 'FFFFFF', fontFace: FONT, margin: 0 })
  s.addText('挂在 DeepSeek Harness 上的论文阅读插件', { x: M, y: 3.05, w: 11, h: 0.6, fontSize: 24, color: 'C7D0E4', fontFace: FONT, margin: 0 })
  s.addText([
    { text: '输入 arXiv 编号 → 抓论文、看目录、按需读章节 → 产出带原文引用的笔记；', options: { breakLine: true } },
    { text: '引用对不上原文的笔记，写不进磁盘。', options: { color: 'FF9E7A', bold: true } },
  ], { x: M, y: 4.15, w: 10.5, h: 1.1, fontSize: 17, color: 'E8EAF0', fontFace: FONT, margin: 0, paraSpaceAfter: 6 })
  s.addShape(pres.shapes.LINE, { x: M, y: 5.9, w: 5.2, h: 0, line: { color: '2A2F3C', width: 1 } })
  s.addText('Harness commit 2e39e704  ·  DeepSeek-V4.1-Flash  ·  2026-11', { x: M, y: 6.05, w: 9, h: 0.4, fontSize: 13, color: '8B93A5', fontFace: FONT, margin: 0 })
}

/* ---------- 2 为什么做插件 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'PROBLEM', '为什么做 Harness 插件：模型读论文最大的风险是编造')
  const rows = [
    ['幻觉指标', '只把摘要贴给模型，让它写「主指标」——摘要里没有的数字会被一本正经地补出来，且措辞像真的'],
    ['不可验证', '普通对话产物没有机械的判据：人要逐句回原文比对，成本高到不会真的去做'],
    ['长文不可读', '20 页以上的 PDF 塞不进上下文，模型只能凭「印象」总结'],
  ]
  let y = 1.75
  for (const [t, d] of rows) {
    s.addText(t, { x: M, y, w: 2.4, h: 0.9, fontSize: 19, bold: true, color: TEXT, fontFace: FONT, margin: 0 })
    s.addText(d, { x: 3.1, y, w: 9.2, h: 0.9, fontSize: 15, color: MUTED, fontFace: FONT, margin: 0 })
    y += 1.05
    rule(s, M, y - 0.22, W - 2 * M)
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.35, w: W - 2 * M, h: 1.35, fill: { color: 'EDF1FE' }, rectRadius: 0.08 })
  s.addText([
    { text: '思路：', options: { bold: true, color: PRIMARY_DK } },
    { text: '把「读」变成一串可审计的工具调用——模型写的每句依据都能被机械验证，验证不通过就写不进笔记。这就是一个 Harness 插件能做到的事：不改核心代码，用工具与技能扩展 Agent。', options: { color: TEXT } },
  ], { x: M + 0.25, y: 5.55, w: W - 2 * M - 0.5, h: 1.0, fontSize: 16, fontFace: FONT, margin: 0 })
  foot(s, 2)
}

/* ---------- 3 Agent 循环 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'MECHANISM', 'Agent 循环：谁调用模型，谁执行工具')
  const steps = ['用户输入', '组装提示', '调用模型', '执行工具', '写回历史']
  const bw = 2.08, gap = 0.42, x0 = M, y0 = 2.0
  steps.forEach((t, i) => {
    const x = x0 + i * (bw + gap)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y0, w: bw, h: 1.0, fill: { color: i === 3 ? 'EDF1FE' : CARD }, line: { color: PRIMARY, width: i === 3 ? 1.5 : 0.75 }, rectRadius: 0.07 })
    s.addText(`${i + 1}. ${t}`, { x, y: y0, w: bw, h: 1.0, fontSize: 16, bold: true, color: i === 3 ? PRIMARY_DK : TEXT, align: 'center', valign: 'middle', fontFace: FONT, margin: 0 })
    if (i < steps.length - 1) s.addText('→', { x: x + bw - 0.05, y: y0 + 0.22, w: gap + 0.1, h: 0.6, fontSize: 20, color: PRIMARY, align: 'center', fontFace: FONT, margin: 0 })
  })
  s.addText('循环往复：工具结果写回后进入下一步，直到模型不再发起调用', { x: M, y: 3.25, w: W - 2 * M, h: 0.4, fontSize: 13.5, color: MUTED, fontFace: FONT, margin: 0 })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 3.95, w: 6.0, h: 2.5, fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08 })
  s.addText([
    { text: '模型', options: { bold: true, color: PRIMARY_DK, breakLine: true } },
    { text: '只输出「调用哪个工具 + 参数」', options: { breakLine: true } },
    { text: '从不亲自执行任何论文操作', options: { color: MUTED } },
  ], { x: M + 0.3, y: 4.15, w: 5.4, h: 2.1, fontSize: 15.5, fontFace: FONT, margin: 0, paraSpaceAfter: 8 })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.85, y: 3.95, w: 6.0, h: 2.5, fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08 })
  s.addText([
    { text: '工具（我们的插件）', options: { bold: true, color: ACCENT, breakLine: true } },
    { text: '确定性代码：抓取、解析 PDF、校验引用', options: { breakLine: true } },
    { text: '从不调用模型，失败时如实返回原因', options: { color: MUTED } },
  ], { x: 7.15, y: 4.15, w: 5.4, h: 2.1, fontSize: 15.5, fontFace: FONT, margin: 0, paraSpaceAfter: 8 })
  s.addText('代码定位见 docs/agent-loop-notes.md：ReactLoopAgent（packages/core/agent-loop）驱动，llm/stream 与 tools.execute 为两个服务接缝', { x: M, y: 6.7, w: W - 2 * M, h: 0.4, fontSize: 11.5, color: MUTED, fontFace: FONT, margin: 0 })
  foot(s, 3)
}

/* ---------- 4 四个工具与笔记结构 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'DESIGN', '六个确定性工具与冻结的笔记结构')
  const tools = [
    ['search_arxiv', '研究主题 → arXiv 检索结果（编号 + 标题）'],
    ['fetch_arxiv', 'arXiv id → 标题/作者/摘要 + 下载 PDF、抽取章节'],
    ['list_sections', '→ 章节目录（标题、页码、词数）'],
    ['read_section', '章节序号 + max_chars → 该节正文（进入校验语料）'],
    ['write_note', '笔记 JSON → 校验通过落盘；否则整体退回'],
    ['compare_notes', '多篇已落盘笔记 → 方法/指标/局限对照表'],
  ]
  let y = 1.72
  for (const [t, d] of tools) {
    s.addText(t, { x: M, y, w: 2.2, h: 0.56, fontSize: 15, bold: true, color: PRIMARY_DK, fontFace: 'SF Mono', margin: 0 })
    s.addText(d, { x: 2.85, y, w: 4.6, h: 0.56, fontSize: 12.5, color: TEXT, fontFace: FONT, margin: 0 })
    y += 0.62
    rule(s, M, y - 0.14, 7.0)
  }
  s.addText('模型只决定何时调用、传什么参数；工具行为完全确定、可测试（25 个单元测试）。', { x: M, y: 5.62, w: 6.9, h: 0.8, fontSize: 14, color: MUTED, fontFace: FONT, margin: 0 })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.75, y: 1.75, w: 5.05, h: 4.9, fill: { color: '11141B' }, rectRadius: 0.09 })
  s.addText([
    { text: '{', options: { breakLine: true } },
    { text: '  "arxiv_id": "2210.03629",', options: { breakLine: true } },
    { text: '  "problem":  { "text": "中文总结",', options: { breakLine: true } },
    { text: '              "quotes": ["逐字原句"] },', options: { breakLine: true } },
    { text: '  "method":   { … },  "data": { … },', options: { breakLine: true } },
    { text: '  "metrics":  [{ "name": "ALFWorld 成功率",', options: { breakLine: true } },
    { text: '               "value": "71%",', options: { breakLine: true } },
    { text: '               "quote": "含该数字的原句" }],', options: { breakLine: true } },
    { text: '  "limitations": { … }', options: { breakLine: true } },
    { text: '}', options: {} },
  ], { x: 8.0, y: 2.0, w: 4.6, h: 4.4, fontSize: 13, color: 'D7DEED', fontFace: 'SF Mono', margin: 0, paraSpaceAfter: 3 })
  foot(s, 4)
}

/* ---------- 5 上下文裁剪 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'CONTEXT', '长论文怎么读：先看目录，再挑着读')
  stat(s, M + 0.2, 1.9, 3.6, '144 页', 'A Survey of LLMs，双栏排版', TEXT)
  s.addText('→', { x: 4.35, y: 2.15, w: 0.9, h: 0.8, fontSize: 40, color: PRIMARY, fontFace: FONT, margin: 0 })
  stat(s, 5.35, 1.9, 3.8, '35,773', '字符 · 13 次选读合计', ACCENT)
  s.addText('≈ 整篇正文的十分之一，远小于 12,000 词预算', { x: 9.3, y: 2.3, w: 3.5, h: 1.0, fontSize: 14, color: MUTED, fontFace: FONT, margin: 0 })
  rule(s, M, 4.1, W - 2 * M)
  const rows = [
    ['技能规定流程', 'list_sections 看目录 → 只挑问题/方法/实验/局限相关章节 → 每节 max_chars ≤ 12000'],
    ['不整篇灌入', 'References 与附录默认不读；截断时模型可加大 max_chars 重读'],
    ['实测', '模型自主选读 §3/§11/§12/§15/§21/§28/§38，write_note 退回后自己决定「补读 4 节再重交」'],
  ]
  let y = 4.45
  for (const [t, d] of rows) {
    s.addText(t, { x: M, y, w: 2.2, h: 0.7, fontSize: 15.5, bold: true, color: TEXT, fontFace: FONT, margin: 0 })
    s.addText(d, { x: 2.85, y, w: 9.4, h: 0.7, fontSize: 13.5, color: MUTED, fontFace: FONT, margin: 0 })
    y += 0.82
  }
  foot(s, 5)
}

/* ---------- 6 引用校验 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'GUARDRAIL', '引用校验：让「看起来对」变成「查得到」')
  s.addText([
    { text: '语料', options: { bold: true, color: PRIMARY_DK } },
    { text: ' = 摘要 + 全部 read_section 返回文本', options: {} },
  ], { x: M, y: 1.75, w: 12, h: 0.5, fontSize: 16, color: TEXT, fontFace: FONT, margin: 0 })
  const rules = [
    ['逐字包含', 'quote 与语料各自只合并空白字符后必须逐字命中——改一个数字、换一个 Unicode 变体都过不去'],
    ['最小长度', '引用 ≥ 8 字符，碎片化的「碰巧命中」不算依据'],
    ['整体退回', '任何一条不通过，整份笔记退回；模型按逐条错误清单补读或修正后重交'],
    ['引用定位', '通过的每条引用标注「来源：§章节，第 N 页」，可直接翻回原文核对'],
  ]
  let y = 2.3
  for (const [t, d] of rules) {
    s.addText(t, { x: M, y, w: 1.8, h: 0.62, fontSize: 15, bold: true, color: ACCENT, fontFace: FONT, margin: 0 })
    s.addText(d, { x: 2.5, y, w: 10.2, h: 0.62, fontSize: 13.5, color: TEXT, fontFace: FONT, margin: 0 })
    y += 0.74
    rule(s, M, y - 0.2, W - 2 * M)
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.35, w: W - 2 * M, h: 1.4, fill: { color: '11141B' }, rectRadius: 0.09 })
  s.addText([
    { text: '[write_note] 引用校验未通过（2 条问题），笔记未写入：', options: { breakLine: true, color: 'FF9E7A' } },
    { text: '1. metrics[0]：「The LoRA method achieves 99.9% accuracy …」—— 找不到这句', options: { breakLine: true, color: 'D7DEED' } },
    { text: '2. method.quotes[1]：「… so ∆W = BA is zero …」—— 找不到（∆ 与原文 Δ 字符不一致）', options: { color: 'D7DEED' } },
  ], { x: M + 0.3, y: 5.52, w: W - 2 * M - 0.6, h: 1.1, fontSize: 12.5, fontFace: 'SF Mono', margin: 0, paraSpaceAfter: 4 })
  foot(s, 6)
}

/* ---------- 7 评测表 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'EVALUATION', '评测：8 篇论文 + 摘要对照组')
  let header, body
  const rp = join(ROOT, 'eval/results.json')
  if (existsSync(rp)) {
    const rows = JSON.parse(readFileSync(rp, 'utf8'))
    const pct = (n, d) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`)
    header = ['arXiv', '笔记完整', '引用命中', '工具成功/次', '事实记号']
    body = rows.filter(r => r.group === '插件').map(r => [
      r.id, { text: r.complete ? '通过' : '未通过', options: { color: r.complete ? ACCENT : RED, bold: true } }, `${r.quoteHit}/${r.quoteTotal}（${pct(r.quoteHit, r.quoteTotal)}）`, `${r.toolOk}/${r.toolCalls}`, `${r.factMatched}/${r.factTotal}`,
    ])
  } else {
    header = ['arXiv', '笔记完整', '引用命中', '工具成功/次', '事实记号']
    body = [['（评测运行中，结果由 eval/run_eval.ts 写入）', '', '', '', '']]
  }
  s.addTable([header.map(t => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } })), ...body], {
    x: M, y: 1.62, w: W - 2 * M, fontSize: 12, fontFace: FONT, color: TEXT,
    border: { pt: 0.75, color: LINE }, fill: { color: CARD }, rowH: 0.30, valign: 'middle', margin: 0.05,
  })
  if (existsSync(rp)) {
    const rows = JSON.parse(readFileSync(rp, 'utf8'))
    const p = rows.filter(r => r.group === '插件')
    const c = rows.filter(r => r.group === '对照组')
    const sum = (rs, f) => rs.reduce((a, r) => a + f(r), 0)
    const pct = (n, d) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`)
    const pH = { hit: sum(p, r => r.quoteHit), tot: sum(p, r => r.quoteTotal) }
    const cH = { hit: sum(c, r => r.quoteHit), tot: sum(c, r => r.quoteTotal) }
    const pF = { m: sum(p, r => r.factMatched), t: sum(p, r => r.factTotal) }
    const cF = { m: sum(c, r => r.factMatched), t: sum(c, r => r.factTotal) }
    s.addTable([
      [{ text: '汇总对比', options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY_DK } } }, { text: '插件组（四工具+校验）', options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY_DK } } }, { text: '摘要对照组（无工具）', options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY_DK } } }],
      ['笔记六字段完整', `${p.filter(r => r.complete).length}/${p.length}`, `${c.filter(r => r.complete).length}/${c.length}`],
      ['引用逐字命中率', { text: `${pct(pH.hit, pH.tot)}（${pH.hit}/${pH.tot}）`, options: { bold: true, color: ACCENT } }, `${pct(cH.hit, cH.tot)}（${cH.hit}/${cH.tot}）`],
      ['事实关键记号', `${pct(pF.m, pF.t)}`, `${pct(cF.m, cF.t)}`],
      ['平均工具调用次数', `${(sum(p, r => r.toolCalls) / Math.max(1, p.length)).toFixed(1)} 次/篇`, '0（无工具）'],
    ], {
      x: M, y: 4.55, w: W - 2 * M, fontSize: 12, fontFace: FONT, color: TEXT,
      border: { pt: 0.75, color: LINE }, fill: { color: CARD }, rowH: 0.30, valign: 'middle', margin: 0.05, colW: [3.1, 4.6, 4.53],
    })
  }
  s.addText('引用命中 = 笔记 quote 对离线抽取原文做「仅合并空白后逐字包含」复核。事实记号 = 标准事实里的数字和名称是否出现在笔记中，千分位逗号先去掉。模型 DeepSeek-V4.1-Flash。', { x: M, y: 6.22, w: W - 2 * M, h: 0.55, fontSize: 11, color: MUTED, fontFace: FONT, margin: 0 })
  foot(s, 7)
}

/* ---------- 8 演示 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'DEMO', '一次真实运行：一句话 → 11 步 → 笔记落盘')
  s.addImage({ path: join(ROOT, 'site/assets/demo-react.png'), x: M, y: 1.7, w: 8.15, h: 4.58, sizing: { type: 'cover', w: 8.15, h: 4.58 } })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.0, y: 1.7, w: 3.8, h: 4.58, fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08 })
  s.addText([
    { text: '阅读 arXiv:2210.03629', options: { bold: true, breakLine: true } },
    { text: '（ReAct 论文）', options: { color: MUTED, breakLine: true } },
    { text: '', options: { breakLine: true } },
    { text: '1 轮 11 步 · 226 tok/s', options: { breakLine: true, bold: true, color: PRIMARY_DK } },
    { text: '19 条引用全部命中', options: { breakLine: true, color: ACCENT, bold: true } },
    { text: '上下文仅用 3%', options: { breakLine: true } },
    { text: '', options: { breakLine: true } },
    { text: 'notes/2210.03629.md', options: { color: MUTED } },
  ], { x: 9.25, y: 2.0, w: 3.3, h: 4.0, fontSize: 14.5, fontFace: FONT, margin: 0, paraSpaceAfter: 7 })
  foot(s, 8)
}

/* ---------- 9 一次失败案例 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'FAILURE', '失败案例：编造的 99.9% 走不进笔记')
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.8, w: 5.9, h: 4.4, fill: { color: 'FBEFEC' }, rectRadius: 0.09 })
  s.addText([
    { text: '第 1 次 write_note — 退回', options: { bold: true, color: RED, breakLine: true, fontSize: 16 } },
    { text: '', options: { breakLine: true } },
    { text: 'metrics[0].quote：', options: { breakLine: true, bold: true } },
    { text: '“The LoRA method achieves 99.9%', options: { breakLine: true } },
    { text: 'accuracy on all benchmarks”', options: { breakLine: true } },
    { text: '—— 语料中不存在，整份笔记不写盘', options: { color: MUTED, breakLine: true } },
    { text: '', options: { breakLine: true } },
    { text: '意外收获：另一条内容真实、但 ∆ 与原文 Δ 字符不一致的引用，同样被拒——校验比人眼严格。', options: { color: MUTED } },
  ], { x: M + 0.3, y: 2.05, w: 5.3, h: 3.9, fontSize: 13.5, fontFace: FONT, margin: 0, paraSpaceAfter: 6 })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 1.8, w: 5.9, h: 4.4, fill: { color: 'EAF6F0' }, rectRadius: 0.09 })
  s.addText([
    { text: '第 2 次 write_note — 通过', options: { bold: true, color: ACCENT, breakLine: true, fontSize: 16 } },
    { text: '', options: { breakLine: true } },
    { text: '换成摘要原句：', options: { breakLine: true, bold: true } },
    { text: '“LoRA can reduce the number of trainable', options: { breakLine: true } },
    { text: 'parameters by 10,000 times and the GPU', options: { breakLine: true } },
    { text: 'memory requirement by 3 times.”', options: { breakLine: true } },
    { text: '', options: { breakLine: true } },
    { text: '15 条引用全部命中 → notes/2106.09685.md 落盘。', options: { color: MUTED } },
  ], { x: 7.2, y: 2.05, w: 5.3, h: 3.9, fontSize: 13.5, fontFace: FONT, margin: 0, paraSpaceAfter: 6 })
  s.addText('工具轨迹（eval/traces/tool-calls.jsonl）：write_note 两次，第一次 ok:false，第二次 ok:true——「幻觉被拒绝」可被机械证明。', { x: M, y: 6.5, w: W - 2 * M, h: 0.5, fontSize: 12.5, color: MUTED, fontFace: FONT, margin: 0 })
  foot(s, 9)
}

/* ---------- 10 仓库和运行方式 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'REPRODUCE', '仓库与 30 分钟复现')
  const steps = [
    ['1', '克隆 Harness（浅克隆）并锁 commit 2e39e704；pnpm install（慢网用 npmmirror）'],
    ['2', 'pnpm run build —— 约 2 分钟'],
    ['3', '环境变量：DEEPSEEK_API_KEY（完全 DS 生态）；演示中亦验证智谱 GLM 路由可插拔'],
    ['4', 'pnpm dsh web --patch /绝对路径/plugin/cordis.yml（patch 同时把默认模型切到智谱）'],
    ['5', '网页对话产出笔记；评测复跑：node --import tsx eval/run_eval.ts'],
  ]
  let y = 1.8
  for (const [n, d] of steps) {
    s.addText(n, { x: M, y, w: 0.5, h: 0.62, fontSize: 20, bold: true, color: PRIMARY, fontFace: FONT, margin: 0 })
    s.addText(d, { x: 1.15, y, w: 11.3, h: 0.62, fontSize: 14.5, color: TEXT, fontFace: FONT, margin: 0 })
    y += 0.76
    rule(s, M, y - 0.18, W - 2 * M)
  }
  s.addText([
    { text: '仓库结构：', options: { bold: true } },
    { text: 'plugin/（cordis.yml + 6 工具 + 技能，依赖 link: 指向本地 Harness 工作区包） · eval/（papers.jsonl、run_eval.ts、轨迹） · notes/（产出的笔记） · site/（展示网站 + 笔记库） · docs/', options: { color: MUTED } },
  ], { x: M, y: 5.85, w: W - 2 * M, h: 0.9, fontSize: 13.5, fontFace: FONT, margin: 0 })
  foot(s, 10)
}

/* ---------- 11 可以继续做成毕设 ---------- */
{
  const s = pres.addSlide()
  pageHeader(s, 'NEXT', '可以继续做成毕业设计的部分')
  const cols = [
    ['原生插件化', '打包成 dsh bundle：自带工具/技能/智谱路由配置，dsh plugin add 一条命令安装，用户只填自己的 API Key。路线图见 docs/native-plugin-roadmap.md'],
    ['更严的评测', '扩大论文池与模型池（DeepSeek / GLM / R1 等）；引用核对从「子串命中」升级为语义蕴含判定；加摘要对照组的多种提示强度'],
    ['复现实验清单', '对一篇论文生成「数据 / 命令 / 期望指标」清单，并用工具链核对每个期望指标确实出自论文'],
  ]
  cols.forEach(([t, d], i) => {
    const x = M + i * 4.18
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.9, w: 3.9, h: 4.1, fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.09, shadow: { type: 'outer', color: '000000', blur: 6, offset: 2, angle: 90, opacity: 0.12 } })
    s.addText(t, { x: x + 0.28, y: 2.15, w: 3.3, h: 0.5, fontSize: 17.5, bold: true, color: PRIMARY_DK, fontFace: FONT, margin: 0 })
    s.addText(d, { x: x + 0.28, y: 2.75, w: 3.35, h: 3.0, fontSize: 13.5, color: TEXT, fontFace: FONT, margin: 0 })
  })
  foot(s, 11)
}

/* ---------- 12 总结（深色） ---------- */
{
  const s = pres.addSlide()
  s.background = { color: BG_DARK }
  s.addText('总结', { x: M, y: 0.7, w: 6, h: 0.9, fontSize: 40, bold: true, color: 'FFFFFF', fontFace: FONT, margin: 0 })
  const rows = [
    ['做成了', '一个可用的 Agent 产品 Demo：挂载于 Harness 的论文阅读插件，六个工具 + 技能 + 引用校验，网页一句话到笔记落盘，公网笔记库与评测全部在线'],
    ['证明了', '带工具与引用校验的笔记，每条依据都能被机械验证，编造指标会被退回——摘要对照组给出对照数字；同一插件在 DeepSeek 与智谱 GLM 双模型上均跑通'],
    ['留下了', '可复现的评测集与轨迹、25 个单元测试、公网笔记库与评测、展示网站与本文档；下一阶段可做语义级校验与检索式精读'],
  ]
  let y = 1.9
  for (const [t, d] of rows) {
    s.addText(t, { x: M, y, w: 1.7, h: 0.9, fontSize: 19, bold: true, color: '8FA3FF', fontFace: FONT, margin: 0 })
    s.addText(d, { x: 2.5, y, w: 10.2, h: 0.9, fontSize: 15.5, color: 'E8EAF0', fontFace: FONT, margin: 0 })
    y += 1.12
    s.addShape(pres.shapes.LINE, { x: M, y: y - 0.3, w: W - 2 * M, h: 0, line: { color: '2A2F3C', width: 1 } })
  }
  s.addText('谢谢观看 · 演示与复现步骤见 README 与展示网站', { x: M, y: 6.3, w: 10, h: 0.5, fontSize: 15, color: '8B93A5', fontFace: FONT, margin: 0 })
}

pres.writeFile({ fileName: join(ROOT, 'docs/答辩PPT.pptx') }).then(() => console.log('PPT 已生成 docs/答辩PPT.pptx'))
