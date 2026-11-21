import assert from 'node:assert/strict'
import { test } from 'node:test'
import { noteToMarkdown } from '../src/noteRender.ts'
import type { PaperNote } from '../src/noteSchema.ts'

const note: PaperNote = {
  arxiv_id: '1706.03762',
  title: 'Attention Is All You Need',
  problem: { text: 'RNN 串行。', quotes: ['the recurrent nature of these models'] },
  method: { text: 'Transformer。', quotes: ['we propose the Transformer'] },
  data: { text: 'WMT 2014。', quotes: ['WMT 2014 English-German'] },
  metrics: [{ name: 'BLEU', value: '28.4', quote: '28.4 BLEU on the WMT 2014 English-to-German translation task' }],
  limitations: { text: '平方复杂度。', quotes: [] },
}

test('渲染出标题、链接、指标表和引用', () => {
  const md = noteToMarkdown(note, { authors: ['Vaswani et al.'], pageCount: 15, generatedAt: new Date('2026-11-21T03:00:00Z') })
  assert.ok(md.includes('# Attention Is All You Need'))
  assert.ok(md.includes('arxiv.org/abs/1706.03762'))
  assert.ok(md.includes('| BLEU | 28.4 |'))
  assert.ok(md.includes('> we propose the Transformer'))
  assert.ok(md.includes('## 局限'))
  assert.ok(md.includes('```mermaid'))
  assert.ok(md.includes('q --> m --> d --> k --> l'))
})

test('长引用在表格里截断', () => {
  const md = noteToMarkdown(note, { authors: [], pageCount: 1, generatedAt: new Date() })
  assert.ok(md.length < 4000)
})
