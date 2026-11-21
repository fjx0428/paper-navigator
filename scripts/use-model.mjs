#!/usr/bin/env node
/**
 * 切换 Harness 新会话的默认模型（web 与 headless 两个 profile）。
 * 不改已发表的 DeepSeek 评测表。密钥仍走环境变量。
 *
 *   node scripts/use-model.mjs                  # 查看当前默认与可选列表
 *   node scripts/use-model.mjs glm-5.3-flash    # 日常：智谱高性价比
 *   node scripts/use-model.mjs glm-5.3          # 答辩单篇：智谱旗舰
 *   node scripts/use-model.mjs deepseek-flash   # 回到已发表评测用的模型
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROOT = '/Users/leiyu/学科实践大作业'
const BEGIN_P = '# BEGIN paper-navigator zhipu'
const END_P = '# END paper-navigator zhipu'
const BEGIN_M = '# BEGIN paper-navigator default-model'
const END_M = '# END paper-navigator default-model'

const MODELS = {
  'deepseek-flash': { provider: 'deepseek-official', model: 'deepseek-flash', label: 'DeepSeek Flash（已发表评测）' },
  'glm-5.3-flash': { provider: 'zhipu', model: 'glm-5.3-flash', reasoningEffort: 'high', label: 'GLM-5.3-Flash（日常推荐）' },
  'glm-5.3': { provider: 'zhipu', model: 'glm-5.3', reasoningEffort: 'high', label: 'GLM-5.3（答辩单篇）' },
  'glm-5.3-flashx': { provider: 'zhipu', model: 'glm-5.3-flashx', reasoningEffort: 'high', label: 'GLM-5.3-FlashX（更低延迟）' },
  'glm-4.7': { provider: 'zhipu', model: 'glm-4.7', reasoningEffort: 'high', label: 'GLM-4.7（上一代，更便宜）' },
}

const home = process.env.DSH_HOME || join(homedir(), '.dsh')
const profiles = ['web', 'headless'].map(name => join(home, 'profiles', name, 'cordis.patch.yml'))

function providerBlock() {
  const body = readFileSync(join(ROOT, 'config/zhipu.patch.yml'), 'utf8')
    .split('\n')
    .filter(line => !line.startsWith('#'))
    .join('\n')
    .trim()
  return `${BEGIN_P}\n${body}\n${END_P}\n`
}

function modelBlock(choice) {
  const lines = [
    BEGIN_M,
    '- id: agent-default-model',
    '  config:',
    `    provider: ${choice.provider}`,
    `    model: ${choice.model}`,
  ]
  if (choice.reasoningEffort) lines.push(`    reasoningEffort: ${choice.reasoningEffort}`)
  lines.push(END_M, '')
  return lines.join('\n')
}

function replaceOrAppend(text, begin, end, block) {
  const re = new RegExp(`${begin}[\\s\\S]*?${end}\\n?`)
  if (re.test(text)) return text.replace(re, block)
  const body = text.split('\n').filter(line => !line.trim().startsWith('#')).join('\n').trim()
  if (body === '[]' || body === '') {
    const header = text.split('\n').filter(line => line.trim().startsWith('#')).join('\n')
    return `${header}\n${block}`
  }
  return `${text.replace(/\s*$/, '\n\n')}${block}`
}

function currentModel(text) {
  const m = text.match(new RegExp(`${BEGIN_M}[\\s\\S]*?${END_M}`))
  if (!m) return 'deepseek-official / deepseek-flash（profile 未覆盖，沿用 Harness 默认）'
  const provider = m[0].match(/provider:\s*(\S+)/)?.[1] ?? '?'
  const model = m[0].match(/model:\s*(\S+)/)?.[1] ?? '?'
  return `${provider} / ${model}`
}

const arg = process.argv[2]
if (!arg || arg === '--help' || arg === '-h') {
  console.log('当前默认（两个 profile 应一致，这里打印 web）：')
  try {
    console.log('  ' + currentModel(readFileSync(profiles[0], 'utf8')))
  } catch {
    console.log('  （还没有 web profile）')
  }
  console.log('\n可选：')
  for (const [id, spec] of Object.entries(MODELS)) console.log(`  ${id.padEnd(18)} ${spec.label}`)
  process.exit(0)
}

const choice = MODELS[arg]
if (!choice) {
  console.error(`未知模型 ${arg}。可选：${Object.keys(MODELS).join('、')}`)
  process.exit(1)
}

for (const file of profiles) {
  let text = readFileSync(file, 'utf8')
  text = replaceOrAppend(text, BEGIN_P, END_P, providerBlock())
  text = replaceOrAppend(text, BEGIN_M, END_M, modelBlock(choice))
  writeFileSync(file, text.endsWith('\n') ? text : text + '\n')
  console.log(`已写入 ${file}`)
}
console.log(`新会话默认模型：${choice.label}`)
console.log('已经打开的 dsh web 需要停掉再启动一次，模型列表才会出现智谱。')
