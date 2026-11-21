// src/paperSkill.ts
var PAPER_SKILL_CONTENT = `# \u8BBA\u6587\u9886\u822A \xB7 paper-reading \u6D41\u7A0B

\u6309\u4EE5\u4E0B\u56FA\u5B9A\u987A\u5E8F\u9605\u8BFB\u8BBA\u6587\u3002\u9664\u5DE5\u5177\u8FD4\u56DE\u503C\u5916\uFF0C\u4E0D\u8981\u4F7F\u7528\u4EFB\u4F55\u5148\u9A8C\u8BBA\u6587\u77E5\u8BC6\uFF1B\u4E0D\u786E\u5B9A\u7684\u5185\u5BB9\u5B81\u53EF\u53BB\u8BFB\u539F\u6587\u3002

## \u9605\u8BFB\u987A\u5E8F

1. **fetch_arxiv**\uFF08arxiv_id\uFF09\u83B7\u53D6\u6807\u9898\u3001\u4F5C\u8005\u3001\u6458\u8981\u5E76\u62BD\u53D6\u7AE0\u8282\u3002\u5931\u8D25\u5C31\u628A\u5931\u8D25\u539F\u56E0\u539F\u6837\u544A\u8BC9\u7528\u6237\u5E76\u505C\u6B62\uFF0C\u4E0D\u8981\u7F16\u9020\u3002
2. **list_sections**\uFF08arxiv_id\uFF09\u770B\u7AE0\u8282\u76EE\u5F55\u3002
3. **read_section** \u53EA\u8BFB\u4E0E\u95EE\u9898\u3001\u65B9\u6CD5\u3001\u6570\u636E/\u5B9E\u9A8C\u3001\u5C40\u9650\u76F8\u5173\u7684\u7AE0\u8282\uFF1A
   - \u901A\u5E38 2\u20134 \u6B21\u8C03\u7528\uFF0C\u6BCF\u6B21 max_chars \u2264 4000\uFF1B
   - \u5168\u90E8\u8BFB\u5165\u6A21\u578B\u7684\u6B63\u6587\u5408\u8BA1\u4E0D\u8D85\u8FC7 12000 \u8BCD\u2014\u2014\u8FD9\u662F\u4E0A\u4E0B\u6587\u7BA1\u7406\u7684\u786C\u7EA6\u675F\uFF0C\u957F\u8BBA\u6587\u9760\u76EE\u5F55\u6311\u7AE0\u8282\u89E3\u51B3\uFF0C\u4E0D\u9760\u6362\u66F4\u5927\u7684\u6A21\u578B\uFF1B
   - References\u3001\u9644\u5F55\u9ED8\u8BA4\u4E0D\u8BFB\u3002
4. **write_note** \u63D0\u4EA4\u5B8C\u6574\u7B14\u8BB0\uFF1A
   - problem / method / data / limitations \u5404\u5199 2\u20134 \u53E5\u4E2D\u6587\u603B\u7ED3\uFF0C\u6BCF\u90E8\u5206\u81F3\u5C11 1 \u6761 quotes\uFF08metrics \u7684\u6BCF\u6761\u6307\u6807\u5FC5\u987B\u6709\u542B\u8BE5\u6570\u5B57\u7684\u539F\u6587 quote\uFF09\uFF1B
   - \u6240\u6709 quote \u5FC5\u987B**\u9010\u5B57\u590D\u5236**\u81EA fetch_arxiv \u8FD4\u56DE\u7684\u6458\u8981\u6216 read_section \u7684\u8FD4\u56DE\u6587\u672C\uFF08\u22658 \u5B57\u7B26\uFF09\uFF1B\u6821\u9A8C\u53EA\u5408\u5E76\u7A7A\u767D\u5B57\u7B26\uFF1B
   - \u4E0D\u786E\u5B9A\u7684\u6570\u5B57\u4E0D\u8981\u5199\uFF0C\u5148\u56DE\u7B2C 3 \u6B65\u8865\u8BFB\u3002
5. write_note \u88AB\u9000\u56DE\u65F6\uFF1A\u6309\u9519\u8BEF\u6E05\u5355\u9010\u6761\u4FEE\u6B63\uFF08\u8865\u8BFB\u7AE0\u8282\u6216\u6539\u6B63\u5F15\u7528\uFF09\uFF0C\u91CD\u65B0\u63D0\u4EA4**\u5B8C\u6574**\u7B14\u8BB0\uFF0C\u6700\u591A\u91CD\u8BD5 2 \u6B21\uFF1B\u4ECD\u5931\u8D25\u5219\u5982\u5B9E\u544A\u77E5\u7528\u6237\u54EA\u6761\u5F15\u7528\u5BF9\u4E0D\u4E0A\u3002
6. \u7B14\u8BB0\u843D\u76D8\u6210\u529F\u540E\uFF0C\u7528\u4E2D\u6587\u5411\u7528\u6237\u603B\u7ED3\uFF1A\u4E00\u53E5\u8BDD\u95EE\u9898\u3001\u65B9\u6CD5\u6838\u5FC3\u3001\u4E3B\u6307\u6807\u3001\u5C40\u9650\uFF0C\u5E76\u7ED9\u51FA\u7B14\u8BB0\u6587\u4EF6\u8DEF\u5F84\u3002

## \u4ECE\u9898\u76EE\u51FA\u53D1

\u7528\u6237\u7ED9\u7684\u662F\u7814\u7A76\u4E3B\u9898\u3001\u4E0D\u662F arXiv \u7F16\u53F7\u65F6\uFF1A

1. **search_arxiv** \u68C0\u7D22\uFF0C\u9ED8\u8BA4 5 \u7BC7\u3001\u6700\u591A 8 \u7BC7\u3002\u628A\u7F16\u53F7\u548C\u6807\u9898\u5217\u51FA\u6765\uFF0C\u8BF7\u7528\u6237\u9009\u5B9A\u3002
2. \u53EA\u5BF9\u9009\u5B9A\u7684 1\u20133 \u7BC7\u8D70\u4E0A\u9762\u7684\u7CBE\u8BFB\u6D41\u7A0B\u3002\u4E0D\u8981\u4E00\u6B21\u8BFB\u5B8C\u68C0\u7D22\u7ED3\u679C\u3002
3. \u4E24\u7BC7\u4EE5\u4E0A\u90FD\u5DF2\u7ECF\u843D\u76D8\u3001\u7528\u6237\u8981\u6C42\u5BF9\u7167\u65F6\uFF0C\u8C03\u7528 **compare_notes**\u3002\u5BF9\u7167\u53EA\u4F7F\u7528\u7B14\u8BB0\u91CC\u7684\u95EE\u9898\u3001\u65B9\u6CD5\u3001\u6570\u636E\u3001\u6307\u6807\u3001\u5C40\u9650\u3002\u6570\u5B57\u5FC5\u987B\u80FD\u5728\u8BE5\u7B14\u8BB0\u7684 quote \u91CC\u627E\u5230\uFF1B\u7B14\u8BB0\u6CA1\u5199\u7684\u4E0D\u8981\u7528\u8BB0\u5FC6\u8865\u4E0A\u3002

## \u8BFB\u5B8C\u4E4B\u540E\uFF1A\u8FFD\u95EE\u4E0E\u5EF6\u4F38

1. \u7B14\u8BB0\u843D\u76D8\u540E\u7684\u8FFD\u95EE\uFF08\u300CXX \u4E3A\u4EC0\u4E48\u53EF\u884C\u300D\u300C\u5B9E\u9A8C\u91CC Y \u600E\u4E48\u8BBE\u7F6E\u300D\uFF09\uFF1A\u7528 **read_section** \u8865\u8BFB\u5BF9\u5E94\u7AE0\u8282\u540E\u518D\u56DE\u7B54\uFF0C\u5F15\u7528\u89C4\u5219\u4E0D\u53D8\uFF1B\u7B14\u8BB0\u548C\u5DF2\u8BFB\u8BED\u6599\u91CC\u6CA1\u6709\u7684\uFF0C\u76F4\u8BF4\u6CA1\u6709\uFF0C\u4E0D\u8981\u9760\u8BB0\u5FC6\u3002
2. \u7528\u6237\u8981\u300C\u76F8\u5173\u5DE5\u4F5C / \u63A5\u4E0B\u6765\u8BFB\u4EC0\u4E48\u300D\uFF1A\u53EF\u4EE5 read_section \u8BFB References \u7AE0\u8282\uFF08\u6B64\u65F6\u4E0D\u53D7\u300C\u9ED8\u8BA4\u4E0D\u8BFB References\u300D\u9650\u5236\uFF09\uFF0C\u4ECE\u4E2D\u6311 3 \u7BC7\u4E0E\u7528\u6237\u95EE\u9898\u6700\u76F8\u5173\u7684\uFF0C\u7ED9\u51FA\u7F16\u53F7\u548C\u4E00\u53E5\u8BDD\u7406\u7531\uFF1B\u4E0D\u8981\u7F16\u9020\u53C2\u8003\u6587\u732E\u3002
3. \u7B14\u8BB0\u7684\u6BCF\u6761\u5F15\u7528\u5728 Markdown \u91CC\u90FD\u5E26\u300C\uFF08\u6765\u6E90\uFF1A\xA7\u7AE0\u8282\uFF0C\u7B2C N \u9875\uFF09\u300D\u5B9A\u4F4D\uFF0C\u7528\u6237\u60F3\u6838\u5BF9\u539F\u6587\u65F6\u5148\u6307\u8DEF\uFF0C\u518D\u6309\u9700\u8865\u8BFB\u3002

## \u8BED\u8A00

\u603B\u7ED3\u4E0E\u5BF9\u8BDD\u7528\u4E2D\u6587\uFF1Bquotes \u4FDD\u6301\u8BBA\u6587\u539F\u6587\uFF0C\u4E0D\u505A\u7FFB\u8BD1\u3002
`;

// src/tools/compareNotes.ts
import { defineTool } from "@deepseek-ai/dsh-tools";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// src/compareNotes.ts
function clip(text, max = 360) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}\u2026`;
}
function metricsLine(note) {
  if (!note.metrics?.length) return "\uFF08\u7B14\u8BB0\u91CC\u6CA1\u6709\u6307\u6807\uFF09";
  return note.metrics.slice(0, 4).map((m) => `${m.name}\uFF1A${m.value}`).join("\uFF1B");
}
function compareLines(note) {
  return [
    ["\u95EE\u9898", clip(note.problem?.text ?? "")],
    ["\u65B9\u6CD5", clip(note.method?.text ?? "")],
    ["\u6570\u636E", clip(note.data?.text ?? "")],
    ["\u6307\u6807", metricsLine(note)],
    ["\u5C40\u9650", clip(note.limitations?.text ?? "")]
  ];
}
function formatCompare(notes) {
  if (notes.length === 0) return "\u6CA1\u6709\u53EF\u5BF9\u7167\u7684\u7B14\u8BB0\u3002\u5148\u7528 write_note \u843D\u76D8\uFF0C\u518D\u8C03\u7528 compare_notes\u3002";
  const lines = [];
  lines.push(`\u5BF9\u7167 ${notes.length} \u7BC7\u5DF2\u843D\u76D8\u7B14\u8BB0\u3002\u4E0B\u9762\u7684\u53E5\u5B50\u6765\u81EA\u7B14\u8BB0\u6B63\u6587\uFF0C\u6570\u5B57\u6765\u81EA\u7B14\u8BB0\u91CC\u7684\u6307\u6807\u3002\u7B14\u8BB0\u6CA1\u5199\u7684\u4E0D\u8981\u8865\u3002`);
  for (const note of notes) {
    lines.push("");
    lines.push(`## ${note.arxiv_id} ${note.title}`);
    for (const [axis, text] of compareLines(note)) {
      lines.push(`- ${axis}\uFF1A${text || "\uFF08\u7A7A\uFF09"}`);
    }
  }
  if (notes.length >= 2) {
    lines.push("");
    lines.push("\u5199\u7ED9\u7528\u6237\u7684\u5BF9\u7167\u53EA\u4F7F\u7528\u4E0A\u9762\u8FD9\u4E9B\u5B57\u6BB5\u3002\u5F15\u7528\u6570\u5B57\u65F6\uFF0C\u5FC5\u987B\u80FD\u5728\u5BF9\u5E94\u7B14\u8BB0\u7684 metrics.quote \u6216 quotes \u91CC\u627E\u5230\u539F\u53E5\uFF1B\u627E\u4E0D\u5230\u5C31\u4E0D\u8981\u5199\u8FD9\u4E2A\u6570\u5B57\u3002");
  }
  return lines.join("\n");
}

// src/store.ts
var papers = /* @__PURE__ */ new Map();
var paperStore = {
  get(id) {
    return papers.get(id);
  },
  set(record) {
    papers.set(record.arxivId, record);
  },
  delete(id) {
    papers.delete(id);
  },
  /** 引用校验语料：摘要 + 所有 read_section 返回过的文本 */
  corpus(record) {
    return [record.abstract, ...record.readChunks].join("\n");
  }
};
var NOTES_DIR = process.env.PAPER_NAVIGATOR_NOTES_DIR ?? "notes";

// src/trace.ts
async function traceTool(entry) {
  try {
    const { mkdir, appendFile } = await import("node:fs/promises");
    const dir = process.env.PAPER_NAVIGATOR_TRACE_DIR ?? "/Users/leiyu/\u5B66\u79D1\u5B9E\u8DF5\u5927\u4F5C\u4E1A/eval/traces";
    await mkdir(dir, { recursive: true });
    await appendFile(`${dir}/tool-calls.jsonl`, `${JSON.stringify({ ts: (/* @__PURE__ */ new Date()).toISOString(), ...entry })}
`, "utf8");
  } catch {
  }
}

// src/tools/compareNotes.ts
function loadNote(id) {
  const names = readdirSync(NOTES_DIR).filter((name2) => name2.endsWith(".json") && !name2.endsWith(".jsonl"));
  const exact = names.find((name2) => name2 === `${id}.json` || name2.startsWith(`${id}`));
  if (!exact) return void 0;
  return JSON.parse(readFileSync(join(NOTES_DIR, exact), "utf8"));
}
var compareNotesTool = defineTool({
  name: "compare_notes",
  description: "\u5BF9\u7167\u5DF2\u7ECF\u843D\u76D8\u7684\u7B14\u8BB0\uFF1A\u95EE\u9898\u3001\u65B9\u6CD5\u3001\u6570\u636E\u3001\u6307\u6807\u3001\u5C40\u9650\u3002\u4E0D\u8BFB PDF\uFF0C\u4E5F\u4E0D\u8865\u5145\u7B14\u8BB0\u91CC\u6CA1\u6709\u7684\u6570\u5B57\u3002\u7528\u6237\u8981\u6C42\u6BD4\u8F83\u591A\u7BC7\u3001\u6216\u68B3\u7406\u4E00\u4E2A\u9898\u76EE\u4E0B\u7684\u5DF2\u8BFB\u8BBA\u6587\u65F6\u8C03\u7528\u3002",
  parameters: {
    arxiv_ids: {
      type: "string",
      description: "\u8981\u5BF9\u7167\u7684 arXiv \u7F16\u53F7\uFF0C\u9017\u53F7\u5206\u9694\uFF0C\u5982 2605.23717,2610.03924\u3002\u7701\u7565\u5219\u5BF9\u7167\u76EE\u5F55\u91CC\u5DF2\u6709\u7684\u7B14\u8BB0\uFF08\u6700\u591A 8 \u7BC7\uFF09\u3002"
    }
  },
  output: {
    schema: { type: "string" },
    render: (_args, value) => [{ type: "text", text: value }]
  },
  async execute(args) {
    const raw = String(args.arxiv_ids ?? "").trim();
    try {
      const ids = raw ? raw.split(/[,，\s]+/).map((s) => s.replace(/^arxiv:/i, "").trim()).filter(Boolean) : readdirSync(NOTES_DIR).filter((name2) => /^\d{4}\.\d{4,5}(v\d+)?\.json$/.test(name2)).map((name2) => name2.replace(/\.json$/, "")).slice(0, 8);
      const notes = [];
      const missing = [];
      for (const id of ids) {
        const note = loadNote(id);
        if (note) notes.push(note);
        else missing.push(id);
      }
      await traceTool({ tool: "compare_notes", args: { arxiv_ids: raw }, size: notes.length, ok: true });
      const head = missing.length ? `\u8FD9\u4E9B\u7F16\u53F7\u8FD8\u6CA1\u6709\u7B14\u8BB0\uFF0C\u672A\u7EB3\u5165\u5BF9\u7167\uFF1A${missing.join("\u3001")}\u3002

` : "";
      return head + formatCompare(notes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await traceTool({ tool: "compare_notes", args: { arxiv_ids: raw }, ok: false, detail: msg });
      return `compare_notes \u5931\u8D25\uFF1A${msg}`;
    }
  }
});
function registerCompareNotes(ctx) {
  ctx.tools.register(compareNotesTool);
}

// src/tools/fetchArxiv.ts
import { defineTool as defineTool2 } from "@deepseek-ai/dsh-tools";

// src/arxiv.ts
import { setDefaultResultOrder } from "node:dns";
var ARXIV_API = "https://export.arxiv.org/api/query?id_list=";
var PDF_URL = "https://arxiv.org/pdf/";
var UA = "paper-navigator-plugin/0.1 (course project; contact via user)";
try {
  setDefaultResultOrder("ipv4first");
} catch {
}
function collapse(s) {
  return s.replace(/\s+/g, " ").trim();
}
async function fetchWithRetry(url, init, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastErr = err;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? collapse(m[1]) : "";
}
function arxivSearchUrl(query, maxResults = 5) {
  const q = query.trim();
  const search = /^(?:all|ti|au|abs|cat):/i.test(q) ? q : `all:${q}`;
  const n = Math.min(Math.max(Math.floor(maxResults) || 1, 1), 8);
  return `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(search)}&start=0&max_results=${n}&sortBy=relevance`;
}
function arxivIdFromAtom(idUrl) {
  const m = idUrl.match(/(\d{4}\.\d{4,5})(?:v\d+)?/);
  return m ? m[1] : collapse(idUrl);
}
function parseArxivFeed(xml) {
  const hits = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const block = m[1];
    const title = pick(block, "title");
    const id = arxivIdFromAtom(pick(block, "id"));
    if (!title || !id) continue;
    const authors = [...block.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((a) => collapse(a[1]));
    hits.push({
      arxivId: id,
      title,
      authors,
      published: pick(block, "published").slice(0, 10),
      summary: pick(block, "summary")
    });
  }
  return hits;
}
async function searchArxiv(query, maxResults = 5) {
  const url = arxivSearchUrl(query, maxResults);
  const res = await fetchWithRetry(url, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(45e3)
  });
  if (!res.ok) throw new Error(`arXiv \u68C0\u7D22 HTTP ${res.status}`);
  return parseArxivFeed(await res.text());
}
async function fetchArxivMeta(id) {
  const res = await fetchWithRetry(ARXIV_API + encodeURIComponent(id), {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(45e3)
  });
  if (!res.ok) throw new Error(`arXiv API HTTP ${res.status}`);
  const xml = await res.text();
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entry) throw new Error(`arXiv \u4E0A\u627E\u4E0D\u5230 ${id}\uFF08\u8FD4\u56DE\u91CC\u6CA1\u6709 entry\uFF09`);
  const block = entry[1];
  const title = pick(block, "title");
  if (!title) throw new Error(`arXiv \u8FD4\u56DE\u7684 ${id} \u7F3A\u5C11\u6807\u9898`);
  const authors = [...block.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => collapse(m[1]));
  return {
    arxivId: id,
    title,
    authors,
    abstract: pick(block, "summary"),
    updatedAt: pick(block, "updated")
  };
}
async function downloadPdf(id) {
  const { readFile, writeFile, mkdir } = await import("node:fs/promises");
  const { join: join2 } = await import("node:path");
  const os = await import("node:os");
  const dir = join2(os.tmpdir(), "paper-navigator");
  await mkdir(dir, { recursive: true });
  const safe = id.replace(/[^A-Za-z0-9._-]/g, "_");
  const path = join2(dir, `${safe}.pdf`);
  try {
    const cached = await readFile(path);
    if (cached.length > 1024 && cached.subarray(0, 5).toString("latin1") === "%PDF-") return path;
  } catch {
  }
  const res = await fetchWithRetry(PDF_URL + id, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(18e4)
  });
  if (!res.ok) throw new Error(`PDF \u4E0B\u8F7D HTTP ${res.status}\uFF08${PDF_URL}${id}\uFF09`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new Error(`\u4E0B\u8F7D\u5185\u5BB9\u4E0D\u662F PDF\uFF08\u524D 5 \u5B57\u8282 ${JSON.stringify(buf.subarray(0, 5).toString("latin1"))}\uFF09`);
  }
  await writeFile(path, buf);
  return path;
}

// src/pdf.ts
var workerReady;
function ensurePdfWorker() {
  workerReady ??= (async () => {
    const worker = await import("./pdf.worker-LGO7IWIL.js");
    globalThis.pdfjsWorker = worker;
  })();
  return workerReady;
}
async function extractPages(pdfPath) {
  await ensurePdfWorker();
  const { readFile } = await import("node:fs/promises");
  const data = await readFile(pdfPath);
  const pdfjs = await import("./pdf-S5IUITYC.js");
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    isEvalSupported: false,
    useSystemFonts: false
  });
  const doc = await task.promise;
  const pages = [];
  let totalChars = 0;
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items = content.items.filter((it) => typeof it.str === "string" && it.transform).map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5], width: it.width ?? 0 }));
    totalChars += items.reduce((n, it) => n + it.str.length, 0);
    pages.push({ width: viewport.width, height: viewport.height, lines: buildLines(items, viewport.width) });
    page.cleanup();
  }
  try {
    await task.destroy();
  } catch {
  }
  if (totalChars < 60 * pages.length) {
    throw new Error(`PDF \u7591\u4F3C\u65E0\u6587\u672C\u5C42\uFF08${pages.length} \u9875\u4EC5\u62BD\u51FA ${totalChars} \u5B57\u7B26\uFF09\u3002\u672C\u671F\u4E0D\u505A OCR\uFF0C\u8BF7\u6362\u4E00\u7BC7\u6709\u6587\u672C\u5C42\u7684\u8BBA\u6587\u3002`);
  }
  return pages;
}
function buildLines(items, pageWidth) {
  const rows = /* @__PURE__ */ new Map();
  for (const it of items) {
    const key = Math.round(it.y / 3) * 3;
    const row = rows.get(key);
    if (row) row.push(it);
    else rows.set(key, [it]);
  }
  const lines = [];
  const colGap = Math.max(24, pageWidth * 0.04);
  for (const key of [...rows.keys()].sort((a, b) => b - a)) {
    const row = (rows.get(key) ?? []).sort((a, b) => a.x - b.x);
    let seg = [];
    const flush = () => {
      if (seg.length > 0) {
        const text = seg.map((it) => it.str).join("").replace(/\s+/g, " ").trim();
        if (text) lines.push({ x: seg[0].x, y: key, text });
        seg = [];
      }
    };
    let prevEnd = -Infinity;
    for (const it of row) {
      if (seg.length > 0 && it.x - prevEnd > colGap) flush();
      seg.push(it);
      prevEnd = it.x + it.width;
    }
    flush();
  }
  return lines;
}
function looksLikeHeading(text) {
  const t = text.trim();
  if (t.length < 3 || t.length > 90) return void 0;
  const roman = t.match(/^((?:[IVXLCDM]{1,7}))\.\s+(\S.*)$/);
  const numeric = t.match(/^(\d{1,2})\.?\s+([A-Z]\S.*)$/);
  let title;
  if (roman && isRoman(roman[1])) title = roman[2];
  else if (numeric) title = numeric[2];
  else {
    const special = t.match(/^(Abstract|ABSTRACT|References|REFERENCES|Acknowledg(?:e)?ments?|ACKNOWLEDG?E?MENTS?|Appendix(?:es)?|APPENDIX(?:ES)?|Conclusion[s]?|CONCLUSION[S]?)\s*\.?$/);
    if (special) title = special[1];
  }
  if (!title) return void 0;
  const letters = (title.match(/[A-Za-z]/g) ?? []).length;
  if (letters < 3) return void 0;
  if (letters / title.length < 0.5) return void 0;
  if (/[=<>{}|$\\]/.test(title)) return void 0;
  return { title: title.trim() };
}
function isRoman(s) {
  return /^(?:M{0,3})(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/.test(s) && /[IVXLCDM]/.test(s);
}
function detectSections(pages) {
  const flat = [];
  pages.forEach((page, p) => {
    for (const line of page.lines) flat.push({ page: p, text: line.text });
  });
  const bounds = [
    { title: "\u9898\u5934\u4E0E\u6458\u8981", startFlat: 0 }
  ];
  let lastTitle = "";
  for (let i = 0; i < flat.length; i++) {
    const hit = looksLikeHeading(flat[i].text);
    if (hit && hit.title.toLowerCase() !== lastTitle.toLowerCase()) {
      if (bounds.length === 1 && /^abstract$/i.test(hit.title)) continue;
      bounds.push({ title: hit.title, startFlat: i });
      lastTitle = hit.title;
    }
  }
  const sections = bounds.map((b, i) => {
    const startFlat = b.startFlat;
    const endFlat = i + 1 < bounds.length ? bounds[i + 1].startFlat : flat.length;
    const text = flat.slice(startFlat, endFlat).map((l) => l.text).join("\n");
    return {
      index: i,
      title: b.title,
      startPage: flat[startFlat]?.page ?? 0,
      endPage: flat[Math.max(0, endFlat - 1)]?.page ?? pages.length - 1,
      words: countWords(text),
      startFlat,
      endFlat
    };
  });
  return { flat, sections };
}
function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// src/tools/fetchArxiv.ts
var fetchArxivTool = defineTool2({
  name: "fetch_arxiv",
  description: "\u62C9\u53D6 arXiv \u8BBA\u6587\u7684\u6807\u9898\u3001\u4F5C\u8005\u3001\u6458\u8981\uFF0C\u4E0B\u8F7D PDF \u5E76\u62BD\u53D6\u7AE0\u8282\u3002\u4E4B\u540E\u7528 list_sections \u770B\u76EE\u5F55\uFF0C\u4E0D\u8981\u5047\u8BBE\u7AE0\u8282\u7ED3\u6784\u3002",
  parameters: {
    arxiv_id: {
      type: "string",
      required: true,
      description: "arXiv \u7F16\u53F7\uFF0C\u5982 1706.03762\uFF08\u53EF\u5E26\u7248\u672C\u53F7 1706.03762v2\uFF09"
    }
  },
  output: {
    schema: { type: "string" },
    render: (_args, value) => [{ type: "text", text: value }]
  },
  async execute(args) {
    try {
      const meta = await fetchArxivMeta(args.arxiv_id);
      const pdfPath = await downloadPdf(args.arxiv_id);
      const pages = await extractPages(pdfPath);
      const { flat, sections } = detectSections(pages);
      paperStore.set({
        arxivId: meta.arxivId,
        title: meta.title,
        authors: meta.authors,
        abstract: meta.abstract,
        pdfPath,
        pageCount: pages.length,
        flat,
        sections,
        readChunks: []
      });
      await traceTool({ tool: "fetch_arxiv", arxivId: meta.arxivId, args: { arxiv_id: args.arxiv_id }, size: pages.length, ok: true });
      return [
        `\u5DF2\u83B7\u53D6 arXiv:${meta.arxivId}`,
        `\u6807\u9898\uFF1A${meta.title}`,
        `\u4F5C\u8005\uFF1A${meta.authors.join(", ") || "\u672A\u77E5"}`,
        `\u9875\u6570\uFF1A${pages.length}\uFF1B\u8BC6\u522B\u51FA ${sections.length} \u4E2A\u7AE0\u8282\u5757`,
        "",
        "\u6458\u8981\uFF1A",
        meta.abstract,
        "",
        "\u4E0B\u4E00\u6B65\uFF1A\u7528 list_sections \u67E5\u770B\u7AE0\u8282\u76EE\u5F55\uFF0C\u518D\u6311\u4E0E\u95EE\u9898/\u65B9\u6CD5/\u5B9E\u9A8C/\u5C40\u9650\u76F8\u5173\u7684\u7AE0\u8282\u8BFB\u53D6\u3002"
      ].join("\n");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await traceTool({ tool: "fetch_arxiv", args: { arxiv_id: args.arxiv_id }, ok: false, detail: msg });
      return `fetch_arxiv \u5931\u8D25\uFF1A${msg}
\u8BF7\u628A\u5931\u8D25\u539F\u56E0\u539F\u6837\u544A\u77E5\u7528\u6237\uFF0C\u4E0D\u8981\u7F16\u9020\u8BBA\u6587\u5185\u5BB9\u3002`;
    }
  }
});
function registerFetchArxiv(ctx) {
  ctx.tools.register(fetchArxivTool);
}

// src/tools/listSections.ts
import { defineTool as defineTool3 } from "@deepseek-ai/dsh-tools";
var listSectionsTool = defineTool3({
  name: "list_sections",
  description: "\u5217\u51FA\u5DF2\u83B7\u53D6\u8BBA\u6587\u7684\u7AE0\u8282\u76EE\u5F55\u4E0E\u6BCF\u8282\u8BCD\u6570\u3002\u636E\u6B64\u6311 2-4 \u4E2A\u76F8\u5173\u7AE0\u8282\uFF0C\u4E0D\u8981\u4E00\u6B21\u8BFB\u5168\u6587\u3002",
  parameters: {
    arxiv_id: { type: "string", required: true, description: "\u8981\u67E5\u770B\u76EE\u5F55\u7684 arXiv \u7F16\u53F7\uFF08\u9700\u5DF2 fetch_arxiv\uFF09" }
  },
  output: {
    schema: { type: "string" },
    render: (_args, value) => [{ type: "text", text: value }]
  },
  async execute(args) {
    const record = paperStore.get(args.arxiv_id);
    if (!record) {
      await traceTool({ tool: "list_sections", args: { arxiv_id: args.arxiv_id }, ok: false, detail: "no cache" });
      return `\u6CA1\u6709 ${args.arxiv_id} \u7684\u7F13\u5B58\u3002\u8BF7\u5148\u8C03\u7528 fetch_arxiv\u3002`;
    }
    await traceTool({ tool: "list_sections", arxivId: args.arxiv_id, ok: true, size: record.sections.length });
    const rows = record.sections.map((s) => {
      const range = s.startPage === s.endPage ? `\u7B2C ${s.startPage + 1} \u9875` : `\u7B2C ${s.startPage + 1}\u2013${s.endPage + 1} \u9875`;
      return `[${s.index}] ${s.title}\uFF08${range}\uFF0C\u7EA6 ${s.words} \u8BCD\uFF09`;
    });
    return [
      `\u300A${record.title}\u300B\u7AE0\u8282\u76EE\u5F55\uFF08\u5171 ${record.sections.length} \u5757\uFF0C${record.pageCount} \u9875\uFF09\uFF1A`,
      ...rows,
      "",
      "\u63D0\u793A\uFF1A\u8BFB [0] \u53EF\u62FF\u5230\u9898\u5934\u4E0E\u6458\u8981\u533A\uFF1B\u65B9\u6CD5\u3001\u5B9E\u9A8C\u3001\u5C40\u9650\u76F8\u5173\u7AE0\u8282\u6309\u9700\u8BFB\u53D6\u3002\u6BCF\u8282\u7528 read_section \u5E76\u7ED9 max_chars\uFF0C\u907F\u514D\u6574\u7BC7\u8FDB\u5165\u4E0A\u4E0B\u6587\u3002"
    ].join("\n");
  }
});
function registerListSections(ctx) {
  ctx.tools.register(listSectionsTool);
}

// src/tools/readSection.ts
import { defineTool as defineTool4 } from "@deepseek-ai/dsh-tools";
var DEFAULT_MAX_CHARS = 4e3;
var HARD_CAP = 12e3;
var readSectionTool = defineTool4({
  name: "read_section",
  description: "\u8BFB\u53D6\u67D0\u4E00\u8282\u7684\u6B63\u6587\uFF08\u53D7 max_chars \u9650\u5236\uFF09\u3002\u8FD4\u56DE\u7684\u6587\u672C\u5C31\u662F\u4E4B\u540E write_note \u91CC quote \u7684\u5408\u6CD5\u6765\u6E90\uFF0C\u5F15\u7528\u8BF7\u9010\u5B57\u590D\u5236\u3002",
  parameters: {
    arxiv_id: { type: "string", required: true, description: "arXiv \u7F16\u53F7\uFF08\u9700\u5DF2 fetch_arxiv\uFF09" },
    section: { type: "integer", required: true, description: "list_sections \u8F93\u51FA\u7684\u7AE0\u8282\u5E8F\u53F7" },
    max_chars: {
      type: "integer",
      description: `\u672C\u6B21\u6700\u591A\u8FD4\u56DE\u7684\u5B57\u7B26\u6570\uFF0C\u9ED8\u8BA4 ${DEFAULT_MAX_CHARS}\uFF0C\u4E0A\u9650 ${HARD_CAP}`
    }
  },
  output: {
    schema: { type: "string" },
    render: (_args, value) => [{ type: "text", text: value }]
  },
  async execute(args) {
    const record = paperStore.get(args.arxiv_id);
    if (!record) return `\u6CA1\u6709 ${args.arxiv_id} \u7684\u7F13\u5B58\u3002\u8BF7\u5148\u8C03\u7528 fetch_arxiv\u3002`;
    const section = record.sections[args.section];
    if (!section) {
      const known = record.sections.map((s) => `[${s.index}] ${s.title}`).join("\uFF1B");
      return `\u7AE0\u8282\u5E8F\u53F7 ${args.section} \u4E0D\u5B58\u5728\u3002\u53EF\u7528\uFF1A${known}`;
    }
    const full = record.flat.slice(section.startFlat, section.endFlat).map((l) => l.text).join("\n");
    const maxChars = Math.min(Math.max(args.max_chars ?? DEFAULT_MAX_CHARS, 300), HARD_CAP);
    const text = full.length <= maxChars ? full : full.slice(0, maxChars);
    const header = `[\u7AE0\u8282 ${section.index}\uFF1A${section.title}\uFF08\u7B2C ${section.startPage + 1}\u2013${section.endPage + 1} \u9875\uFF09]`;
    const tail = full.length <= maxChars ? "" : `

[\u5DF2\u622A\u65AD\uFF1A\u672C\u8282\u5171 ${full.length} \u5B57\u7B26\uFF0C\u53EA\u8FD4\u56DE\u524D ${maxChars}\u3002\u9700\u8981\u540E\u534A\u90E8\u5206\u53EF\u7528\u66F4\u5927\u7684 max_chars \u91CD\u8BFB\u672C\u8282\u3002]`;
    const returned = `${header}
${text}${tail}`;
    record.readChunks.push(returned);
    await traceTool({ tool: "read_section", arxivId: args.arxiv_id, args: { section: args.section, max_chars: maxChars }, size: text.length, ok: true });
    return returned;
  }
});
function registerReadSection(ctx) {
  ctx.tools.register(readSectionTool);
}

// src/tools/searchArxiv.ts
import { defineTool as defineTool5 } from "@deepseek-ai/dsh-tools";
var searchArxivTool = defineTool5({
  name: "search_arxiv",
  description: "\u6309\u7814\u7A76\u4E3B\u9898\u68C0\u7D22 arXiv\uFF0C\u8FD4\u56DE\u6700\u591A 8 \u7BC7\u7684\u7F16\u53F7\u3001\u6807\u9898\u3001\u4F5C\u8005\u548C\u6458\u8981\u3002\u4E0D\u4E0B\u8F7D PDF\u3002\u7528\u6237\u7ED9\u7684\u662F\u9898\u76EE\u800C\u4E0D\u662F\u7F16\u53F7\u65F6\u5148\u8C03\u7528\u8FD9\u4E2A\uFF0C\u518D\u8BA9\u7528\u6237\u9009\u5B9A 1\u20133 \u7BC7\u7CBE\u8BFB\u3002",
  parameters: {
    query: {
      type: "string",
      required: true,
      description: "\u68C0\u7D22\u8BCD\uFF0C\u5982 autonomous landing heaving deck\u3002\u4E0D\u8981\u81EA\u5DF1\u52A0 all: \u524D\u7F00\u3002"
    },
    max_results: {
      type: "integer",
      description: "\u8FD4\u56DE\u7BC7\u6570\uFF0C\u9ED8\u8BA4 5\uFF0C\u6700\u591A 8"
    }
  },
  output: {
    schema: { type: "string" },
    render: (_args, value) => [{ type: "text", text: value }]
  },
  async execute(args) {
    const query = String(args.query ?? "").trim();
    if (!query) return "search_arxiv \u5931\u8D25\uFF1Aquery \u4E3A\u7A7A\u3002";
    const max = Number(args.max_results ?? 5);
    try {
      const hits = await searchArxiv(query, max);
      await traceTool({ tool: "search_arxiv", args: { query, max_results: max }, size: hits.length, ok: true });
      if (hits.length === 0) return `\u6CA1\u6709\u68C0\u7D22\u5230\u4E0E\u300C${query}\u300D\u76F8\u5173\u7684 arXiv \u8BBA\u6587\u3002\u6362\u66F4\u77ED\u7684\u5173\u952E\u8BCD\u518D\u8BD5\uFF0C\u4E0D\u8981\u7F16\u9020\u7F16\u53F7\u3002`;
      const body = hits.map((hit, i) => {
        const authors = hit.authors.slice(0, 4).join(", ");
        const more = hit.authors.length > 4 ? " \u7B49" : "";
        const summary = hit.summary.replace(/\s+/g, " ").slice(0, 280);
        return [
          `${i + 1}. arXiv:${hit.arxivId}\uFF08${hit.published || "\u65E5\u671F\u672A\u77E5"}\uFF09`,
          hit.title,
          authors ? `\u4F5C\u8005\uFF1A${authors}${more}` : "",
          `\u6458\u8981\uFF1A${summary}${hit.summary.length > 280 ? "\u2026" : ""}`
        ].filter(Boolean).join("\n");
      });
      return [`\u68C0\u7D22\u300C${query}\u300D\uFF0C${hits.length} \u7BC7\u3002\u9009\u5B9A\u540E\u518D fetch_arxiv\uFF0C\u4E0D\u8981\u4E00\u6B21\u8BFB\u5B8C\u5168\u90E8\u3002`, "", ...body].join("\n\n");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await traceTool({ tool: "search_arxiv", args: { query }, ok: false, detail: msg });
      return `search_arxiv \u5931\u8D25\uFF1A${msg}
\u628A\u5931\u8D25\u539F\u56E0\u539F\u6837\u544A\u8BC9\u7528\u6237\uFF0C\u4E0D\u8981\u7F16\u9020\u8BBA\u6587\u3002`;
    }
  }
});
function registerSearchArxiv(ctx) {
  ctx.tools.register(searchArxivTool);
}

// src/tools/writeNote.ts
import { defineTool as defineTool6 } from "@deepseek-ai/dsh-tools";

// src/quoteCheck.ts
var normalizeWs = (s) => s.replace(/\s+/g, " ").trim();
var MIN_QUOTE_CHARS = 8;
function collectQuoteRefs(note) {
  const refs = [];
  for (const field of ["problem", "method", "data", "limitations"]) {
    note[field].quotes.forEach((q, i) => refs.push({ location: `${field}.quotes[${i}]`, quote: q }));
  }
  note.metrics.forEach((m, i) => refs.push({ location: `metrics[${i}]`, quote: m.quote }));
  return refs;
}
function checkQuotes(note, corpus) {
  const hay = normalizeWs(corpus);
  const issues = [];
  for (const ref of collectQuoteRefs(note)) {
    const norm = normalizeWs(ref.quote);
    if (norm.length < MIN_QUOTE_CHARS) {
      issues.push({ location: ref.location, quote: ref.quote, reason: `\u5F15\u7528\u53EA\u6709 ${norm.length} \u4E2A\u5B57\u7B26\uFF08\u6700\u5C11 ${MIN_QUOTE_CHARS}\uFF09\uFF0C\u592A\u77ED\u65E0\u6CD5\u4F5C\u4E3A\u539F\u6587\u4F9D\u636E` });
      continue;
    }
    if (!hay.includes(norm)) {
      issues.push({ location: ref.location, quote: ref.quote, reason: "\u5728\u5DF2\u83B7\u53D6\u7684\u539F\u6587\uFF08\u6458\u8981 + \u5DF2\u8BFB\u7AE0\u8282\uFF09\u4E2D\u627E\u4E0D\u5230\u8FD9\u53E5" });
    }
  }
  return issues;
}

// src/noteRender.ts
function diagramLabel(text) {
  const flat = text.replace(/\s+/g, " ").replace(/["`[\]{}#]/g, "").trim();
  const clause = flat.split(/[。；]/)[0] ?? flat;
  return clause.length <= 36 ? clause : `${clause.slice(0, 36)}\u2026`;
}
function structureDiagram(note) {
  const metric = note.metrics.map((m) => m.value).slice(0, 3).join(" / ");
  const node = (id, title, text) => `  ${id}["${title}\uFF1A${diagramLabel(text)}"]`;
  return [
    "## \u7ED3\u6784",
    "",
    "```mermaid",
    "flowchart TB",
    node("q", "\u95EE\u9898", note.problem.text),
    node("m", "\u65B9\u6CD5", note.method.text),
    node("d", "\u6570\u636E", note.data.text),
    node("k", "\u6307\u6807", metric || "\u89C1\u4E0B\u8868"),
    node("l", "\u5C40\u9650", note.limitations.text),
    "  q --> m --> d --> k --> l",
    "```",
    ""
  ].join("\n");
}
function renderField(title, field, locate) {
  const lines = [`## ${title}`, "", field.text.trim(), ""];
  if (field.quotes.length > 0) lines.push("**\u539F\u6587\u4F9D\u636E**", "");
  for (const q of field.quotes) {
    const loc = locate?.(q);
    lines.push(`> ${normalizeWs(q)}${loc ? `\uFF08\u6765\u6E90\uFF1A${loc}\uFF09` : ""}`, "");
  }
  return lines.join("\n");
}
function noteToMarkdown(note, meta) {
  const head = [
    `# ${note.title.trim()}`,
    "",
    `> arXiv:[${note.arxiv_id}](https://arxiv.org/abs/${note.arxiv_id}) \xB7 ${meta.authors.join(", ") || "\u4F5C\u8005\u672A\u77E5"} \xB7 ${meta.pageCount} \u9875`,
    `> \u7531 Harness \u63D2\u4EF6\u300C\u8BBA\u6587\u9886\u822A\u300D\u751F\u6210\u4E8E ${meta.generatedAt.toISOString().slice(0, 16).replace("T", " ")}\uFF0C\u5168\u90E8\u5F15\u7528\u7ECF write_note \u9010\u5B57\u6821\u9A8C\uFF08\u4EC5\u5408\u5E76\u7A7A\u767D\uFF09`,
    ""
  ].join("\n");
  const metricRows = note.metrics.map((m) => {
    const quote = normalizeWs(m.quote);
    const loc = meta.locate?.(m.quote);
    const short = quote.length > 120 ? quote.slice(0, 117) + "\u2026" : quote;
    return `| ${m.name} | ${m.value} | ${short}${loc ? `\uFF08${loc}\uFF09` : ""} |`;
  }).join("\n");
  const metrics = [
    "## \u6307\u6807",
    "",
    "| \u6307\u6807 | \u6570\u503C | \u539F\u6587\u4F9D\u636E\uFF08\u622A\u53D6\uFF09 |",
    "| --- | --- | --- |",
    metricRows,
    ""
  ].join("\n");
  return [head, structureDiagram(note), renderField("\u95EE\u9898", note.problem, meta.locate), renderField("\u65B9\u6CD5", note.method, meta.locate), renderField("\u6570\u636E", note.data, meta.locate), metrics, renderField("\u5C40\u9650", note.limitations, meta.locate)].join("\n");
}

// src/noteSchema.ts
function isSectionField(v) {
  if (typeof v !== "object" || v === null) return false;
  const o = v;
  return typeof o.text === "string" && Array.isArray(o.quotes) && o.quotes.every((q) => typeof q === "string");
}
function validateNoteShape(raw) {
  const problems = [];
  if (typeof raw !== "object" || raw === null) return ["note \u5FC5\u987B\u662F\u4E00\u4E2A JSON \u5BF9\u8C61"];
  const n = raw;
  if (typeof n.arxiv_id !== "string" || !n.arxiv_id.trim()) problems.push("arxiv_id \u7F3A\u5931\u6216\u4E0D\u662F\u5B57\u7B26\u4E32");
  if (typeof n.title !== "string" || !n.title.trim()) problems.push("title \u7F3A\u5931\u6216\u4E0D\u662F\u5B57\u7B26\u4E32");
  for (const field of ["problem", "method", "data", "limitations"]) {
    const v = n[field];
    if (!isSectionField(v)) {
      problems.push(`${field} \u7F3A\u5931\u6216\u7ED3\u6784\u4E0D\u5BF9\uFF08\u9700\u8981 {text: string, quotes: string[]}\uFF09`);
      continue;
    }
    if (!v.text.trim()) problems.push(`${field}.text \u4E3A\u7A7A`);
  }
  if (!Array.isArray(n.metrics)) {
    problems.push("metrics \u7F3A\u5931\u6216\u4E0D\u662F\u6570\u7EC4");
  } else if (n.metrics.length === 0) {
    problems.push('metrics \u81F3\u5C11\u8981\u6709\u4E00\u6761\uFF08\u6CA1\u6709\u91CF\u5316\u6307\u6807\u7684\u8BBA\u6587\u5199 {name:"\u4E3B\u8981\u7ED3\u679C", value:"\u5B9A\u6027\u63CF\u8FF0", quote:"\u2026"}\uFF09');
  } else {
    n.metrics.forEach((m, i) => {
      if (typeof m !== "object" || m === null) problems.push(`metrics[${i}] \u4E0D\u662F\u5BF9\u8C61`);
      else {
        const o = m;
        for (const k of ["name", "value", "quote"]) {
          if (typeof o[k] !== "string" || !o[k].trim()) problems.push(`metrics[${i}].${k} \u7F3A\u5931\u6216\u4E3A\u7A7A`);
        }
      }
    });
  }
  return problems;
}

// src/locate.ts
function sectionText(record, s) {
  return record.flat.slice(s.startFlat, s.endFlat).map((l) => l.text).join("\n");
}
function locateQuote(quote, record) {
  const q = normalizeWs(quote);
  if (!q) return void 0;
  for (const s of record.sections) {
    if (s.index === 0) continue;
    if (normalizeWs(sectionText(record, s)).includes(q)) {
      const pages = s.startPage === s.endPage ? `\u7B2C ${s.startPage + 1} \u9875` : `\u7B2C ${s.startPage + 1}\u2013${s.endPage + 1} \u9875`;
      return { section: `\xA7${s.index} ${s.title}`, pages };
    }
  }
  if (normalizeWs(record.abstract).includes(q)) return { section: "\u6458\u8981", pages: "\u6458\u8981" };
  const s0 = record.sections[0];
  if (s0 && normalizeWs(sectionText(record, s0)).includes(q)) return { section: "\xA70 \u9898\u5934\u4E0E\u6458\u8981", pages: "\u7B2C 1 \u9875" };
  return void 0;
}

// src/tools/writeNote.ts
var sectionFieldSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: { type: "string", required: true, description: "\u8FD9\u4E00\u90E8\u5206\u7684\u603B\u7ED3\uFF0C2-4 \u53E5" },
    quotes: { type: "array", items: { type: "string" }, description: "\u539F\u6587\u4F9D\u636E\uFF1B\u6BCF\u6761\u9010\u5B57\u6765\u81EA fetch_arxiv \u7684\u6458\u8981\u6216 read_section \u7684\u8FD4\u56DE\u6587\u672C\uFF08\u22658 \u5B57\u7B26\uFF09" }
  }
};
var writeNoteTool = defineTool6({
  name: "write_note",
  description: "\u63D0\u4EA4\u7ED3\u6784\u5316\u7B14\u8BB0\u3002\u6240\u6709 quote \u4F1A\u5148\u505A\u5F15\u7528\u6821\u9A8C\uFF08\u53EA\u5408\u5E76\u7A7A\u767D\u540E\u5FC5\u987B\u5728\u5DF2\u83B7\u53D6\u539F\u6587\u4E2D\u9010\u5B57\u547D\u4E2D\uFF09\uFF1B\u6821\u9A8C\u4E0D\u901A\u8FC7\u65F6\u6574\u4EFD\u7B14\u8BB0\u88AB\u9000\u56DE\uFF0C\u6309\u9519\u8BEF\u6E05\u5355\u4FEE\u6539\u540E\u91CD\u65B0\u63D0\u4EA4\u3002",
  parameters: {
    note: {
      type: "object",
      required: true,
      additionalProperties: false,
      properties: {
        arxiv_id: { type: "string", required: true, description: "\u8BBA\u6587\u7684 arXiv \u7F16\u53F7\uFF08\u9700\u5DF2 fetch_arxiv\uFF09" },
        title: { type: "string", required: true, description: "\u8BBA\u6587\u6807\u9898" },
        problem: sectionFieldSchema,
        method: sectionFieldSchema,
        data: sectionFieldSchema,
        limitations: sectionFieldSchema,
        metrics: {
          type: "array",
          description: "\u5173\u952E\u91CF\u5316\u6307\u6807\uFF0C\u81F3\u5C11\u4E00\u6761",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string", required: true, description: "\u6307\u6807\u540D\uFF0C\u5982 Success rate" },
              value: { type: "string", required: true, description: "\u6570\u503C\uFF0C\u5982 74.21%" },
              quote: { type: "string", required: true, description: "\u542B\u8BE5\u6570\u5B57\u7684\u539F\u6587\u4F9D\u636E\uFF0C\u9010\u5B57" }
            }
          }
        }
      }
    }
  },
  output: {
    schema: { type: "string" },
    render: (_args, value) => [{ type: "text", text: value }]
  },
  async execute(args) {
    const note = args.note;
    const shapeProblems = validateNoteShape(note);
    if (shapeProblems.length > 0) {
      return ["[write_note] \u7ED3\u6784\u6821\u9A8C\u672A\u901A\u8FC7\uFF0C\u7B14\u8BB0\u672A\u5199\u5165\uFF1A", ...shapeProblems.map((p, i) => `${i + 1}. ${p}`), "", "\u4FEE\u6B63\u540E\u91CD\u65B0\u63D0\u4EA4\u5B8C\u6574\u7B14\u8BB0\u3002"].join("\n");
    }
    const record = paperStore.get(note.arxiv_id);
    if (!record) {
      return `[write_note] \u6CA1\u6709 ${note.arxiv_id} \u7684\u7F13\u5B58\uFF1A\u8BF7\u5148 fetch_arxiv\uFF0C\u8BFB\u5B8C\u7AE0\u8282\u540E\u518D\u63D0\u4EA4\u7B14\u8BB0\u3002`;
    }
    const issues = checkQuotes(note, paperStore.corpus(record));
    if (issues.length > 0) {
      await traceTool({ tool: "write_note", arxivId: note.arxiv_id, ok: false, detail: `${issues.length} quote issue(s)` });
      return [
        `[write_note] \u5F15\u7528\u6821\u9A8C\u672A\u901A\u8FC7\uFF08${issues.length} \u6761\u95EE\u9898\uFF09\uFF0C\u7B14\u8BB0\u672A\u5199\u5165\uFF1A`,
        ...issues.map((it, i) => `${i + 1}. ${it.location}\uFF1A\u300C${normalizeWs(it.quote).slice(0, 80)}${normalizeWs(it.quote).length > 80 ? "\u2026" : ""}\u300D\u2014\u2014 ${it.reason}`),
        "",
        "\u5904\u7406\u65B9\u5F0F\uFF1A\u5F15\u7528\u5FC5\u987B\u9010\u5B57\u6765\u81EA\u6458\u8981\u6216\u5DF2\u8BFB\u7AE0\u8282\u7684\u8FD4\u56DE\u6587\u672C\uFF08\u6821\u9A8C\u53EA\u5408\u5E76\u7A7A\u767D\u5B57\u7B26\uFF09\u3002\u53EF\u4EE5\u5148 read_section \u8865\u8BFB\u76F8\u5173\u7AE0\u8282\uFF0C\u518D\u4FEE\u6539\u540E\u91CD\u65B0\u63D0\u4EA4\u5B8C\u6574\u7B14\u8BB0\u3002\u4E0D\u8981\u51ED\u8BB0\u5FC6\u5199\u6570\u5B57\u3002"
      ].join("\n");
    }
    const markdown = noteToMarkdown(note, {
      authors: record.authors,
      pageCount: record.pageCount,
      generatedAt: /* @__PURE__ */ new Date(),
      locate: (q) => {
        const loc = locateQuote(q, record);
        if (!loc) return void 0;
        return loc.section === "\u6458\u8981" ? "\u6458\u8981" : `${loc.section}\uFF0C${loc.pages}`;
      }
    });
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { join: join2 } = await import("node:path");
    await mkdir(NOTES_DIR, { recursive: true });
    const safe = note.arxiv_id.replace(/[^A-Za-z0-9._-]/g, "_");
    const path = join2(NOTES_DIR, `${safe}.md`);
    await writeFile(path, markdown, "utf8");
    await writeFile(path.replace(/\.md$/, ".json"), JSON.stringify(note, null, 2), "utf8");
    const quoteCount = countQuotes(note);
    await traceTool({ tool: "write_note", arxivId: note.arxiv_id, ok: true, size: quoteCount, detail: path });
    return `[write_note] \u7B14\u8BB0\u5DF2\u5199\u5165 ${path}\uFF1B${quoteCount} \u6761\u5F15\u7528\u5168\u90E8\u547D\u4E2D\u539F\u6587\u3002\u5BF9\u7167\u9605\u8BFB\uFF08\u5DE6 PDF\u3001\u53F3\u7B14\u8BB0\uFF0C\u542B\u7ED3\u6784\u56FE\uFF09\uFF1Asite/read.html?id=${safe}\u3002\u53EF\u4EE5\u5411\u7528\u6237\u603B\u7ED3\u8FD9\u7BC7\u8BBA\u6587\u4E86\u3002`;
  }
});
function countQuotes(note) {
  return note.problem.quotes.length + note.method.quotes.length + note.data.quotes.length + note.limitations.quotes.length + note.metrics.length;
}
function registerWriteNote(ctx) {
  ctx.tools.register(writeNoteTool);
}

// src/index.ts
var name = "paper-navigator";
var inject = ["tools", "skills"];
function apply(ctx) {
  registerSearchArxiv(ctx);
  registerFetchArxiv(ctx);
  registerListSections(ctx);
  registerReadSection(ctx);
  registerWriteNote(ctx);
  registerCompareNotes(ctx);
  ctx.skills.register({
    name: "paper",
    description: "\u8BBA\u6587\u9886\u822A\uFF1A\u4ECE\u7814\u7A76\u4E3B\u9898\u68C0\u7D22 arXiv\uFF0C\u6216\u6309\u7F16\u53F7\u7CBE\u8BFB\u4E00\u7BC7\u8BBA\u6587\uFF0C\u5199\u51FA\u5E26\u5F15\u7528\u6821\u9A8C\u7684\u7B14\u8BB0\uFF0C\u5E76\u53EF\u5BF9\u7167\u5DF2\u843D\u76D8\u7684\u7B14\u8BB0\u3002\u7528\u6CD5\uFF1A/paper 1706.03762\uFF0C\u6216\u8BF4\u300C\u9605\u8BFB arXiv:1706.03762\u300D\u300C\u5BF9\u6BD4\u8FD9\u4E24\u7BC7\u300D\u3002",
    whenToUse: "\u7528\u6237\u7ED9\u51FA arXiv \u7F16\u53F7\u3001\u7814\u7A76\u4E3B\u9898\uFF0C\u6216\u8981\u6C42\u5BF9\u7167\u5DF2\u8BFB\u8BBA\u6587\u65F6",
    source: "runtime",
    content: PAPER_SKILL_CONTENT
  });
  console.log(
    '[paper-navigator] 6 tools + skill "paper": search_arxiv / fetch_arxiv / list_sections / read_section / write_note / compare_notes'
  );
}
export {
  apply,
  inject,
  name
};
