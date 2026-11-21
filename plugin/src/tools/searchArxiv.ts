import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { searchArxiv } from '../arxiv.ts'
import { traceTool } from '../trace.ts'

export const searchArxivTool = defineTool({
  name: 'search_arxiv',
  description:
    '按研究主题检索 arXiv，返回最多 8 篇的编号、标题、作者和摘要。不下载 PDF。用户给的是题目而不是编号时先调用这个，再让用户选定 1–3 篇精读。',
  parameters: {
    query: {
      type: 'string',
      required: true,
      description: '检索词，如 autonomous landing heaving deck。不要自己加 all: 前缀。',
    },
    max_results: {
      type: 'integer',
      description: '返回篇数，默认 5，最多 8',
    },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const query = String(args.query ?? '').trim()
    if (!query) return 'search_arxiv 失败：query 为空。'
    const max = Number(args.max_results ?? 5)
    try {
      const hits = await searchArxiv(query, max)
      await traceTool({ tool: 'search_arxiv', args: { query, max_results: max }, size: hits.length, ok: true })
      if (hits.length === 0) return `没有检索到与「${query}」相关的 arXiv 论文。换更短的关键词再试，不要编造编号。`
      const body = hits.map((hit, i) => {
        const authors = hit.authors.slice(0, 4).join(', ')
        const more = hit.authors.length > 4 ? ' 等' : ''
        const summary = hit.summary.replace(/\s+/g, ' ').slice(0, 280)
        return [
          `${i + 1}. arXiv:${hit.arxivId}（${hit.published || '日期未知'}）`,
          hit.title,
          authors ? `作者：${authors}${more}` : '',
          `摘要：${summary}${hit.summary.length > 280 ? '…' : ''}`,
        ].filter(Boolean).join('\n')
      })
      return [`检索「${query}」，${hits.length} 篇。选定后再 fetch_arxiv，不要一次读完全部。`, '', ...body].join('\n\n')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await traceTool({ tool: 'search_arxiv', args: { query }, ok: false, detail: msg })
      return `search_arxiv 失败：${msg}\n把失败原因原样告诉用户，不要编造论文。`
    }
  },
})

export function registerSearchArxiv(ctx: Context): void {
  ctx.tools.register(searchArxivTool)
}
