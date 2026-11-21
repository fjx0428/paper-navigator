/**
 * 把已经落盘的笔记收成对照文本。不调用模型，也不补笔记里没有的数字。
 */

import type { PaperNote } from './noteSchema.ts'

function clip(text: string, max = 360): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= max ? flat : `${flat.slice(0, max)}…`
}

function metricsLine(note: PaperNote): string {
  if (!note.metrics?.length) return '（笔记里没有指标）'
  return note.metrics
    .slice(0, 4)
    .map(m => `${m.name}：${m.value}`)
    .join('；')
}

/** 一篇笔记压成对照用的五行。 */
export function compareLines(note: PaperNote): Array<[string, string]> {
  return [
    ['问题', clip(note.problem?.text ?? '')],
    ['方法', clip(note.method?.text ?? '')],
    ['数据', clip(note.data?.text ?? '')],
    ['指标', metricsLine(note)],
    ['局限', clip(note.limitations?.text ?? '')],
  ]
}

/** 多篇笔记的对照。只有一篇时仍然列出，方便模型接着写。 */
export function formatCompare(notes: PaperNote[]): string {
  if (notes.length === 0) return '没有可对照的笔记。先用 write_note 落盘，再调用 compare_notes。'
  const lines: string[] = []
  lines.push(`对照 ${notes.length} 篇已落盘笔记。下面的句子来自笔记正文，数字来自笔记里的指标。笔记没写的不要补。`)
  for (const note of notes) {
    lines.push('')
    lines.push(`## ${note.arxiv_id} ${note.title}`)
    for (const [axis, text] of compareLines(note)) {
      lines.push(`- ${axis}：${text || '（空）'}`)
    }
  }
  if (notes.length >= 2) {
    lines.push('')
    lines.push('写给用户的对照只使用上面这些字段。引用数字时，必须能在对应笔记的 metrics.quote 或 quotes 里找到原句；找不到就不要写这个数字。')
  }
  return lines.join('\n')
}
