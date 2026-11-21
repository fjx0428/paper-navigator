/**
 * 对照阅读页：左边翻本地渲好的论文页，右边是思维导图、论文插图和笔记。
 * 用法：node --import tsx eval/render_reader.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PaperNote } from '../plugin/src/noteSchema.ts'

const ROOT = '/Users/leiyu/学科实践大作业'
const NOTES = join(ROOT, 'notes')
const manifestPath = join(ROOT, 'site/assets/papers/manifest.json')

const ids = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, { pages: number; figures: Array<{ file: string; page: number }> }>
const notes = Object.keys(ids)
  .map(id => JSON.parse(readFileSync(join(NOTES, `${id}.json`), 'utf8')) as PaperNote)
  .sort((a, b) => a.arxiv_id.localeCompare(b.arxiv_id))

const payload = JSON.stringify({ notes, papers: ids }).replace(/</g, '\\u003c')

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>对照阅读 · 论文领航</title>
<link rel="stylesheet" href="style.css">
</head>
<body class="reader">
<header class="site">
  <a class="logo" href="index.html">论文<span>领航</span></a>
  <nav>
    <a href="index.html">首页</a>
    <a href="architecture.html">架构</a>
    <a href="demo.html">演示</a>
    <a href="survey.html">调研</a>
    <a href="read.html" class="active">阅读</a>
    <a href="models.html">模型</a>
    <a href="eval.html">评测</a>
    <a href="run.html">运行</a>
  </nav>
</header>
<div class="split">
  <section class="pdf-pane">
    <div class="pdf-bar">
      <button type="button" id="prev">上一页</button>
      <span id="pager">1</span>
      <button type="button" id="next">下一页</button>
      <label>跳到 <input id="jump" type="number" min="1" value="1"></label>
    </div>
    <div class="pdf-stage" id="stage"><img id="page" alt="论文当前页"></div>
  </section>
  <section class="note-pane" id="note"></section>
</div>
<script>
const DATA = ${payload}
const params = new URLSearchParams(location.search)
const requested = params.get('id')
const note = DATA.notes.find(n => n.arxiv_id === requested) || DATA.notes[0]
const paper = DATA.papers[note.arxiv_id]
let pageNum = 1

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function clause(s, n) {
  const t = String(s).replace(/\\s+/g, ' ').trim()
  const cut = t.split(/[。；]/)[0] || t
  return cut.length <= n ? cut : cut.slice(0, n) + '…'
}
function singlePercent(value) {
  const marks = String(value).match(/%/g)
  if (!marks || marks.length !== 1) return null
  const m = String(value).match(/(\\d+(?:\\.\\d+)?)\\s*%/)
  if (!m) return null
  const num = Number(m[1])
  return num >= 0 && num <= 100 ? num : null
}
function pad(n) { return String(n).padStart(3, '0') }
function pageSrc(n) { return 'assets/papers/' + note.arxiv_id + '/p' + pad(n) + '.jpg' }

const branches = [
  ['问题', clause(note.problem.text, 46)],
  ['方法', clause(note.method.text, 46)],
  ['数据', clause(note.data.text, 46)],
  ['指标', note.metrics.slice(0, 2).map(m => m.value).join(' · ') || '—'],
  ['局限', clause(note.limitations.text, 46)],
]
const meters = note.metrics.map(m => {
  const pct = singlePercent(m.value)
  const bar = pct == null ? '' : '<i style="width:' + pct + '%"></i>'
  return '<div class="meter">' + bar + '<b>' + esc(m.value) + '</b><span>' + esc(m.name) + '</span><blockquote>' + esc(m.quote) + '</blockquote></div>'
}).join('')
const figs = (paper.figures || []).map(fig =>
  '<button type="button" class="fig" data-page="' + fig.page + '"><img src="assets/papers/' + note.arxiv_id + '/' + fig.file + '" alt="第 ' + fig.page + ' 页插图"><span>第 ' + fig.page + ' 页</span></button>'
).join('')
const figBlock = figs
  ? '<h2>论文里的图</h2><p class="lead">从 PDF 里抽出的较大插图。点一张，左边翻到它所在的那一页。</p><div class="figs">' + figs + '</div>'
  : ''

function field(title, block, anchor) {
  const quotes = (block.quotes || []).map(q => '<blockquote>' + esc(q) + '</blockquote>').join('')
  return '<div id="' + anchor + '"><h2>' + title + '</h2><p>' + esc(block.text) + '</p>' + quotes + '</div>'
}

document.title = note.arxiv_id + ' · 对照阅读'
document.getElementById('note').innerHTML =
  '<p class="kicker">arXiv ' + esc(note.arxiv_id) + ' · ' + paper.pages + ' 页</p>' +
  '<h1>' + esc(note.title) + '</h1>' +
  '<div class="map" aria-label="笔记思维导图">' +
    '<div class="map-side">' +
      branches.slice(0, 2).map((b, i) => '<a class="twig" href="#sec-' + i + '"><b>' + b[0] + '</b><span>' + esc(b[1]) + '</span></a>').join('') +
    '</div>' +
    '<div class="map-core">' + esc(clause(note.title, 42)) + '</div>' +
    '<div class="map-side">' +
      branches.slice(2).map((b, i) => '<a class="twig" href="#sec-' + (i + 2) + '"><b>' + b[0] + '</b><span>' + esc(b[1]) + '</span></a>').join('') +
    '</div>' +
  '</div>' +
  figBlock +
  '<h2>指标</h2><div class="meters">' + meters + '</div>' +
  field('问题', note.problem, 'sec-0') +
  field('方法', note.method, 'sec-1') +
  field('数据', note.data, 'sec-2') +
  '<div id="sec-3"></div>' +
  field('局限', note.limitations, 'sec-4')

const img = document.getElementById('page')
const pager = document.getElementById('pager')
const jump = document.getElementById('jump')
jump.max = String(paper.pages)

function show(n) {
  pageNum = Math.min(paper.pages, Math.max(1, n))
  img.src = pageSrc(pageNum)
  pager.textContent = pageNum + ' / ' + paper.pages
  jump.value = String(pageNum)
}
document.getElementById('prev').onclick = () => show(pageNum - 1)
document.getElementById('next').onclick = () => show(pageNum + 1)
jump.onchange = () => show(Number(jump.value))
document.querySelectorAll('.fig').forEach(btn => {
  btn.onclick = () => show(Number(btn.dataset.page))
})
document.addEventListener('keydown', ev => {
  if (ev.target === jump) return
  if (ev.key === 'ArrowLeft') show(pageNum - 1)
  if (ev.key === 'ArrowRight') show(pageNum + 1)
})
show(1)
</script>
</body>
</html>
`

writeFileSync(join(ROOT, 'site/read.html'), html)
console.log(`已生成 site/read.html（${notes.length} 篇）`)
