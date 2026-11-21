import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkQuotes, normalizeWs } from '../src/quoteCheck.ts'
import type { PaperNote } from '../src/noteSchema.ts'

const note: PaperNote = {
  arxiv_id: '1706.03762',
  title: 'Attention Is All You Need',
  problem: { text: '序列转换需要并行。', quotes: ['the recurrent nature of these models'] },
  method: { text: '只用注意力。', quotes: ['we propose the Transformer'] },
  data: { text: 'WMT 2014。', quotes: ['WMT 2014 English-to-German'] },
  metrics: [{ name: 'BLEU', value: '28.4', quote: '28.4 BLEU on the WMT 2014' }],
  limitations: { text: '长序列代价高。', quotes: [] },
}

// 语料里包含这几句（含换行/多空白的差异），只有指标句是真话
const corpus = [
  'recurrent  models\nsuch as LSTM process sequentially, and the recurrent nature of these models',
  'In this  work we propose the   Transformer.',
  'On the WMT 2014 English-to-German translation task, the Transformer achieves 28.4 BLEU on the WMT 2014',
].join('\n')

test('命中：空白差异被归一化后逐字命中', () => {
  const issues = checkQuotes(note, corpus)
  assert.equal(issues.length, 0)
})

test('拒绝：凭空编造的引用', () => {
  const bad = structuredClone(note)
  bad.problem.quotes = ['the model achieves 99.9 BLEU on every task']
  const issues = checkQuotes(bad, corpus)
  assert.equal(issues.length, 1)
  assert.match(issues[0]!.reason, /找不到/)
})

test('拒绝：数字被改动的引用', () => {
  const bad = structuredClone(note)
  bad.metrics[0]!.quote = '28.5 BLEU on the WMT 2014'
  const issues = checkQuotes(bad, corpus)
  assert.equal(issues.length, 1)
})

test('拒绝：过短的引用', () => {
  const bad = structuredClone(note)
  bad.method.quotes = ['we do']
  const issues = checkQuotes(bad, corpus)
  assert.equal(issues.length, 1)
  assert.match(issues[0]!.reason, /太短/)
})

test('normalizeWs 只合并空白', () => {
  assert.equal(normalizeWs('a \n\t b   c'), 'a b c')
})
