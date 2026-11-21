import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { paperStore } from '../store.ts'
import { traceTool } from '../trace.ts'

export const listSectionsTool = defineTool({
  name: 'list_sections',
  description: '列出已获取论文的章节目录与每节词数。据此挑 2-4 个相关章节，不要一次读全文。',
  parameters: {
    arxiv_id: { type: 'string', required: true, description: '要查看目录的 arXiv 编号（需已 fetch_arxiv）' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const record = paperStore.get(args.arxiv_id)
    if (!record) {
      await traceTool({ tool: 'list_sections', args: { arxiv_id: args.arxiv_id }, ok: false, detail: 'no cache' })
      return `没有 ${args.arxiv_id} 的缓存。请先调用 fetch_arxiv。`
    }
    await traceTool({ tool: 'list_sections', arxivId: args.arxiv_id, ok: true, size: record.sections.length })
    const rows = record.sections.map(s => {
      const range = s.startPage === s.endPage ? `第 ${s.startPage + 1} 页` : `第 ${s.startPage + 1}–${s.endPage + 1} 页`
      return `[${s.index}] ${s.title}（${range}，约 ${s.words} 词）`
    })
    return [
      `《${record.title}》章节目录（共 ${record.sections.length} 块，${record.pageCount} 页）：`,
      ...rows,
      '',
      '提示：读 [0] 可拿到题头与摘要区；方法、实验、局限相关章节按需读取。每节用 read_section 并给 max_chars，避免整篇进入上下文。',
    ].join('\n')
  },
})

export function registerListSections(ctx: Context): void {
  ctx.tools.register(listSectionsTool)
}
