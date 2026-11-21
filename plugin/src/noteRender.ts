/**
 * 通过校验的笔记 → Markdown 落盘内容。展示网站与答辩直接用这份文件。
 */

import type { PaperNote } from './noteSchema.ts'
import { normalizeWs } from './quoteCheck.ts'

/** 结构图节点文字：去掉会打断 mermaid 的符号，并收成一句。 */
function diagramLabel(text: string): string {
  const flat = text.replace(/\s+/g, ' ').replace(/["`[\]{}#]/g, '').trim()
  const clause = flat.split(/[。；]/)[0] ?? flat
  return clause.length <= 36 ? clause : `${clause.slice(0, 36)}…`
}

function structureDiagram(note: PaperNote): string {
  const metric = note.metrics.map(m => m.value).slice(0, 3).join(' / ')
  const node = (id: string, title: string, text: string) => `  ${id}["${title}：${diagramLabel(text)}"]`
  return [
    '## 结构',
    '',
    '```mermaid',
    'flowchart TB',
    node('q', '问题', note.problem.text),
    node('m', '方法', note.method.text),
    node('d', '数据', note.data.text),
    node('k', '指标', metric || '见下表'),
    node('l', '局限', note.limitations.text),
    '  q --> m --> d --> k --> l',
    '```',
    '',
  ].join('\n')
}

function renderField(title: string, field: { text: string; quotes: string[] }, locate?: (q: string) => string | undefined): string {
  const lines = [`## ${title}`, '', field.text.trim(), '']
  if (field.quotes.length > 0) lines.push('**原文依据**', '')
  for (const q of field.quotes) {
    const loc = locate?.(q)
    lines.push(`> ${normalizeWs(q)}${loc ? `（来源：${loc}）` : ''}`, '')
  }
  return lines.join('\n')
}

export function noteToMarkdown(
  note: PaperNote,
  meta: { authors: string[]; pageCount: number; generatedAt: Date; locate?: (q: string) => string | undefined },
): string {
  const head = [
    `# ${note.title.trim()}`,
    '',
    `> arXiv:[${note.arxiv_id}](https://arxiv.org/abs/${note.arxiv_id}) · ${meta.authors.join(', ') || '作者未知'} · ${meta.pageCount} 页`,
    `> 由 Harness 插件「论文领航」生成于 ${meta.generatedAt.toISOString().slice(0, 16).replace('T', ' ')}，全部引用经 write_note 逐字校验（仅合并空白）`,
    '',
  ].join('\n')

  const metricRows = note.metrics.map(m => {
    const quote = normalizeWs(m.quote)
    const loc = meta.locate?.(m.quote)
    const short = quote.length > 120 ? quote.slice(0, 117) + '…' : quote
    return `| ${m.name} | ${m.value} | ${short}${loc ? `（${loc}）` : ''} |`
  }).join('\n')

  const metrics = [
    '## 指标',
    '',
    '| 指标 | 数值 | 原文依据（截取） |',
    '| --- | --- | --- |',
    metricRows,
    '',
  ].join('\n')

  return [head, structureDiagram(note), renderField('问题', note.problem!, meta.locate), renderField('方法', note.method!, meta.locate), renderField('数据', note.data!, meta.locate), metrics, renderField('局限', note.limitations!, meta.locate)].join('\n')
}
