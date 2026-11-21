/**
 * 从 eval/results.json 生成 site/eval.html（展示网站的评测页）。
 * 用法：node --import tsx eval/render_site.ts
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

const pct = (n: number, d: number) => (d === 0 ? '—' : `${Math.round((n / d) * 100)}%`)

function table(rows: Row[]): string {
  const head = '<tr><th>arXiv</th><th>论文</th><th>笔记完整</th><th>引用命中</th><th>工具成功/次数</th><th>事实记号</th></tr>'
  const body = rows.map(r => {
    const okCell = r.complete ? '<span class="ok">✅</span>' : `<span class="bad">❌ 缺 ${r.missing.join('/')}</span>`
    const tool = r.group === '插件' ? `${r.toolOk}/${r.toolCalls}` : '—'
    const title = r.title.length > 40 ? r.title.slice(0, 40) + '…' : r.title
    return `<tr><td><a href="https://arxiv.org/abs/${r.id}">${r.id}</a></td><td>${title}</td><td>${okCell}</td><td>${r.quoteHit}/${r.quoteTotal}（${pct(r.quoteHit, r.quoteTotal)}）</td><td>${tool}</td><td>${r.factMatched}/${r.factTotal}</td></tr>`
  }).join('\n')
  return `<div class="table-scroll"><table>\n${head}\n${body}\n</table></div>`
}

/** 逐篇分组柱状图（SVG）：插件组 vs 摘要对照组 */
function groupedChart(rows: Row[], metric: (r: Row) => number, title: string): string {
  const p = rows.filter(r => r.group === '插件')
  const c = new Map(rows.filter(r => r.group === '对照组').map(r => [r.id, r]))
  const barW = 16, gap = 8, groupPad = 30, H = 150
  const W = p.length * (barW * 2 + gap + groupPad) + groupPad
  let bars = ''
  p.forEach((r, i) => {
    const x0 = groupPad + i * (barW * 2 + gap + groupPad)
    const cr = c.get(r.id)
    const pv = Math.round(metric(r))
    const cv = cr ? Math.round(metric(cr)) : 0
    const ph = (pv / 100) * H, ch = (cv / 100) * H
    bars += `<rect x="${x0}" y="${H - ph}" width="${barW}" height="${ph}" rx="3" fill="#4D6BFE"><title>插件组 ${pv}%</title></rect>`
    bars += `<rect x="${x0 + barW + gap}" y="${H - ch}" width="${barW}" height="${ch}" rx="3" fill="#5a6478"><title>对照组 ${cv}%</title></rect>`
    bars += `<text x="${x0 + barW + gap / 2}" y="${H - Math.max(ph, ch) - 6}" font-size="10" fill="#9aa3b2" text-anchor="middle">${pv}</text>`
    bars += `<text x="${x0 + barW + gap / 2}" y="${H + 14}" font-size="10" fill="#9aa3b2" text-anchor="middle">${r.id}</text>`
  })
  return `<div class="chart-wrap"><h3>${title}</h3><div class="chart-legend"><span><span class="swatch" style="background:#4D6BFE"></span>插件组</span><span><span class="swatch" style="background:#5a6478"></span>摘要对照组</span></div><svg viewBox="0 0 ${W} ${H + 24}" width="100%" role="img">${bars}</svg></div>`
}

function main() {
  const rows = JSON.parse(readFileSync(join(ROOT, 'eval/results.json'), 'utf8')) as Row[]
  const p = rows.filter(r => r.group === '插件')
  const c = rows.filter(r => r.group === '对照组')
  const sum = (rs: Row[], f: (r: Row) => number) => rs.reduce((a, r) => a + f(r), 0)
  const pH = { hit: sum(p, r => r.quoteHit), tot: sum(p, r => r.quoteTotal) }
  const cH = { hit: sum(c, r => r.quoteHit), tot: sum(c, r => r.quoteTotal) }
  const pF = { m: sum(p, r => r.factMatched), t: sum(p, r => r.factTotal) }
  const cF = { m: sum(c, r => r.factMatched), t: sum(c, r => r.factTotal) }
  const avgCalls = (sum(p, r => r.toolCalls) / Math.max(1, p.length)).toFixed(1)
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>评测 · 论文领航</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site">
  <a class="logo" href="index.html">论文<span>领航</span></a>
  <nav>
    <a href="index.html">首页</a>
    <a href="architecture.html">架构</a>
    <a href="demo.html">演示</a>
    <a href="notes/index.html">笔记</a>
    <a href="survey.html">调研</a>
    <a href="read.html">阅读</a>
    <a href="models.html">模型</a>
    <a href="eval.html" class="active">评测</a>
    <a href="run.html">运行</a>
  </nav>
</header>
<main>
  <h1>评测：8 篇论文 + 摘要对照组</h1>
  <p class="lead">插件组 = 完整四工具链 + 引用校验；对照组 = 同一批论文，只在提示里贴摘要、不提供任何工具，要求按同一笔记结构产出并给出主指标。模型 DeepSeek-V4.1-Flash，${now} 运行。复跑命令见<a href="run.html">运行页</a>。</p>

  <h2>汇总对比</h2>
  <div class="table-scroll"><table>
    <tr><th>指标</th><th>插件组（四工具 + 校验）</th><th>摘要对照组（无工具）</th></tr>
    <tr><td>笔记六字段完整</td><td>${p.filter(r => r.complete).length}/${p.length}</td><td>${c.filter(r => r.complete).length}/${c.length}</td></tr>
    <tr><td>引用逐字命中率</td><td><b>${pct(pH.hit, pH.tot)}</b>（${pH.hit}/${pH.tot}）</td><td>${pct(cH.hit, cH.tot)}（${cH.hit}/${cH.tot}）</td></tr>
    <tr><td>事实关键记号命中</td><td>${pct(pF.m, pF.t)}</td><td>${pct(cF.m, cF.t)}</td></tr>
    <tr><td>平均工具调用次数</td><td>${avgCalls} 次/篇</td><td>0（无工具）</td></tr>
  </table></div>

  <h2>逐篇对比</h2>
  ${groupedChart(rows, r => (r.quoteTotal > 0 ? (r.quoteHit / r.quoteTotal) * 100 : 0), '引用逐字命中率（%）')}
  ${groupedChart(rows, r => (r.factTotal > 0 ? (r.factMatched / r.factTotal) * 100 : 0), '事实关键记号命中（%）')}

  <h2>插件组明细</h2>
  ${table(p)}

  <h2>摘要对照组明细</h2>
  ${table(c)}

  <h2>口径说明</h2>
  <div class="card">
    <b>引用逐字命中</b>：笔记里每条 quote 与离线抽取的论文全文（与插件同一套 PDF 抽取代码）做「仅合并空白后逐字包含」比对。写入时 <code>write_note</code> 已挡过一次，此处是对最终落盘内容的独立复核。<br><br>
    <b>事实关键记号</b>：自动从每篇 3 个标准事实（<code>eval/papers.jsonl</code>）抽出关键记号（数字、方法名、数据集名），检查是否出现在笔记 JSON 中。比对前会去掉数字里的千分位逗号。这是近似核对，单篇记号未命中不等于事实错误。<br><br>
    <b>工具调用统计</b>来自插件轨迹 <code>eval/traces/tool-calls.jsonl</code>（每次调用一行 JSONL）。对照组按实验设计不给工具，记 0。
  </div>

  <h2>长论文裁剪（不进评测表）</h2>
  <p>2303.18223《A Survey of Large Language Models》共 <b>144 页</b>：模型按目录挑读 13 次、合计 35,773 字符（约为整篇正文十分之一），write_note 退回一次后补读通过——上下文裁剪与失败重试的验收记录见<a href="demo.html">演示页</a>。</p>

  <footer>厦门大学信息学院 · 学科实践三期末项目 · Harness commit <code>2e39e704</code> · 2026-11</footer>
</main>
</body>
</html>
`
  writeFileSync(join(ROOT, 'site/eval.html'), html)
  console.log('已生成 site/eval.html')
}

main()
