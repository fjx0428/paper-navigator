/**
 * 引用校验（方案 4.3）：每条 quote 必须是已获取原文的子串，
 * 校验前只合并多余空白。命中不了的句子会被 write_note 整体退回。
 */

import type { PaperNote } from './noteSchema.ts'

/** 校验前的唯一归一化：合并空白。不做其他变换，保证「逐字」语义。 */
export const normalizeWs = (s: string): string => s.replace(/\s+/g, ' ').trim()

/** 引用最小长度：过短的引用碰巧命中也算不上依据。 */
export const MIN_QUOTE_CHARS = 8

export interface QuoteRef {
  location: string
  quote: string
}

export function collectQuoteRefs(note: PaperNote): QuoteRef[] {
  const refs: QuoteRef[] = []
  for (const field of ['problem', 'method', 'data', 'limitations'] as const) {
    note[field]!.quotes.forEach((q, i) => refs.push({ location: `${field}.quotes[${i}]`, quote: q }))
  }
  note.metrics.forEach((m, i) => refs.push({ location: `metrics[${i}]`, quote: m.quote }))
  return refs
}

export interface QuoteIssue {
  location: string
  quote: string
  reason: string
}

/** corpus 为「摘要 + 全部 read_section 返回文本」的拼接。返回全部未命中的引用。 */
export function checkQuotes(note: PaperNote, corpus: string): QuoteIssue[] {
  const hay = normalizeWs(corpus)
  const issues: QuoteIssue[] = []
  for (const ref of collectQuoteRefs(note)) {
    const norm = normalizeWs(ref.quote)
    if (norm.length < MIN_QUOTE_CHARS) {
      issues.push({ location: ref.location, quote: ref.quote, reason: `引用只有 ${norm.length} 个字符（最少 ${MIN_QUOTE_CHARS}），太短无法作为原文依据` })
      continue
    }
    if (!hay.includes(norm)) {
      issues.push({ location: ref.location, quote: ref.quote, reason: '在已获取的原文（摘要 + 已读章节）中找不到这句' })
    }
  }
  return issues
}
