/**
 * 用现有 JSON 重写 Markdown，补上结构图。不重新调用模型。
 * 作者和页数从旧 Markdown 的题头行保留。
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { noteToMarkdown } from '../plugin/src/noteRender.ts'
import type { PaperNote } from '../plugin/src/noteSchema.ts'

const NOTES = '/Users/leiyu/学科实践大作业/notes'

function metaOf(md: string, jsonPath: string): { authors: string[]; pageCount: number; generatedAt: Date } {
  const line = md.split('\n').find(l => l.startsWith('> arXiv:')) ?? ''
  const authors = line.match(/· ([^·]+) ·/)?.[1]?.split(',').map(s => s.trim()).filter(Boolean) ?? []
  const pages = Number(line.match(/(\d+)\s*页/)?.[1] ?? 0)
  return { authors, pageCount: pages, generatedAt: statSync(jsonPath).mtime }
}

for (const name of readdirSync(NOTES)) {
  if (!/^\d{4}\.\d{4,5}\.json$/.test(name)) continue
  const jsonPath = join(NOTES, name)
  const mdPath = jsonPath.replace(/\.json$/, '.md')
  const note = JSON.parse(readFileSync(jsonPath, 'utf8')) as PaperNote
  let old = ''
  try { old = readFileSync(mdPath, 'utf8') } catch { /* 新笔记 */ }
  const md = noteToMarkdown(note, metaOf(old, jsonPath))
  writeFileSync(mdPath, md)
  console.log(name.replace('.json', ''), md.includes('```mermaid') ? '结构图已写入' : '缺图')
}
