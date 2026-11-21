import type { Context } from '@deepseek-ai/cordis'
import { PAPER_SKILL_CONTENT } from './paperSkill.ts'
import { registerCompareNotes } from './tools/compareNotes.ts'
import { registerFetchArxiv } from './tools/fetchArxiv.ts'
import { registerListSections } from './tools/listSections.ts'
import { registerReadSection } from './tools/readSection.ts'
import { registerSearchArxiv } from './tools/searchArxiv.ts'
import { registerWriteNote } from './tools/writeNote.ts'

export const name = 'paper-navigator'
export const inject = ['tools', 'skills']

/**
 * 论文领航 · DeepSeek Harness 插件
 * - 六个确定性工具：search_arxiv、fetch_arxiv、list_sections、read_section、write_note、compare_notes
 * - paper 技能：固定阅读顺序；用户可用 `/paper <arxiv_id>` 直接触发
 * 模型只决定何时调用、传什么参数；所有论文内容都来自工具返回值。
 */
export function apply(ctx: Context) {
  registerSearchArxiv(ctx)
  registerFetchArxiv(ctx)
  registerListSections(ctx)
  registerReadSection(ctx)
  registerWriteNote(ctx)
  registerCompareNotes(ctx)

  ctx.skills.register({
    name: 'paper',
    description:
      '论文领航：从研究主题检索 arXiv，或按编号精读一篇论文，写出带引用校验的笔记，并可对照已落盘的笔记。用法：/paper 1706.03762，或说「阅读 arXiv:1706.03762」「对比这两篇」。',
    whenToUse: '用户给出 arXiv 编号、研究主题，或要求对照已读论文时',
    source: 'runtime',
    content: PAPER_SKILL_CONTENT,
  })

  console.log(
    '[paper-navigator] 6 tools + skill "paper": search_arxiv / fetch_arxiv / list_sections / read_section / write_note / compare_notes',
  )
}
