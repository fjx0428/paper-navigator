import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateNoteShape } from '../src/noteSchema.ts'

const good = {
  arxiv_id: '2605.23717',
  title: 'Vision-Based Agile Landing on Turbulent Waters',
  problem: { text: '海上降落难。', quotes: ['coupled motion of the vehicle'] },
  method: { text: '稀疏特征 RL。', quotes: ['sparse local features'] },
  data: { text: '仿真 + 真机。', quotes: ['400 real-world trials'] },
  metrics: [{ name: '成功率', value: '74.21%', quote: 'Ours (PD) 74.21' }],
  limitations: { text: '依赖特征质量。', quotes: [] },
}

test('合法笔记通过', () => {
  assert.deepEqual(validateNoteShape(good), [])
})

test('缺字段被点名', () => {
  const bad: Record<string, unknown> = { ...good }
  delete (bad as Record<string, unknown>).method
  const problems = validateNoteShape(bad)
  assert.ok(problems.some(p => p.includes('method')))
})

test('metrics 为空被拒绝', () => {
  const bad = structuredClone(good)
  ;(bad.metrics as unknown[]) = []
  const problems = validateNoteShape(bad)
  assert.ok(problems.some(p => p.includes('metrics')))
})

test('metrics 条目缺 value 被拒绝', () => {
  const bad = structuredClone(good)
  ;(bad.metrics as Array<Record<string, unknown>>)[0] = { name: 'x', quote: 'y' }
  const problems = validateNoteShape(bad)
  assert.ok(problems.some(p => p.includes('metrics[0].value')))
})

test('非对象输入整体拒绝', () => {
  assert.equal(validateNoteShape('hello').length, 1)
})
