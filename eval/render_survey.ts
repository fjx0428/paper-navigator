/**
 * 从已落盘笔记生成调研页。格子里的句子来自笔记 JSON，不另写一版摘要。
 * 用法：node --import tsx eval/render_survey.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PaperNote } from '../plugin/src/noteSchema.ts'

const ROOT = '/Users/leiyu/学科实践大作业'
const NOTES = join(ROOT, 'notes')
const PAIR = ['2605.23717', '2610.03924']

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function flat(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function load(id: string): PaperNote | undefined {
  try {
    return JSON.parse(readFileSync(join(NOTES, `${id}.json`), 'utf8')) as PaperNote
  } catch {
    return undefined
  }
}

function metrics(note: PaperNote): string {
  return note.metrics.slice(0, 3).map(m => `${esc(m.name)} ${esc(m.value)}`).join('<br>')
}

function clause(text: string): string {
  const cut = (flat(text).split(/[。；]/)[0] ?? flat(text))
  return cut.length <= 52 ? cut : `${cut.slice(0, 52)}…`
}

/** 只有单一百分数才画条，避免把 0.29 m/s 和 74% 画到同一根轴上。 */
function singlePercent(value: string): number | undefined {
  const marks = value.match(/%/g)
  if (!marks || marks.length !== 1) return undefined
  const n = Number(value.match(/(\d+(?:\.\d+)?)\s*%/)?.[1])
  if (!Number.isFinite(n) || n < 0 || n > 100) return undefined
  return n
}

function board(note: PaperNote): string {
  const steps: Array<[string, string]> = [
    ['问题', clause(note.problem.text)],
    ['方法', clause(note.method.text)],
    ['数据', clause(note.data.text)],
    ['指标', note.metrics.slice(0, 2).map(m => m.value).join(' · ') || '—'],
    ['局限', clause(note.limitations.text)],
  ]
  const spine = steps.map(([k, v]) => `<li><b>${k}</b><span>${esc(v)}</span></li>`).join('')
  const meters = note.metrics.slice(0, 4).map(m => {
    const pct = singlePercent(m.value)
    const bar = pct === undefined ? '' : `<i style="width:${pct}%"></i>`
    return `<div class="meter">${bar}<b>${esc(m.value)}</b><span>${esc(m.name)}</span></div>`
  }).join('')
  return `<article class="board"><h3><a href="read.html?id=${esc(note.arxiv_id)}">${esc(note.arxiv_id)}</a></h3><p class="board-title">${esc(note.title)}</p><ol class="spine">${spine}</ol><div class="meters">${meters}</div><p><a href="read.html?id=${esc(note.arxiv_id)}">左边看论文，右边看笔记</a></p></article>`
}

function cell(text: string): string {
  const t = flat(text)
  const shown = t.length <= 280 ? t : `${t.slice(0, 280)}…`
  return esc(shown)
}

function main() {
  const ids = readdirSync(NOTES)
    .filter(name => /^\d{4}\.\d{4,5}\.json$/.test(name))
    .map(name => name.replace(/\.json$/, ''))
    .sort()
  const notes = ids.map(id => load(id)).filter((n): n is PaperNote => Boolean(n))
  const pair = PAIR.map(id => load(id)).filter((n): n is PaperNote => Boolean(n))

  const axes: Array<[string, (n: PaperNote) => string]> = [
    ['问题', n => cell(n.problem.text)],
    ['方法', n => cell(n.method.text)],
    ['数据', n => cell(n.data.text)],
    ['指标', n => metrics(n)],
    ['局限', n => cell(n.limitations.text)],
  ]
  const head = pair.map(n => `<th>${esc(n.arxiv_id)}<br>${esc(n.title)}</th>`).join('')
  const rows = axes.map(([axis, pick]) =>
    `<tr><td>${axis}</td>${pair.map(n => `<td>${pick(n)}</td>`).join('')}</tr>`,
  ).join('\n')

  const library = notes.map(n =>
    `<li><a href="read.html?id=${esc(n.arxiv_id)}">${esc(n.arxiv_id)}</a> ${esc(n.title)}<p>${esc(flat(n.problem.text).slice(0, 140))}${flat(n.problem.text).length > 140 ? '…' : ''}</p></li>`,
  ).join('\n')

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>调研 · 论文领航</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site">
  <a class="logo" href="index.html">论文<span>领航</span></a>
  <nav>
    <a href="index.html">首页</a>
    <a href="architecture.html">架构</a>
    <a href="demo.html">演示</a>
    <a href="survey.html" class="active">调研</a>
    <a href="read.html">阅读</a>
    <a href="models.html">模型</a>
    <a href="eval.html">评测</a>
    <a href="run.html">运行</a>
  </nav>
</header>
<main>
  <h1>从题目到对照</h1>
  <p class="lead">科研阅读不是把一篇论文缩成一段话。先按主题检索，再逐篇精读并拦住编造的引用，最后把已经落盘的笔记按同一组问题摊开：各自在解决什么、用什么方法、数据从哪来、指标是多少、还没做到哪。</p>

  <h2>一对姊妹论文</h2>
  <p>后一篇引用了前一篇，但成功定义不同，百分比不能画在同一根轴上。每张卡片是一条结构：问题走到局限。带百分号且只有一个数字的指标才画成长条。</p>
  <div class="boards">
    ${pair.map(board).join('\n')}
  </div>
  <h2>逐字段对照</h2>
  <p>格子里的中文是插件写进 <code>notes/*.json</code> 的句子，不是另写的摘要。</p>
  <div class="table-scroll"><table class="compare">
    <tr><th></th>${head}</tr>
    ${rows}
  </table></div>
  <p>读的时候把两列分开看。左边部署时不估计平台状态，动作是姿态和推力。右边用循环策略看甲板相对状态，余量不够就中止重试。两边的成功定义不一样，百分比不能横比。</p>

  <h2>已经读过的 ${notes.length} 篇</h2>
  <ul class="note-list">
    ${library}
  </ul>
  <p>对话里说「对比 2605.23717 和 2610.03924」，插件会调用 <code>compare_notes</code>，只把这些字段交回模型。模型补不了笔记里没有的数字。</p>

  <footer>厦门大学信息学院 · 学科实践三期末项目 · 本页只排版已经落盘的笔记 · 2026-11</footer>
</main>
</body>
</html>
`
  writeFileSync(join(ROOT, 'site/survey.html'), html)
  console.log(`已生成 site/survey.html（${notes.length} 篇，对照 ${pair.length} 篇）`)
}

main()
