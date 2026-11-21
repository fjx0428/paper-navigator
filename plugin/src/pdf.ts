/**
 * PDF 文本抽取与章节切分（pdfjs-dist legacy 构建，Node 环境无 worker）。
 *
 * 两栏排版（IEEE/ robotics 常见）会把左右两栏同一视觉行的文字拼在一起，
 * 所以先按 x 方向的大间隙把每个视觉行切成左右段落，再按「自上而下、先左后右」
 * 的阅读顺序拼接。章节识别支持数字编号（1 Introduction）与罗马编号（I. INTRODUCTION）。
 */

export interface PageLine {
  x: number
  y: number
  text: string
}

export interface PageText {
  width: number
  height: number
  /** 视觉顺序（y 降序、x 升序）的行 */
  lines: PageLine[]
}

export interface SectionInfo {
  index: number
  title: string
  startPage: number
  endPage: number
  words: number
  /** 扁平行序列 [startFlat, endFlat) 边界 */
  startFlat: number
  endFlat: number
}

interface RawItem {
  str: string
  x: number
  y: number
  width: number
}

/** 抽取全部页面的行。抽取字符过少视为无文本层，抛错并给出明确原因。 */
export async function extractPages(pdfPath: string): Promise<PageText[]> {
  const { readFile } = await import('node:fs/promises')
  const data = await readFile(pdfPath)
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    isEvalSupported: false,
    useSystemFonts: false,
  })
  const doc = await task.promise

  const pages: PageText[] = []
  let totalChars = 0
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()
    const items: RawItem[] = (content.items as Array<{ str?: string; transform?: number[]; width?: number }>)
      .filter(it => typeof it.str === 'string' && it.transform)
      .map(it => ({ str: it.str!, x: it.transform![4]!, y: it.transform![5]!, width: it.width ?? 0 }))
    totalChars += items.reduce((n, it) => n + it.str.length, 0)
    pages.push({ width: viewport.width, height: viewport.height, lines: buildLines(items, viewport.width) })
    page.cleanup()
  }
  try {
    await task.destroy()
  } catch {
    // pdfjs v6 的销毁路径偶发非致命错误，不影响已抽取的文本
  }

  if (totalChars < 60 * pages.length) {
    throw new Error(`PDF 疑似无文本层（${pages.length} 页仅抽出 ${totalChars} 字符）。本期不做 OCR，请换一篇有文本层的论文。`)
  }
  return pages
}

/** 按 y 聚行、按 x 大间隙切栏，返回视觉顺序的行。 */
function buildLines(items: RawItem[], pageWidth: number): PageLine[] {
  const rows = new Map<number, RawItem[]>()
  for (const it of items) {
    const key = Math.round(it.y / 3) * 3
    const row = rows.get(key)
    if (row) row.push(it)
    else rows.set(key, [it])
  }
  const lines: PageLine[] = []
  const colGap = Math.max(24, pageWidth * 0.04)
  for (const key of [...rows.keys()].sort((a, b) => b - a)) {
    const row = (rows.get(key) ?? []).sort((a, b) => a.x - b.x)
    let seg: RawItem[] = []
    const flush = () => {
      if (seg.length > 0) {
        const text = seg.map(it => it.str).join('').replace(/\s+/g, ' ').trim()
        if (text) lines.push({ x: seg[0]!.x, y: key, text })
        seg = []
      }
    }
    let prevEnd = -Infinity
    for (const it of row) {
      if (seg.length > 0 && it.x - prevEnd > colGap) flush()
      seg.push(it)
      prevEnd = it.x + it.width
    }
    flush()
  }
  return lines
}

/** 单页文本：行按视觉顺序换行拼接。 */
export function pageToText(page: PageText): string {
  return page.lines.map(l => l.text).join('\n')
}

function looksLikeHeading(text: string): { title: string } | undefined {
  const t = text.trim()
  if (t.length < 3 || t.length > 90) return undefined
  const roman = t.match(/^((?:[IVXLCDM]{1,7}))\.\s+(\S.*)$/)
  const numeric = t.match(/^(\d{1,2})\.?\s+([A-Z]\S.*)$/)
  let title: string | undefined
  if (roman && isRoman(roman[1]!)) title = roman[2]!
  else if (numeric) title = numeric[2]!
  else {
    const special = t.match(/^(Abstract|ABSTRACT|References|REFERENCES|Acknowledg(?:e)?ments?|ACKNOWLEDG?E?MENTS?|Appendix(?:es)?|APPENDIX(?:ES)?|Conclusion[s]?|CONCLUSION[S]?)\s*\.?$/)
    if (special) title = special[1]!
  }
  if (!title) return undefined
  const letters = (title.match(/[A-Za-z]/g) ?? []).length
  if (letters < 3) return undefined
  if (letters / title.length < 0.5) return undefined
  if (/[=<>{}|$\\]/.test(title)) return undefined
  return { title: title.trim() }
}

function isRoman(s: string): boolean {
  return /^(?:M{0,3})(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/.test(s) && /[IVXLCDM]/.test(s)
}

/**
 * 识别章节，返回扁平行序列与章节边界。0 号固定为「题头与摘要」区
 * （首个标题之前的所有内容），之后每个命中的标题开启一节，直到下一个标题或文末。
 */
export function detectSections(pages: PageText[]): {
  flat: Array<{ page: number; text: string }>
  sections: SectionInfo[]
} {
  const flat: Array<{ page: number; text: string }> = []
  pages.forEach((page, p) => {
    for (const line of page.lines) flat.push({ page: p, text: line.text })
  })

  const bounds: Array<{ title: string; startFlat: number }> = [
    { title: '题头与摘要', startFlat: 0 },
  ]
  let lastTitle = ''
  for (let i = 0; i < flat.length; i++) {
    const hit = looksLikeHeading(flat[i]!.text)
    if (hit && hit.title.toLowerCase() !== lastTitle.toLowerCase()) {
      // 「题头与摘要」区里命中的 Abstract 标题不重复开节
      if (bounds.length === 1 && /^abstract$/i.test(hit.title)) continue
      bounds.push({ title: hit.title, startFlat: i })
      lastTitle = hit.title
    }
  }

  const sections: SectionInfo[] = bounds.map((b, i) => {
    const startFlat = b.startFlat
    const endFlat = i + 1 < bounds.length ? bounds[i + 1]!.startFlat : flat.length
    const text = flat.slice(startFlat, endFlat).map(l => l.text).join('\n')
    return {
      index: i,
      title: b.title,
      startPage: flat[startFlat]?.page ?? 0,
      endPage: flat[Math.max(0, endFlat - 1)]?.page ?? pages.length - 1,
      words: countWords(text),
      startFlat,
      endFlat,
    }
  })
  return { flat, sections }
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}
