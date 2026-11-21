# 论文领航 · 评测结果（2026-11-21 14:12）

模型：DeepSeek-V4.1-Flash（推理等级 High）。插件组 = 完整四工具链 + 引用校验；对照组 = 同一批论文，只在提示里贴摘要、不提供任何工具，要求按同一笔记结构产出。

## 插件组（8 篇）

| arXiv | 论文 | 笔记完整 | 引用命中 | 工具调用成功/次数 | 事实记号核对 |
| --- | --- | --- | --- | --- | --- |
| 1706.03762 | Attention Is All You Need | ✅ | 18/18（100%） | 11/11 | 11/11 |
| 1810.04805 | BERT: Pre-training of Deep Bidirectional T… | ✅ | 25/25（100%） | 7/8 | 11/15 |
| 1706.06978 | Deep Interest Network for Click-Through Ra… | ✅ | 18/18（100%） | 9/10 | 22/30 |
| 2005.11401 | Retrieval-Augmented Generation for Knowled… | ✅ | 21/21（100%） | 9/9 | 17/19 |
| 2106.09685 | LoRA: Low-Rank Adaptation of Large Languag… | ✅ | 21/21（100%） | 12/13 | 9/11 |
| 2210.03629 | ReAct: Synergizing Reasoning and Acting in… | ✅ | 20/20（100%） | 11/12 | 10/14 |
| 2605.23717 | Vision-Based Agile Landing on Turbulent Wa… | ✅ | 17/17（100%） | 13/15 | 20/23 |
| 2610.03924 | Barrier-Shaped Recurrent Reinforcement Lea… | ✅ | 18/18（100%） | 10/12 | 18/27 |

## 摘要对照组（8 篇）

| arXiv | 论文 | 笔记完整 | 引用命中 | 工具调用成功/次数 | 事实记号核对 |
| --- | --- | --- | --- | --- | --- |
| 1706.03762 | Attention Is All You Need | ✅ | 10/10（100%） | — | 9/11 |
| 1810.04805 | BERT: Pre-training of Deep Bidirectional T… | ✅ | 8/8（100%） | — | 9/15 |
| 1706.06978 | Deep Interest Network for Click-Through Ra… | ✅ | 6/9（67%） | — | 12/30 |
| 2005.11401 | Retrieval-Augmented Generation for Knowled… | ✅ | 11/11（100%） | — | 14/19 |
| 2106.09685 | LoRA: Low-Rank Adaptation of Large Languag… | ✅ | 8/8（100%） | — | 3/11 |
| 2210.03629 | ReAct: Synergizing Reasoning and Acting in… | ✅ | 11/11（100%） | — | 10/14 |
| 2605.23717 | Vision-Based Agile Landing on Turbulent Wa… | ✅ | 11/11（100%） | — | 16/23 |
| 2610.03924 | Barrier-Shaped Recurrent Reinforcement Lea… | ✅ | 13/13（100%） | — | 13/27 |

## 汇总对比

| 指标 | 插件组 | 摘要对照组 |
| --- | --- | --- |
| 笔记六字段完整 | 8/8 | 8/8 |
| 引用逐字命中率 | 158/158（**100%**） | 78/81（96%） |
| 事实关键记号命中 | 118/150（79%） | 86/150（57%） |
| 平均工具调用次数 | 11.3 | 0（无工具） |

## 口径说明

- **引用逐字命中**：笔记里的每条 quote，与离线抽取的论文全文（与插件同一套 PDF 抽取代码）做「仅合并空白后逐字包含」比对。写入笔记时 write_note 已经挡过一次；此处是对最终落盘内容的独立复核。
- **事实记号核对**：自动从每篇 3 个标准事实（eval/papers.jsonl）里抽出关键记号（数字、方法名、数据集名），检查是否出现在笔记 JSON 中。比对是小写子串；数字另认一次去掉千分位后的完整数字（`10,000` 与 `10000` 相同，`2,500` 不等于 `25`）。这是近似核对，单篇记号未命中不等于事实错误。
- 工具调用统计来自插件轨迹（eval/traces/tool-calls.jsonl）。
- 长论文（2303.18223，144 页）不进评测表，仅用于上下文裁剪验收：模型按目录选读 13 次、合计 35,773 字符，每条 read_section ≤ 12000 字符。
