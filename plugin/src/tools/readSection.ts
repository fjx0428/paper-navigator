import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { paperStore } from '../store.ts'
import { traceTool } from '../trace.ts'

const DEFAULT_MAX_CHARS = 4000
const HARD_CAP = 12000

export const readSectionTool = defineTool({
  name: 'read_section',
  description:
    '读取某一节的正文（受 max_chars 限制）。返回的文本就是之后 write_note 里 quote 的合法来源，引用请逐字复制。',
  parameters: {
    arxiv_id: { type: 'string', required: true, description: 'arXiv 编号（需已 fetch_arxiv）' },
    section: { type: 'integer', required: true, description: 'list_sections 输出的章节序号' },
    max_chars: {
      type: 'integer',
      description: `本次最多返回的字符数，默认 ${DEFAULT_MAX_CHARS}，上限 ${HARD_CAP}`,
    },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const record = paperStore.get(args.arxiv_id)
    if (!record) return `没有 ${args.arxiv_id} 的缓存。请先调用 fetch_arxiv。`
    const section = record.sections[args.section]
    if (!section) {
      const known = record.sections.map(s => `[${s.index}] ${s.title}`).join('；')
      return `章节序号 ${args.section} 不存在。可用：${known}`
    }
    const full = record.flat.slice(section.startFlat, section.endFlat).map(l => l.text).join('\n')
    const maxChars = Math.min(Math.max(args.max_chars ?? DEFAULT_MAX_CHARS, 300), HARD_CAP)
    const text = full.length <= maxChars ? full : full.slice(0, maxChars)

    const header = `[章节 ${section.index}：${section.title}（第 ${section.startPage + 1}–${section.endPage + 1} 页）]`
    const tail =
      full.length <= maxChars
        ? ''
        : `\n\n[已截断：本节共 ${full.length} 字符，只返回前 ${maxChars}。需要后半部分可用更大的 max_chars 重读本节。]`
    const returned = `${header}\n${text}${tail}`
    // 语料 = 实际返回给模型的完整文本（方案 4.3：quote 是 read_section 返回文本的子串）
    record.readChunks.push(returned)
    await traceTool({ tool: 'read_section', arxivId: args.arxiv_id, args: { section: args.section, max_chars: maxChars }, size: text.length, ok: true })
    return returned
  },
})

export function registerReadSection(ctx: Context): void {
  ctx.tools.register(readSectionTool)
}
