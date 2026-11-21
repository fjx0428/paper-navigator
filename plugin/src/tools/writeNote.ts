import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { noteToMarkdown } from '../noteRender.ts'
import { validateNoteShape } from '../noteSchema.ts'
import { checkQuotes, normalizeWs } from '../quoteCheck.ts'
import { locateQuote } from '../locate.ts'
import { NOTES_DIR, paperStore } from '../store.ts'
import { traceTool } from '../trace.ts'

const sectionFieldSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string', required: true, description: '这一部分的总结，2-4 句' },
    quotes: { type: 'array', items: { type: 'string' }, description: '原文依据；每条逐字来自 fetch_arxiv 的摘要或 read_section 的返回文本（≥8 字符）' },
  },
} as const

export const writeNoteTool = defineTool({
  name: 'write_note',
  description:
    '提交结构化笔记。所有 quote 会先做引用校验（只合并空白后必须在已获取原文中逐字命中）；校验不通过时整份笔记被退回，按错误清单修改后重新提交。',
  parameters: {
    note: {
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        arxiv_id: { type: 'string', required: true, description: '论文的 arXiv 编号（需已 fetch_arxiv）' },
        title: { type: 'string', required: true, description: '论文标题' },
        problem: sectionFieldSchema,
        method: sectionFieldSchema,
        data: sectionFieldSchema,
        limitations: sectionFieldSchema,
        metrics: {
          type: 'array',
          description: '关键量化指标，至少一条',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string', required: true, description: '指标名，如 Success rate' },
              value: { type: 'string', required: true, description: '数值，如 74.21%' },
              quote: { type: 'string', required: true, description: '含该数字的原文依据，逐字' },
            },
          },
        },
      },
    },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const note = args.note

    const shapeProblems = validateNoteShape(note)
    if (shapeProblems.length > 0) {
      return ['[write_note] 结构校验未通过，笔记未写入：', ...shapeProblems.map((p, i) => `${i + 1}. ${p}`), '', '修正后重新提交完整笔记。'].join('\n')
    }

    const record = paperStore.get(note.arxiv_id)
    if (!record) {
      return `[write_note] 没有 ${note.arxiv_id} 的缓存：请先 fetch_arxiv，读完章节后再提交笔记。`
    }

    const issues = checkQuotes(note, paperStore.corpus(record))
    if (issues.length > 0) {
      await traceTool({ tool: 'write_note', arxivId: note.arxiv_id, ok: false, detail: `${issues.length} quote issue(s)` })
      return [
        `[write_note] 引用校验未通过（${issues.length} 条问题），笔记未写入：`,
        ...issues.map((it, i) => `${i + 1}. ${it.location}：「${normalizeWs(it.quote).slice(0, 80)}${normalizeWs(it.quote).length > 80 ? '…' : ''}」—— ${it.reason}`),
        '',
        '处理方式：引用必须逐字来自摘要或已读章节的返回文本（校验只合并空白字符）。可以先 read_section 补读相关章节，再修改后重新提交完整笔记。不要凭记忆写数字。',
      ].join('\n')
    }

    const markdown = noteToMarkdown(note, {
      authors: record.authors,
      pageCount: record.pageCount,
      generatedAt: new Date(),
      locate: (q) => {
        const loc = locateQuote(q, record)
        if (!loc) return undefined
        return loc.section === '摘要' ? '摘要' : `${loc.section}，${loc.pages}`
      },
    })
    const { mkdir, writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    await mkdir(NOTES_DIR, { recursive: true })
    const safe = note.arxiv_id.replace(/[^A-Za-z0-9._-]/g, '_')
    const path = join(NOTES_DIR, `${safe}.md`)
    await writeFile(path, markdown, 'utf8')
    // 评测用原始 JSON（与 Markdown 同目录）
    await writeFile(path.replace(/\.md$/, '.json'), JSON.stringify(note, null, 2), 'utf8')

    const quoteCount = countQuotes(note)
    await traceTool({ tool: 'write_note', arxivId: note.arxiv_id, ok: true, size: quoteCount, detail: path })
    return `[write_note] 笔记已写入 ${path}；${quoteCount} 条引用全部命中原文。对照阅读（左 PDF、右笔记，含结构图）：site/read.html?id=${safe}。可以向用户总结这篇论文了。`
  },
})

function countQuotes(note: { problem: { quotes: unknown[] }; method: { quotes: unknown[] }; data: { quotes: unknown[] }; limitations: { quotes: unknown[] }; metrics: unknown[] }): number {
  return note.problem.quotes.length + note.method.quotes.length + note.data.quotes.length + note.limitations.quotes.length + note.metrics.length
}

export function registerWriteNote(ctx: Context): void {
  ctx.tools.register(writeNoteTool)
}
