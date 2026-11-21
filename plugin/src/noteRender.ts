/**
 * 通过校验的笔记 → Markdown 落盘内容。展示网站与答辩直接用这份文件。
 */

import type { PaperNote } from './noteSchema.ts'
import { normalizeWs } from './quoteCheck.ts'

function renderField(title: string, field: { text: string; quotes: string[] }): string {
  const lines = [`## ${title}`, '', field.text.trim(), '']
  if (field.quotes.length > 0) lines.push('**原文依据**', '')
  for (const q of field.quotes) lines.push(`> ${normalizeWs(q)}`, '')
  return lines.join('\n')
}

export function noteToMarkdown(note: PaperNote, meta: { authors: string[]; pageCount: number; generatedAt: Date }): string {
  const head = [
    `# ${note.title.trim()}`,
    '',
    `> arXiv:[${note.arxiv_id}](https://arxiv.org/abs/${note.arxiv_id}) · ${meta.authors.join(', ') || '作者未知'} · ${meta.pageCount} 页`,
    `> 由 Harness 插件「论文领航」生成于 ${meta.generatedAt.toISOString().slice(0, 16).replace('T', ' ')}，全部引用经 write_note 逐字校验（仅合并空白）`,
    '',
  ].join('\n')

  const metricRows = note.metrics.map(m => {
    const quote = normalizeWs(m.quote)
    const short = quote.length > 120 ? quote.slice(0, 117) + '…' : quote
    return `| ${m.name} | ${m.value} | ${short} |`
  }).join('\n')

  const metrics = [
    '## 指标',
    '',
    '| 指标 | 数值 | 原文依据（截取） |',
    '| --- | --- | --- |',
    metricRows,
    '',
  ].join('\n')

  return [head, renderField('问题', note.problem!), renderField('方法', note.method!), renderField('数据', note.data!), metrics, renderField('局限', note.limitations!)].join('\n')
}
