# Agent 循环一页纸（第 1 周 · 任务 4）

Harness commit：`2e39e70496aa02986ca6a820c5d497e816b69d7e`。配套文档：仓库内 `docs/agent-lifecycle.md`（时序图）、`docs/architecture.md`。代码主入口是 `ReactLoopAgent`（packages/core/agent-loop），整个循环由一个 Driver 驱动，工具与模型都是 Cordis 服务（`ctx.tools` / `ctx.llm`）。

五个环节的代码位置：

| 环节 | 位置 | 说明 |
| --- | --- | --- |
| 1. 用户输入进入 turn | `packages/core/agent-loop/src/agent.ts:274`（`kick()`）、`:333`（`turn()`） | `while (await this.turn())` 驱动；`turn/start` 在 :342，`turn/end` 在 :428 |
| 2. 组装提示 | `agent.ts:289`（`preStep()`） | 先 `tools.resolve`（:298）解析本步可用工具集，再 `systemPrompt.assemble`（:300，实现在 `packages/core/system-prompt/src/index.ts:622`）；请求体在 `:662 buildRequest()` 组装，历史取自 `:734 session.deriveMessages()` |
| 3. 调用模型 | `agent.ts:496` | `preparedCall.stream(request)` 发起流式调用；下层 `llm/stream` waterfall 在 `packages/llm/llm/src/index.ts:1152`，DeepSeek 适配器在 `packages/llm/llm-deepseek/src/adapter.ts:55` |
| 4. 执行工具 | `agent.ts:592-596` | 从模型输出过滤 `tool-call` block，调 `tools.execute`；链路：`ToolsService.execute`（`packages/core/tools/src/index.ts:375`）→ `NativeToolExecutor`（`packages/core/tool-executor-native/src/index.ts:19`）→ `executeToolBatch`（`packages/core/tools/src/batch.ts:50`，并行调度在 :117） |
| 5. 写回历史 | `agent.ts:580` | `session.append('assistant/message', ...)` 写回助手消息；工具结果由 `packages/core/tools/src/batch.ts:256` 写 `tool/result`；全部以 durable `session/event` 落库可回放 |

插件相关的三个挂点（后续插件开发会用到）：

- 工具定义与注册：`defineTool` 在 `packages/core/tools/src/schema.ts:555`；`ctx.tools.register()` 在 `packages/core/tools/src/index.ts:128`（注册挂 cordis teardown，卸载即反注册）。
- `--patch` 挂载链：CLI 参数 `apps/cli/src/args.ts:170`；启动叠层顺序在 `apps/cli/src/profile-boot.ts`——bundle 层 → profile 的 `cordis.patch.yml` → `--patch` overlay 依次叠加；`web` profile 由 `packages/util/official-bundles/src/bundles.ts:14` 定义（base + web-app）。
- 技能注入：`ctx.skills` 注册表在 `packages/skill/skill/src/index.ts:359`；文件系统技能发现 `packages/skill/skill-filesystem/src/index.ts:134`；`agent/pre-step` 钩子把 `<available_skills>` 目录注入上下文在 `packages/skill/tool-skill/src/index.ts:218`。

一句话总结：**模型只负责决定调用哪个工具，确定性代码执行工具；Driver 负责一切编排；所有状态经 session 事件落盘。**这正是方案 4.2 节设计四个工具时依据的分工原则。
