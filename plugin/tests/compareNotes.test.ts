import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatCompare } from '../src/compareNotes.ts'
import type { PaperNote } from '../src/noteSchema.ts'

function note(id: string, value: string): PaperNote {
  const section = { text: `${id} 的总结`, quotes: ['a quote from the paper text'] }
  return {
    arxiv_id: id,
    title: `Title ${id}`,
    problem: section,
    method: section,
    data: section,
    limitations: section,
    metrics: [{ name: '成功率', value, quote: `success ${value}` }],
  }
}

test('两篇笔记按五个轴列出，并禁止补数字', () => {
  const text = formatCompare([note('2605.23717', '90.57%'), note('2610.03924', '0.29 m/s')])
  assert.match(text, /2605\.23717/)
  assert.match(text, /2610\.03924/)
  assert.match(text, /成功率：90\.57%/)
  assert.match(text, /不要写这个数字/)
})

test('没有笔记时直接说明', () => {
  assert.match(formatCompare([]), /没有可对照/)
})
