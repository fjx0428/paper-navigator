/**
 * arXiv 元数据（Atom API）与 PDF 下载。确定性代码，模型只负责传 id。
 */

import { setDefaultResultOrder } from 'node:dns'

const ARXIV_API = 'https://export.arxiv.org/api/query?id_list='
const PDF_URL = 'https://arxiv.org/pdf/'
const UA = 'paper-navigator-plugin/0.1 (course project; contact via user)'

// 本机到 arxiv.org 的 IPv6 路径偶发秒断，优先走 IPv4。
try {
  setDefaultResultOrder('ipv4first')
} catch {
  /* 旧运行时没有这个开关时保持默认 */
}

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

export interface ArxivHit {
  arxivId: string
  title: string
  authors: string[]
  published: string
  summary: string
}

/** 把用户的主题收成 arXiv 检索 URL。已带字段前缀（ti:/au:/all:）时不再包一层。 */
export function arxivSearchUrl(query: string, maxResults = 5): string {
  const q = query.trim()
  const search = /^(?:all|ti|au|abs|cat):/i.test(q) ? q : `all:${q}`
  const n = Math.min(Math.max(Math.floor(maxResults) || 1, 1), 8)
  return `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(search)}&start=0&max_results=${n}&sortBy=relevance`
}

function arxivIdFromAtom(idUrl: string): string {
  const m = idUrl.match(/(\d{4}\.\d{4,5})(?:v\d+)?/)
  return m ? m[1]! : collapse(idUrl)
}

/** 解析 Atom feed 里的 entry。没有结果时返回空数组，不把 feed 外壳当成一篇论文。 */
export function parseArxivFeed(xml: string): ArxivHit[] {
  const hits: ArxivHit[] = []
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const block = m[1]!
    const title = pick(block, 'title')
    const id = arxivIdFromAtom(pick(block, 'id'))
    if (!title || !id) continue
    const authors = [...block.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(a => collapse(a[1]!))
    hits.push({
      arxivId: id,
      title,
      authors,
      published: pick(block, 'published').slice(0, 10),
      summary: pick(block, 'summary'),
    })
  }
  return hits
}

/** 按主题检索 arXiv，只返回元数据，不下载 PDF。 */
export async function searchArxiv(query: string, maxResults = 5): Promise<ArxivHit[]> {
  const url = arxivSearchUrl(query, maxResults)
  const res = await fetchWithRetry(url, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(45_000),
  })
  if (!res.ok) throw new Error(`arXiv 检索 HTTP ${res.status}`)
  return parseArxivFeed(await res.text())
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

/** 下载 PDF 到临时目录，返回本地路径。同一 id 已有完整 PDF 时直接复用。无文本层由 pdf.ts 抽取时判定。 */
export async function downloadPdf(id: string): Promise<string> {
  const { readFile, writeFile, mkdir } = await import('node:fs/promises')
  const { join } = await import('node:path')
  const os = await import('node:os')
  const dir = join(os.tmpdir(), 'paper-navigator')
  await mkdir(dir, { recursive: true })
  const safe = id.replace(/[^A-Za-z0-9._-]/g, '_')
  const path = join(dir, `${safe}.pdf`)
  try {
    const cached = await readFile(path)
    if (cached.length > 1024 && cached.subarray(0, 5).toString('latin1') === '%PDF-') return path
  } catch {
    /* 没有缓存，继续下载 */
  }
  const res = await fetchWithRetry(PDF_URL + id, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) throw new Error(`PDF 下载 HTTP ${res.status}（${PDF_URL}${id}）`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    throw new Error(`下载内容不是 PDF（前 5 字节 ${JSON.stringify(buf.subarray(0, 5).toString('latin1'))}）`)
  }
  await writeFile(path, buf)
  return path
}
