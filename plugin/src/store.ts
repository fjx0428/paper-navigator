/**
 * 论文工作区缓存：fetch_arxiv 之后四个工具共享的每篇论文状态。
 * 键为 arXiv id（含版本号原文）；同一 id 重复 fetch 会整体覆盖。
 */

export interface SectionInfo {
  /** 展示给模型的序号，从 0 开始（0 号是题头/摘要区） */
  index: number
  title: string
  startPage: number
  endPage: number
  /** 该节词数（按空白切分） */
  words: number
  /** 全局扁平行序列中的 [startFlat, endFlat) 边界，read_section 按此精确切分 */
  startFlat: number
  endFlat: number
}

export interface PaperRecord {
  arxivId: string
  title: string
  authors: string[]
  abstract: string
  pdfPath: string
  pageCount: number
  /** 全部正文行（已按双栏视觉顺序展开），read_section 直接在此切片 */
  flat: Array<{ page: number; text: string }>
  sections: SectionInfo[]
  /** read_section 实际返回过的文本，作为引用校验语料的一部分 */
  readChunks: string[]
}

const papers = new Map<string, PaperRecord>()

export const paperStore = {
  get(id: string): PaperRecord | undefined {
    return papers.get(id)
  },
  set(record: PaperRecord): void {
    papers.set(record.arxivId, record)
  },
  delete(id: string): void {
    papers.delete(id)
  },
  /** 引用校验语料：摘要 + 所有 read_section 返回过的文本 */
  corpus(record: PaperRecord): string {
    return [record.abstract, ...record.readChunks].join('\n')
  },
}

/** 笔记输出目录；展示网站与答辩用。可用环境变量覆盖。 */
export const NOTES_DIR =
  process.env.PAPER_NAVIGATOR_NOTES_DIR ?? 'notes'
