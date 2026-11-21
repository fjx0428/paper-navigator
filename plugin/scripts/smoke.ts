/**
 * 第 2 周验收冒烟脚本：真实网络 + 真实 PDF 走完四个工具。
 * 用法（在 deepseek-harness 目录下）：
 *   node --import tsx /Users/leiyu/学科实践大作业/plugin/scripts/smoke.ts 1706.03762
 */
import { fetchArxivMeta, downloadPdf } from '../src/arxiv.ts'
import { detectSections, extractPages } from '../src/pdf.ts'
import { paperStore } from '../src/store.ts'
import { fetchArxivTool } from '../src/tools/fetchArxiv.ts'
import { listSectionsTool } from '../src/tools/listSections.ts'
import { readSectionTool } from '../src/tools/readSection.ts'
import { writeNoteTool } from '../src/tools/writeNote.ts'

const id = process.argv[2] ?? '1706.03762'
const exec = {} as never

async function main() {
  console.log(`=== 1. fetch_arxiv(${id}) ===`)
  const fetched = await fetchArxivTool.execute({ arxiv_id: id }, exec)
  console.log(fetched)

  console.log('\n=== 2. list_sections ===')
  const listed = await listSectionsTool.execute({ arxiv_id: id }, exec)
  console.log(listed)

  const record = paperStore.get(id)!
  const methodIdx = record.sections.findIndex(s => /method|approach|model/i.test(s.title) && s.index > 0)
  const readIdx = methodIdx > 0 ? methodIdx : 0
  console.log(`\n=== 3. read_section(section=${readIdx}) ===`)
  const read = await readSectionTool.execute({ arxiv_id: id, section: readIdx, max_chars: 3000 }, exec)
  const head = read.slice(0, 400)
  console.log(`${head}\n…（共 ${read.length} 字符，已入校验语料）`)

  // 从返回正文中取真实引用（去掉工具加的标题头）
  const body = read.replace(/^\[章节[^\]]*\]\n/, '').replace(/\n\[已截断[^\]]*\]$/, '')
  const sentences = body.split(/(?<=[.!?])\s+/).filter(s => s.length > 40)
  const realQuote = sentences.find(s => /\d/.test(s)) ?? sentences[0]!.trim()

  console.log('\n=== 4. write_note：带伪造指标（应被退回）===')
  const fakeNote = {
    arxiv_id: id,
    title: record.title,
    problem: { text: '见脚本。', quotes: [realQuote] },
    method: { text: '见脚本。', quotes: [] },
    data: { text: '见脚本。', quotes: [] },
    metrics: [{ name: 'BLEU', value: '99.9', quote: 'The Transformer achieves 99.9 BLEU, far beyond every prior system.' }],
    limitations: { text: '见脚本。', quotes: [] },
  }
  const rejected = await writeNoteTool.execute({ note: fakeNote }, exec)
  console.log(rejected)
  if (!rejected.includes('校验未通过')) throw new Error('伪造引用没有被拒绝！')

  console.log('\n=== 5. write_note：改正后重交（应通过并落盘）===')
  const goodNote = {
    ...fakeNote,
    method: { text: '见脚本。', quotes: [realQuote.slice(0, 120)] },
    metrics: [{ name: 'BLEU', value: realQuote.match(/\d+\.\d+/)?.[0] ?? 'n/a', quote: realQuote }],
  }
  const accepted = await writeNoteTool.execute({ note: goodNote }, exec)
  console.log(accepted)
  if (!accepted.includes('已写入')) throw new Error('合法笔记没有写入！')

  console.log('\n=== 冒烟通过 ===')
}

main().catch(err => {
  console.error('冒烟失败：', err)
  process.exit(1)
})
