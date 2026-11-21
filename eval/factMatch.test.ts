import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hayHasFactToken } from './factMatch.ts'

test('千分位逗号按完整数字命中', () => {
  const text = 'LoRA reduces parameters by 10,000 times, corpus 1,000,000'
  assert.equal(hayHasFactToken(text, '10000'), true)
  assert.equal(hayHasFactToken(text, '1000000'), true)
})

test('去掉逗号不能把短数字认进更长的数字', () => {
  assert.equal(hayHasFactToken('English Wikipedia (2,500M words)', '25'), false)
  assert.equal(hayHasFactToken('English Wikipedia (2,500M words)', '2500'), true)
  assert.equal(hayHasFactToken('BooksCorpus (800M words)', '8'), true)
})

test('小数与百分号', () => {
  assert.equal(hayHasFactToken('median 0.077 to 0.044 m/s', '0.077'), true)
  assert.equal(hayHasFactToken('RelaImpr 11.65%', '11.65'), true)
})
