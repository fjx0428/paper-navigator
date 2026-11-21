import type { Context } from '@deepseek-ai/cordis'
import { PAPER_SKILL_CONTENT } from './paperSkill.ts'
import { registerFetchArxiv } from './tools/fetchArxiv.ts'
import { registerListSections } from './tools/listSections.ts'
import { registerReadSection } from './tools/readSection.ts'
import { registerWriteNote } from './tools/writeNote.ts'

export const name = 'paper-navigator'
export const inject = ['tools', 'skills']

/**
 * 论文领航 · DeepSeek Harness 插件
 * - 四个确定性工具：fetch_arxiv → list_sections → read_section → write_note（引用校验）
 * - paper 技能：固定阅读顺序；用户可用 `/paper <arxiv_id>` 直接触发
 * 模型只决定何时调用、传什么参数；所有论文内容都来自工具返回值。
 */
export function apply(ctx: Context) {
  registerFetchArxiv(ctx)
  registerListSections(ctx)
  registerReadSection(ctx)
  registerWriteNote(ctx)

  ctx.skills.register({
    name: 'paper',
    description:
      '论文领航：按固定流程阅读一篇 arXiv 论文并产出带原文引用校验的笔记。用法：/paper 1706.03762，或对模型说「阅读 arXiv:1706.03762」。',
    whenToUse: '用户给出 arXiv 编号并要求阅读、总结或做笔记时',
    source: 'runtime',
    content: PAPER_SKILL_CONTENT,
  })

  console.log(
    '[paper-navigator] 4 tools + skill "paper" registered: fetch_arxiv / list_sections / read_section / write_note',
  )
}
