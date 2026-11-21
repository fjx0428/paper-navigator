/**
 * arXiv 元数据（Atom API）与 PDF 下载。确定性代码，模型只负责传 id。
 */

const ARXIV_API = 'https://export.arxiv.org/api/query?id_list='
const PDF_URL = 'https://arxiv.org/pdf/'
const UA = 'paper-navigator-plugin/0.1 (course project; contact via user)'

export interface ArxivMeta {
  arxivId: string
  title: string
  authors: string[]
  abstract: string
  updatedAt: string
}

function collapse(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** 网络抖动重试：指数退避，最多 tries 次（本机到 arXiv/NPM 的连接偶发秒断）。 */
async function fetchWithRetry(url: string, init: RequestInit, tries = 3): Promise<Response> {
  let lastErr: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, init)
    } catch (err) {
      lastErr = err
      if (i < tries - 1) await new Promise(r => setTimeout(r, 1500 * (i + 1)))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? collapse(m[1]!) : ''
}

/** 拉取元数据。arXiv Atom API 对单篇返回一个 entry。 */
export async function fetchArxivMeta(id: string): Promise<ArxivMeta> {
  const res = await fetchWithRetry(ARXIV_API + encodeURIComponent(id), {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(45_000),
  })
  if (!res.ok) throw new Error(`arXiv API HTTP ${res.status}`)
  const xml = await res.text()
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)
  if (!entry) throw new Error(`arXiv 上找不到 ${id}（返回里没有 entry）`)
  const block = entry[1]!
  const title = pick(block, 'title')
  if (!title) throw new Error(`arXiv 返回的 ${id} 缺少标题`)
  const authors = [...block.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(m => collapse(m[1]!))
  return {
    arxivId: id,
    title,
    authors,
    abstract: pick(block, 'summary'),
    updatedAt: pick(block, 'updated'),
  }
}

/** 下载 PDF 到临时目录，返回本地路径。无文本层由 pdf.ts 抽取时判定。 */
export async function downloadPdf(id: string): Promise<string> {
  const { writeFile, mkdir } = await import('node:fs/promises')
  const { join } = await import('node:path')
  const os = await import('node:os')
  const res = await fetchWithRetry(PDF_URL + id, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) throw new Error(`PDF 下载 HTTP ${res.status}（${PDF_URL}${id}）`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error(`下载内容不是 PDF（前 5 字节 ${JSON.stringify(buf.subarray(0, 5).toString('latin1'))}）`)
  }
  const dir = join(os.tmpdir(), 'paper-navigator')
  await mkdir(dir, { recursive: true })
  const safe = id.replace(/[^A-Za-z0-9._-]/g, '_')
  const path = join(dir, `${safe}.pdf`)
  await writeFile(path, buf)
  return path
}
