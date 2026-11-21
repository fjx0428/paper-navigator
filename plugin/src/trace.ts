/**
 * 工具调用轨迹：每次调用追加一行 JSONL，供评测统计（平均调用次数、成功率）
 * 与展示网站的「演示」页使用。写失败不影响工具本身。
 */
export interface TraceEntry {
  tool: string
  arxivId?: string
  args?: Record<string, unknown>
  /** 工具返回的字符数（read_section）或条目数（list_sections） */
  size?: number
  ok: boolean
  detail?: string
}

export async function traceTool(entry: TraceEntry): Promise<void> {
  try {
    const { mkdir, appendFile } = await import('node:fs/promises')
    const dir = process.env.PAPER_NAVIGATOR_TRACE_DIR ?? '/Users/leiyu/学科实践大作业/eval/traces'
    await mkdir(dir, { recursive: true })
    await appendFile(`${dir}/tool-calls.jsonl`, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`, 'utf8')
  } catch {
    // 轨迹是非关键路径
  }
}
