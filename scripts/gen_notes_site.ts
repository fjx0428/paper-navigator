/**
 * 笔记库生成器：读 notes/*.json，为每篇笔记渲染独立 HTML 页 + 一个索引页，
 * 收进 site/notes/。公网部署后访客可直接浏览全部真实笔记（修复 read.html
 * 在静态站上无数据的问题）。
 * 用法：node --import tsx scripts/gen_notes_site.ts
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '/Users/leiyu/学科实践大作业'
const NOTES = join(ROOT, 'notes')
const OUT = join(ROOT, 'site/notes')

interface NoteSection { text: string; quotes: string[] }
interface NoteMetric { name: string; value: string; quote: string }
interface PaperNote {
  arxiv_id: string
  title: string
  problem: NoteSection
  method: NoteSection
  data: NoteSection
  metrics: NoteMetric[]
  limitations: NoteSection
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function section(title: string, field: NoteSection | undefined): string {
  if (!field) return ''
  const quotes = (field.quotes ?? []).map(q => `<blockquote>${esc(q)}</blockquote>`).join('\n')
  return `<section class="note-sec"><h2>${esc(title)}</h2><p>${esc(field.text ?? '')}</p>${field.quotes?.length ? `<h3>原文依据</h3>\n${quotes}` : ''}</section>`
}

function notePage(note: PaperNote): string {
  const metricRows = (note.metrics ?? []).map(m =>
    `<tr><td>${esc(m.name)}</td><td><b>${esc(m.value)}</b></td><td>${esc(m.quote)}</td></tr>`).join('\n')
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(note.title)} · 论文领航笔记</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="notes.css">
</head>
<body>
<header class="site">
  <a class="logo" href="../index.html">论文<span>领航</span></a>
  <nav>
    <a href="../index.html">首页</a>
    <a href="../architecture.html">架构</a>
    <a href="../demo.html">演示</a>
    <a href="index.html" class="active">笔记</a>
    <a href="../eval.html">评测</a>
    <a href="../run.html">运行</a>
  </nav>
</header>
<main>
  <h1>${esc(note.title)}</h1>
  <p class="lead">arXiv:<a href="https://arxiv.org/abs/${esc(note.arxiv_id)}">${esc(note.arxiv_id)}</a> · 由论文领航插件自动生成，全部引用经 write_note 逐字校验（仅合并空白）</p>
  ${section('问题', note.problem)}
  ${section('方法', note.method)}
  ${section('数据', note.data)}
  <section class="note-sec"><h2>指标</h2>
  <table><tr><th>指标</th><th>数值</th><th>原文依据</th></tr>
  ${metricRows}
  </table></section>
  ${section('局限', note.limitations)}
  <p><a href="index.html">← 返回笔记库</a> · <a href="https://arxiv.org/pdf/${esc(note.arxiv_id)}">原文 PDF ↗</a></p>
  <footer>厦门大学信息学院 · 学科实践三期末项目 · <a href="https://github.com/fjx0428/paper-navigator">GitHub</a> · <a href="https://paper-navigator-2m06.zai.site">在线演示说明</a></footer>
</main>
</body>
</html>
`
}

function firstMetric(note: PaperNote): string {
  return note.metrics?.[0] ? `${note.metrics[0]!.name} = ${note.metrics[0]!.value}` : '—'
}

function main() {
  const files = readdirSync(NOTES).filter(f => f.endsWith('.json')).sort()
  mkdirSync(OUT, { recursive: true })
  const cards: string[] = []
  for (const f of files) {
    const note = JSON.parse(readFileSync(join(NOTES, f), 'utf8')) as PaperNote
    const id = note.arxiv_id || f.replace(/\.json$/, '')
    writeFileSync(join(OUT, `${id}.html`), notePage(note))
    const quoteCount = (note.problem?.quotes?.length ?? 0) + (note.method?.quotes?.length ?? 0)
      + (note.data?.quotes?.length ?? 0) + (note.limitations?.quotes?.length ?? 0) + (note.metrics?.length ?? 0)
    cards.push(`    <a class="note-card" href="${id}.html">
      <b>${esc(note.title)}</b>
      <small>arXiv:${esc(id)} · ${quoteCount} 条已校验引用 · 主指标：${esc(firstMetric(note))}</small>
    </a>`)
  }
  const index = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>笔记库 · 论文领航</title>
<link rel="stylesheet" href="../style.css">
<link rel="stylesheet" href="notes.css">
</head>
<body>
<header class="site">
  <a class="logo" href="../index.html">论文<span>领航</span></a>
  <nav>
    <a href="../index.html">首页</a>
    <a href="../architecture.html">架构</a>
    <a href="../demo.html">演示</a>
    <a href="index.html" class="active">笔记</a>
    <a href="../eval.html">评测</a>
    <a href="../run.html">运行</a>
  </nav>
</header>
<main>
  <h1>笔记库</h1>
  <p class="lead">以下 ${files.length} 份笔记全部由插件自动生成：真实运行产物，每条引用经 write_note 逐字校验。点开任意一篇，看「问题 → 方法 → 数据 → 指标 → 局限」的结构化总结和逐条原文依据。</p>
  <div class="note-grid">
${cards.join('\n')}
  </div>
  <footer>厦门大学信息学院 · 学科实践三期末项目 · <a href="https://github.com/fjx0428/paper-navigator">GitHub</a></footer>
</main>
</body>
</html>
`
  writeFileSync(join(OUT, 'index.html'), index)
  console.log(`笔记库已生成：${files.length} 篇 → site/notes/`)
}

main()
