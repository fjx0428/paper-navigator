# 论文领航 —— DeepSeek Harness 论文阅读插件

厦门大学信息学院「学科实践三 / A+ 协同编程」期末项目。在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 上开发论文阅读插件：可以按主题 `search_arxiv`，也可以对一个 arXiv id 精读，产出带原文引用的结构化笔记（问题 / 方法 / 数据 / 指标 / 局限）。引用对不上原文会被 `write_note` 拒绝并退回。已落盘的笔记用 `compare_notes` 对照，不补笔记里没有的数字。

实施路线见《大模型方向实施方案.md》。

## 环境锁定（2026-11-21）

| 项 | 版本 / 值 |
| --- | --- |
| Node | v26.13.0 |
| pnpm | 11.28.13 |
| Harness commit | `2e39e70496aa02986ca6a820c5d497e816b69d7e`（浅克隆） |
| API Key | `DEEPSEEK_API_KEY`（已发表评测）、`ZHIPU_API_KEY`（智谱 GLM）。都在本机环境变量，仓库和 `.env` 之外不记录密钥 |

Harness 源码克隆在本目录的 `deepseek-harness/`（已被 `.gitignore` 排除，不随本仓库提交），本仓库只记录其 commit。智谱模型列表在 `config/zhipu.patch.yml`。插件工作时暂定调用 **GLM-5.3-Flash**（`provider: zhipu`，`reasoningEffort: high`），web 和 headless 都已写成这个默认。回到评测模型：`node scripts/use-model.mjs deepseek-flash`。选型见 `site/models.html`。

## 复现步骤

```sh
# 1. Harness 源码（浅克隆足够：读源码 + 构建，不需要历史）
git clone --depth 1 https://github.com/deepseek-ai/deepseek-harness.git

# 2. 依赖（npmjs 网络慢时加镜像源；网络中断重跑即可断点续装）
cd deepseek-harness
pnpm install --registry=https://registry.npmmirror.com

# 3. 构建 + 启动网页（默认 http://127.0.0.1:3080）
pnpm run build
pnpm dsh web --patch /Users/leiyu/学科实践大作业/plugin/cordis.yml
```

## 插件的挂载方式（本仓库 plugin/）

- `plugin/cordis.yml`：用 `- insert:` 语法 + **绝对路径** 注册插件（loader 不改变模块解析基准目录）。
- `plugin/src/index.ts`：当前是第 1 周的挂载验证（`greet` 工具）；第 2 周起替换为四个论文工具。
- `plugin/package.json`：依赖用 `link:` 指向本地 Harness 工作区包（`vendor/cordis`、`packages/core/tools`）。**原因**：插件目录在 Harness 仓库之外，根 node_modules 不链接 `dsh-tools` 等内部包，外部模块必须靠自己的 node_modules 向上解析。改 Harness commit 后需在 `plugin/` 重跑一次 `pnpm install`。

## 评测集（eval/papers.jsonl）

8 篇论文，每篇 3 个标准事实（方法 / 主指标 / 数据）：

- 前 6 篇为经典 LLM/推荐系统论文，事实来自论文原文。
- 第 7 篇（2605.23717，Vision-Based Agile Landing）与第 8 篇（2610.03924，Barrier-Shaped Recurrent RL）为同领域姊妹篇（后者引用前者），事实依据为已通读的论文全文——两篇事实易混淆，专门用于考验引用校验。
- DIN（1706.06978）的指标数字取自论文表 3 与表 5。
- 长论文裁剪测试（第 4 周）使用评测集之外的长综述（如 2303.18223），不进评测表。

## 目录结构

- `plugin/` — 插件源码（cordis.yml、index.ts、package.json）
- `eval/` — 评测集与脚本（papers.jsonl 已就绪）
- `site/` — 作品展示网站（第 7 周）
- `docs/` — `agent-loop-notes.md`（Agent 循环一页纸，第 1 周）、architecture.md、demo-script.md
- `deepseek-harness/` — Harness 源码（git-ignored，仅本机）

## 进度（2026-11-21 · 八周任务全部完成）

- [x] 第 1 周 · 环境与 Harness 就绪、greet 工具挂载验证、Agent 循环一页纸、评测集
- [x] 第 2 周 · 四个工具 + 引用校验（单测 17/17；真实 arXiv 冒烟：伪造指标被拒）
- [x] 第 3 周 · paper 技能 + 网页全流程（「阅读 arXiv:2210.03629」→ 1 轮 11 步 → 19 条引用全部命中）
- [x] 第 4 周 · 长论文裁剪（2303.18223，144 页选读 13 次共 3.6 万字符）+ 退回重试两例
- [x] 第 5 周 · 8 篇论文 × 两组全量评测 → `eval/results.md`
- [x] 第 6 周 · 演示冻结：README 复现步骤全程实测过；演示脚本 `docs/demo-script.md`
- [x] 第 7 周 · 展示网站 `site/`（首页/架构/演示/评测/运行 五页）
- [x] 第 8 周 · 答辩 PPT 12 页（`docs/答辩PPT.pptx`，构建脚本 `scripts/build_ppt.js`）+ 3 分钟视频分镜脚本（**视频录制需本人配旁白**，按 demo-script.md 分镜执行）

## 评测结果（DeepSeek-V4.1-Flash，2026-11-21）

| 指标 | 插件组（四工具 + 校验） | 摘要对照组（无工具） |
| --- | --- | --- |
| 笔记六字段完整 | 8/8 | 8/8 |
| 引用逐字命中率 | **158/158（100%）** | 78/81（96%，未命中的 3 条都在 DIN，是摘要里没有、模型凭记忆写成的指标句） |
| 事实关键记号命中 | **118/150（79%）** | 86/150（57%；LoRA 论文 3/11） |
| 平均工具调用次数 | 11.3 次/篇 | 0（无工具） |

对照组引用总量只有插件组一半（81 vs 158）。96% 看起来接近，是因为对照组主要在复述摘要。3 条未命中全部出在 DIN（1706.06978）：摘要没有 AUC，模型写了一句原文里不存在的 “DIN improves AUC by 0.0090…”。内容差距看事实记号，57% 对 79%（eval/results.md）。换智谱模型不会自动改这张表，选型见 site/models.html。

## 完成标准对照（实施方案第 10 节）

- ✅ 给定评测集 arXiv id，网页会话产出 Markdown 笔记（8/8）
- ✅ 笔记依据能在抽出原文中找到；对不上的句子被 write_note 拒绝（评测 158/158 + 退回案例）
- ✅ 评测表 8 篇 + 只贴摘要对照（eval/results.md / site/eval.html）
- ✅ README 写明 commit 与启动命令，步骤全部实测（约 30 分钟可复现）
- ✅ 展示网站五页可独立看懂架构、轨迹与评测
- ✅ 12 页 PPT 就绪；3 分钟视频分镜完成（录制待本人执行）

## 已知问题（如实记录）

- **web 端 `/paper` 斜杠手势**：对运行时注册技能报 `source must be a string`（Harness 0.2.2-rc.5 的 runtime skill 校验在加载路径上要求 source 字段；插件注册时已传 `source: 'runtime'`，headless 与自然语言入口均正常）。规避：对话里直接说「阅读 arXiv:xxx」或用 `dsh headless`。
- **arXiv 网络抖动**：本机到 arxiv.org 偶发连接秒断（疑似 IPv6 路径问题）。fetch_arxiv 已内置 3 次退避重试；极端情况模型会自行重试或如实报告失败。
- **PDF 双栏/公式**：双栏切分按 x 间隙处理，公式密集页的行序偶有噪声；引用校验因此会更严格（字符级差异即退回），这是特性不是缺陷。

### 第 1 周验收记录（2026-11-21）

- 启动：`pnpm dsh web --patch /Users/leiyu/学科实践大作业/plugin/cordis.yml`，启动日志出现 `[paper-navigator] plugin loaded, greet tool registered`。
- 对话输入「请使用 greet 工具向 Ada 打个招呼」，模型调用工具并回显工具返回值；用量 19.8K tok，263 tok/s。
- `dsh` 实为源码直跑（根 package.json 的 `"dsh"` 脚本用 tsx 加载 `apps/cli/src/bin.ts`），`pnpm run build` 的产物供 web profile 使用；构建 98 秒完成（10 个 gate 全部 PASS）。

## 后续方向：原生插件化（毕设提案）

当前是演示形态（`--patch` 手工挂载 + 本机 profile 管模型路由）。原生化路径已成正式提案：[docs/native-plugin-roadmap.md](docs/native-plugin-roadmap.md)——打包成 dsh bundle，自带工具/技能/智谱模型路由，用户侧 `dsh plugin add` 一条命令 + 填自己的 API Key 即可用。这是把本项目延伸为毕业设计的首选方向。
