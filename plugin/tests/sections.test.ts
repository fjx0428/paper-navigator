import assert from 'node:assert/strict'
import { test } from 'node:test'
import { detectSections, type PageText } from '../src/pdf.ts'

function page(lines: Array<[number, string]>): PageText {
  return { width: 612, height: 792, lines: lines.map(([y, text]) => ({ x: 72, y, text })) }
}

const pages: PageText[] = [
  page([
    [720, 'Vision-Based Agile Landing on Turbulent Waters'],
    [700, 'Abstract'],
    [680, 'Autonomous landing of UAVs on maritime vessels is challenging.'],
    [660, 'I. INTRODUCTION'],
    [640, 'Utilization of UAVs in maritime operations has increased.'],
    [620, 'II. RELATED WORK'],
    [600, 'Visual-servoing methods use AprilTags.'],
    [580, '2 (b) 0.98'],
  ]),
  page([
    [740, '3 Methodology'],
    [720, 'We train a sensorimotor controller with PPO.'],
    [700, 'IV. EXPERIMENTS'],
    [680, 'We evaluate in Gazebo and the real world.'],
    [660, 'V. CONCLUSION'],
    [640, 'This paper presented an RL-based approach.'],
  ]),
]

const { flat, sections } = detectSections(pages)

test('0 号是题头与摘要区，Abstract 不重复开节', () => {
  assert.equal(sections[0]!.title, '题头与摘要')
  assert.ok(!sections.some(s => /^abstract$/i.test(s.title)))
})

test('数字与罗马编号都能识别', () => {
  const titles = sections.map(s => s.title)
  assert.ok(titles.includes('INTRODUCTION'))
  assert.ok(titles.includes('RELATED WORK'))
  assert.ok(titles.includes('Methodology'))
  assert.ok(titles.includes('EXPERIMENTS'))
  assert.ok(titles.includes('CONCLUSION'))
  assert.ok(titles.includes('References') || titles.includes('REFERENCES') === false)
})

test('假标题行 "2 (b) 0.98" 不开节', () => {
  assert.ok(!sections.some(s => /0\.98/.test(s.title)))
})

test('章节边界是扁平行偏移且文本对得上', () => {
  const intro = sections.find(s => s.title === 'INTRODUCTION')!
  const text = flat.slice(intro.startFlat, intro.endFlat).map(l => l.text).join('\n')
  assert.ok(text.includes('maritime operations'))
  assert.ok(!text.includes('AprilTags'), '下一节的内容不应混入')
  assert.ok(intro.words > 0)
})

test('最后一节延伸到文末', () => {
  const last = sections.at(-1)!
  assert.equal(last.endFlat, flat.length)
})
