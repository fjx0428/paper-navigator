/**
 * 笔记 JSON 的结构校验。字段名即接口：一旦冻结（第 2 周）不再改动。
 */

export interface NoteSectionField {
  text: string
  quotes: string[]
}

export interface NoteMetric {
  name: string
  value: string
  quote: string
}

export interface PaperNote {
  arxiv_id: string
  title: string
  problem: NoteSectionField
  method: NoteSectionField
  data: NoteSectionField
  metrics: NoteMetric[]
  limitations: NoteSectionField
}

function isSectionField(v: unknown): v is NoteSectionField {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return typeof o.text === 'string' && Array.isArray(o.quotes) && o.quotes.every(q => typeof q === 'string')
}

/** 返回问题列表；空数组表示结构合法。 */
export function validateNoteShape(raw: unknown): string[] {
  const problems: string[] = []
  if (typeof raw !== 'object' || raw === null) return ['note 必须是一个 JSON 对象']
  const n = raw as Record<string, unknown>
  if (typeof n.arxiv_id !== 'string' || !n.arxiv_id.trim()) problems.push('arxiv_id 缺失或不是字符串')
  if (typeof n.title !== 'string' || !n.title.trim()) problems.push('title 缺失或不是字符串')
  for (const field of ['problem', 'method', 'data', 'limitations'] as const) {
    const v = n[field]
    if (!isSectionField(v)) {
      problems.push(`${field} 缺失或结构不对（需要 {text: string, quotes: string[]}）`)
      continue
    }
    if (!v.text.trim()) problems.push(`${field}.text 为空`)
  }
  if (!Array.isArray(n.metrics)) {
    problems.push('metrics 缺失或不是数组')
  } else if (n.metrics.length === 0) {
    problems.push('metrics 至少要有一条（没有量化指标的论文写 {name:"主要结果", value:"定性描述", quote:"…"}）')
  } else {
    n.metrics.forEach((m, i) => {
      if (typeof m !== 'object' || m === null) problems.push(`metrics[${i}] 不是对象`)
      else {
        const o = m as Record<string, unknown>
        for (const k of ['name', 'value', 'quote'] as const) {
          if (typeof o[k] !== 'string' || !(o[k] as string).trim()) problems.push(`metrics[${i}].${k} 缺失或为空`)
        }
      }
    })
  }
  return problems
}
