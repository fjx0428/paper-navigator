/**
 * 引用定位：把每条 quote 映射回它所在的章节与页码，写进笔记 Markdown，
 * 让「原文依据」可直接翻回原文核对。
 */

import type { PaperRecord } from './store.ts'
import { normalizeWs } from './quoteCheck.ts'

export interface QuoteLocation {
  /** 如「§3 Model Architecture」 */
  section: string
  /** 如「第 2–6 页」或「摘要」 */
  pages: string
}

function sectionText(record: PaperRecord, s: { startFlat: number; endFlat: number }): string {
  return record.flat.slice(s.startFlat, s.endFlat).map(l => l.text).join('\n')
}

/** 在论文缓存里定位一句引用；找不到返回 undefined（引用可能来自 fetch_arxiv 的摘要文本） */
export function locateQuote(quote: string, record: PaperRecord): QuoteLocation | undefined {
  const q = normalizeWs(quote)
  if (!q) return undefined
  for (const s of record.sections) {
    if (s.index === 0) continue // 0 号是题头与摘要区，单独处理
    if (normalizeWs(sectionText(record, s)).includes(q)) {
      const pages = s.startPage === s.endPage ? `第 ${s.startPage + 1} 页` : `第 ${s.startPage + 1}–${s.endPage + 1} 页`
      return { section: `§${s.index} ${s.title}`, pages }
    }
  }
  if (normalizeWs(record.abstract).includes(q)) return { section: '摘要', pages: '摘要' }
  // 题头与摘要区（章节正文里没有、但原文里有的句子，比如标题或作者行）
  const s0 = record.sections[0]
  if (s0 && normalizeWs(sectionText(record, s0)).includes(q)) return { section: '§0 题头与摘要', pages: '第 1 页' }
  return undefined
}
