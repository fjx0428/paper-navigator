import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { formatCompare } from '../compareNotes.ts'
import type { PaperNote } from '../noteSchema.ts'
import { NOTES_DIR } from '../store.ts'
import { traceTool } from '../trace.ts'

function loadNote(id: string): PaperNote | undefined {
  const names = readdirSync(NOTES_DIR).filter(name => name.endsWith('.json') && !name.endsWith('.jsonl'))
  const exact = names.find(name => name === `${id}.json` || name.startsWith(`${id}`))
  if (!exact) return undefined
  return JSON.parse(readFileSync(join(NOTES_DIR, exact), 'utf8')) as PaperNote
}

export const compareNotesTool = defineTool({
  name: 'compare_notes',
  description:
    '对照已经落盘的笔记：问题、方法、数据、指标、局限。不读 PDF，也不补充笔记里没有的数字。用户要求比较多篇、或梳理一个题目下的已读论文时调用。',
  parameters: {
    arxiv_ids: {
      type: 'string',
      description: '要对照的 arXiv 编号，逗号分隔，如 2605.23717,2610.03924。省略则对照目录里已有的笔记（最多 8 篇）。',
    },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args) {
    const raw = String(args.arxiv_ids ?? '').trim()
    try {
      const ids = raw
        ? raw.split(/[,，\s]+/).map(s => s.replace(/^arxiv:/i, '').trim()).filter(Boolean)
        : readdirSync(NOTES_DIR)
            .filter(name => /^\d{4}\.\d{4,5}(v\d+)?\.json$/.test(name))
            .map(name => name.replace(/\.json$/, ''))
            .slice(0, 8)
      const notes: PaperNote[] = []
      const missing: string[] = []
      for (const id of ids) {
        const note = loadNote(id)
        if (note) notes.push(note)
        else missing.push(id)
      }
      await traceTool({ tool: 'compare_notes', args: { arxiv_ids: raw }, size: notes.length, ok: true })
      const head = missing.length ? `这些编号还没有笔记，未纳入对照：${missing.join('、')}。\n\n` : ''
      return head + formatCompare(notes)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await traceTool({ tool: 'compare_notes', args: { arxiv_ids: raw }, ok: false, detail: msg })
      return `compare_notes 失败：${msg}`
    }
  },
})

export function registerCompareNotes(ctx: Context): void {
  ctx.tools.register(compareNotesTool)
}
