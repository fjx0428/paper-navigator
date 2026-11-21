import assert from 'node:assert/strict'
import { test } from 'node:test'
import { arxivSearchUrl, parseArxivFeed } from '../src/arxiv.ts'

test('主题会被包成 all: 检索，篇数夹在 1 到 8', () => {
  const url = new URL(arxivSearchUrl('heaving deck landing', 20))
  assert.equal(url.searchParams.get('search_query'), 'all:heaving deck landing')
  assert.equal(url.searchParams.get('max_results'), '8')
  assert.equal(arxivSearchUrl('ti:transformer', 0).includes('search_query=ti%3Atransformer'), true)
})

test('Atom 多篇解析，并去掉版本号', () => {
  const xml = `<?xml version="1.0"?>
<feed>
  <title>ArXiv Query</title>
  <entry>
    <id>https://arxiv.org/abs/1706.03762v5</id>
    <title>Attention  Is All You Need</title>
    <published>2017-06-12T17:00:00Z</published>
    <summary>The dominant models.</summary>
    <author><name>Ashish Vaswani</name></author>
    <author><name>Noam Shazeer</name></author>
  </entry>
  <entry>
    <id>https://arxiv.org/abs/2605.23717v3</id>
    <title>Vision-Based Agile Landing</title>
    <published>2026-05-01T00:00:00Z</published>
    <summary>Landing without an explicit platform state.</summary>
    <author><name>Dimosthenis Angelis</name></author>
  </entry>
</feed>`
  const hits = parseArxivFeed(xml)
  assert.equal(hits.length, 2)
  assert.equal(hits[0]!.arxivId, '1706.03762')
  assert.equal(hits[0]!.title, 'Attention Is All You Need')
  assert.deepEqual(hits[0]!.authors, ['Ashish Vaswani', 'Noam Shazeer'])
  assert.equal(hits[0]!.published, '2017-06-12')
  assert.equal(hits[1]!.arxivId, '2605.23717')
})

test('没有 entry 时是空列表', () => {
  assert.deepEqual(parseArxivFeed('<feed><title>empty</title></feed>'), [])
})
