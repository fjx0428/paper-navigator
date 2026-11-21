# 原生插件化路线（毕设方向 · v2 提案）

现状是**演示形态**：插件靠 `--patch` 手工挂载，模型路由依赖本机 profile 的智谱配置。本文描述把它做成 **Harness 原生插件**的完整路径——完成后，任何 Harness 用户：

```sh
dsh plugin --profile demo add github:fjx0428/paper-navigator
export ZHIPU_API_KEY=自己的key
```

即获得全部六个工具、paper 技能、引用校验和默认的 GLM 模型路由。官方机制见 Harness 文档 `docs/user/develop/basic/publish.md`（bundle / profile 两清单模型）。

## 一、打包形态：dsh bundle

把 `plugin/` 重组为一个声明 `dsh.bundle` 的 npm 包：

```
paper-navigator/
├── package.json          # "dsh": { "bundle": { "patch": "./cordis.patch.yml" } }
│                         # "engines": { "dsh": ">=0.2.0 <0.3.0" }
├── cordis.patch.yml      # 三段式 patch（见下）
├── lib/                  # 由 src/ 构建出的 JS（git 安装需 prepare 脚本自建）
└── index.js …
```

bundle 的 `cordis.patch.yml` 三段式——**插件自己接自己的 API** 就在第二段：

```yaml
- insert:
    - id: paper-navigator
      name: paper-navigator            # 按包名引用，安装后 Node 原生解析
- id: llm-pi-ai                        # 自带模型路由：用户只填自己的 Key 环境变量
  config:
    providers:
      zhipu:
        apiKeyEnv: PAPER_NAVIGATOR_API_KEY
        displayName: 智谱 GLM（论文领航）
        api: openai-completions
        baseURL: https://open.bigmodel.cn/api/paas/v4
        compat: { supportsDeveloperRole: false, maxTokensField: max_tokens, thinkingFormat: deepseek }
        models:
          - { id: glm-5.3-flash, name: GLM-5.3-Flash, contextWindow: 1000000, maxTokens: 16384 }
- id: agent-default-model              # 默认模型指向自己的路由
  config:
    provider: zhipu
    model: glm-5.3-flash
```

要点：

- bundle patch 同样按 id 覆盖 base 行，所以自带模型路由合法；用户若想换模型，在自己的 profile patch 里覆盖 `agent-default-model` 即可，不必动插件。
- `apiKeyEnv` 用**插件自有命名**（如 `PAPER_NAVIGATOR_API_KEY`），避免与宿主的其他智谱用途耦合；经 `ctx.credentials` 按请求解析。
- compat 开关（GLM 的 deepseek 式 thinking 格式等）随包分发，用户零配置。

## 二、分发方式（按投入从低到高）

| 方式 | 命令 | 前提 |
| --- | --- | --- |
| tarball | `dsh plugin add ./paper-navigator-0.1.0.tgz` | `pnpm pack` 产物，无需构建权限 |
| git 直装 | `dsh plugin add github:fjx0428/paper-navigator#<sha>` | `prepare` 脚本自建 `lib/`（tsdown 独立配置），用户需 allowlist |
| npm 发布 | `dsh plugin add paper-navigator` | `pnpm publish` 时预构建，最顺滑 |

git 直装的 `prepare` 脚本必须自包含（不假设兄弟 monorepo）；这是当前 link: 依赖方案要重构的点——打包时把 `@deepseek-ai/dsh-tools` 等声明为 peerDependencies + devDependencies，运行时与宿主共享实例。

## 三、与演示形态的差异清单

| 演示形态（现状） | 原生形态（目标） |
| --- | --- |
| `--patch /绝对路径/cordis.yml` 手工挂载 | `dsh plugin add` 一条命令 |
| 模型路由靠本机 profile / config/zhipu.patch.yml | bundle patch 自带路由，Key 是唯一用户输入 |
| link: 指向本地 Harness 工作区包 | peerDependencies 与宿主共享 + lib/ 预构建 |
| `engines` 无声明 | `engines.dsh` 锁定兼容范围（0.2.x） |
| 升级 = 重新克隆/拉取 | npm 语义化版本 / git pin commit |

## 四、验收标准（做成什么样算完成）

1. 在一台**只有 Node 和 dsh** 的干净机器上：`dsh plugin add` + `export PAPER_NAVIGATOR_API_KEY` 两步后，网页/`dsh headless` 均能跑通「一句话 → 带引用校验的笔记」。
2. `dsh --profile demo --dump-config` 能看到 `# == paper-navigator` 独立层。
3. 用户在自己 profile patch 覆盖 `agent-default-model` 换成 DeepSeek 后，插件功能不受影响（模型无关性的最终形态）。
4. 发布渠道至少打通 tarball 与 git 直装其一；npm 发布可选。

## 五、工作量估计（毕设体量）

- 打包重构（bundle 清单、lib 构建、peer 依赖梳理）：1–2 周
- 干净机器验收 + 多渠道分发：1 周
- 顺手项：把 `engines.dsh` 对齐 Harness 升级节奏、给插件加 `dsh plugin` 可见的 README 徽章（`dsh-plugin` topic）
