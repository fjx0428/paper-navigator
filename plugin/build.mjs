// 自包含构建：src/*.ts → lib/（单入口 bundle，dsh 包外置走 peer，pdfjs 内联）
import { build } from 'esbuild'

await build({
  entryPoints: ['src/index.ts'],
  outdir: 'lib',
  bundle: true,
  splitting: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  external: ['@deepseek-ai/cordis', '@deepseek-ai/dsh-tools', '@deepseek-ai/dsh-llm'],
  sourcemap: false,
  logLevel: 'info',
})
