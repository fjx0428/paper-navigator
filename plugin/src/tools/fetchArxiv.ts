import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { downloadPdf, fetchArxivMeta } from '../arxiv.ts'
import { detectSections, extractPages } from '../pdf.ts'
import { paperStore } from '../store.ts'
import { traceTool } from '../trace.ts'

export const fetchArxivTool = defineTool({
  name: 'fetch_arxiv',
  description:
    '拉取 arXiv 论文的标题、作者、摘要，下载 PDF 并抽取章节。之后用 list_sections 看目录，不要假设章节结构。',
  parameters: {
    arxiv_id: {
      type: 'string',
      required: true,
      description: 'arXiv 编号，如 1706.03762（可带版本号 1706.03762v2）',
    },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    try {
      const meta = await fetchArxivMeta(args.arxiv_id)
      const pdfPath = await downloadPdf(args.arxiv_id)
      const pages = await extractPages(pdfPath)
      const { flat, sections } = detectSections(pages)
      paperStore.set({
        arxivId: meta.arxivId,
        title: meta.title,
        authors: meta.authors,
        abstract: meta.abstract,
        pdfPath,
        pageCount: pages.length,
        flat,
        sections,
        readChunks: [],
      })
      await traceTool({ tool: 'fetch_arxiv', arxivId: meta.arxivId, args: { arxiv_id: args.arxiv_id }, size: pages.length, ok: true })
      return [
        `已获取 arXiv:${meta.arxivId}`,
        `标题：${meta.title}`,
        `作者：${meta.authors.join(', ') || '未知'}`,
        `页数：${pages.length}；识别出 ${sections.length} 个章节块`,
        '',
        '摘要：',
        meta.abstract,
        '',
        '下一步：用 list_sections 查看章节目录，再挑与问题/方法/实验/局限相关的章节读取。',
      ].join('\n')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await traceTool({ tool: 'fetch_arxiv', args: { arxiv_id: args.arxiv_id }, ok: false, detail: msg })
      return `fetch_arxiv 失败：${msg}\n请把失败原因原样告知用户，不要编造论文内容。`
    }
  },
})

export function registerFetchArxiv(ctx: Context): void {
  ctx.tools.register(fetchArxivTool)
}
