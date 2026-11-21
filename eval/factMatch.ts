/**
 * 事实记号比对，和已发表评测同一口径：小写后做子串包含。
 * 额外规则只补一种漏报：笔记写成 10,000、记号是 10000 时，按去掉千分位后的完整数字再认一次。
 * 2,500 不会因此变成 25。
 */
export function factHaystack(text: string): string {
  return text.toLowerCase().replace(/(\d),(?=\d{3}(?:\D|$))/g, '$1')
}

export function hayHasFactToken(text: string, token: string): boolean {
  const raw = text.toLowerCase()
  const needle = token.toLowerCase()
  if (raw.includes(needle)) return true
  if (!/^\d/.test(needle)) return false
  const nums = factHaystack(raw).match(/\d+\.\d+%?|\d+%?/g) ?? []
  const key = needle.replace(/%$/, '')
  return nums.some(n => n.replace(/%$/, '') === key)
}
