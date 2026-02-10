# Antibody Database Explorer — 需求汇总

> 整理自 Ian 邮件反馈 + 2026-02-09 会议记录

---

## 一、已确认的需求

### 1. 部署在线 Demo ⭐ 高优先级

**来源**：Ian 邮件 + 会议记录 (14:11:55 - 14:12:13)

> "Yeah, if you can just give me a live version of this. Like just like a working, then I can click around."

**需求**：部署到免费托管平台，让 Ian 可以通过 URL 直接访问和体验完整交互功能。

**可选方案**：
- Render.com（推荐，免费额度 750 小时/月）
- Vercel + Railway
- Fly.io

**工作量**：1-2 小时

---

### 2. 相对风险（Relative Risk）计算 ⭐ 高优先级

**来源**：会议记录 (14:06:31 - 14:06:51)

> "So what we'll need to do is Jiaqi, if we can have some calculations running in the backend, about relative risk, which is a pretty simple calculation, which I can show you how to do. That will just allow us to see for antibodies that have a comparator, we can calculate a relative risk."

**需求**：
- 在后端增加 Relative Risk 计算功能
- 公式：`RR = (events_ab / n_ab) / (events_comp / n_comp)`
- 对有 comparator 的抗体，展示相对风险值

**技术实现**：
- 新增 API 端点或扩展现有 `/api/chart/comparative`
- 返回 RR 值 + 95% CI（置信区间）

**工作量**：2-3 小时

---

### 3. FDA Label vs CTGOV 跨数据源对比 ⭐ 中优先级

**来源**：Ian 邮件

> "I think it would be nice to have a side by side comparison for union antibodies from FDA LABEL and CTGOV to show similarities and differences in captured AEs."

**需求**：
- 选择一个抗体，同时展示该抗体在 CTGOV 和 FDA Label 两个数据源中的 AE 分布
- 高亮相同/不同的 AE 类别
- 93 个抗体在两个数据源中都有数据

**技术挑战**：
- CTGOV 用 `events/n` 计算百分比，Label 直接有 `all_grades%`
- 需按 `organ_system` 聚合对比（AE term 粒度不一致）

**工作量**：1-2 天

---

### 4. 按 Target 聚合分析 ⭐ 中优先级

**来源**：会议记录 (14:09:24 - 14:10:07)

> "There might be some like Ian, we can do some levels of aggregation, like a certain target, targeting antibody. Their toxicity profile."
> "So if we select a target up here, right? ... if I hit TNF-alpha up here, I should be able to pull all the antibodies that have that target."

**需求**：
- 选择一个 Target（如 TNF-alpha），展示所有靶向该 Target 的抗体的 AE 汇总
- 聚合方式可选：平均值、最大值、最小值
- 可考虑用 Whisker Plot / Box Plot 展示分布范围

**技术实现**：
- 扩展筛选逻辑，支持按 Target 分组
- 新增聚合图表组件

**工作量**：3-4 小时

---

### 5. 新增筛选字段 ⭐ 低优先级（待数据就绪）

**来源**：Ian 邮件

> "We will have some additional fields collected for antibodies and targets but we can add those in as we move forward."

**需求**：
- 后续会增加 antibodies 和 targets 的新字段
- 需要能灵活添加到筛选面板

**技术实现**：
- 数据层：在 Excel 中加列 → 重新运行 `ingest.py`
- 后端：在 `FILTERABLE_COLUMNS` 添加字段名
- 前端：在 `FilterPanel.jsx` 添加下拉框

**工作量**：每个字段 ~15 分钟

---

### 6. 图表 Hover 提示优化 ⭐ 低优先级

**来源**：会议记录 (14:11:28 - 14:11:50)

> "Additionally, if I'm on this website right now, and it was live, if I hovered over these, would it tell me what they are? These categories."

**需求**：
- Hover 到图表元素时显示详细信息（类别名称、数值、百分比）
- 目前需要点击展开才能看到

**现状**：Plotly 图表已支持基本 hover，可能需要优化 tooltip 内容

**工作量**：1 小时

---

## 二、可选/探索性需求

### 7. Circular / Sunburst 可视化

**来源**：会议记录 (14:22:12 - 14:24:06)，Dr. Shao 分享的论文

> "Given a compound might have multiple type of toxicity... Is it a pie or? It's like a sunburst, maybe?"

**需求**：
- 类似"环状曼哈顿图"的可视化方式
- 展示多维度毒性数据
- 适合按 Target / MOA 分组展示所有 AE

**技术实现**：
- Plotly 支持 Sunburst Chart
- 需要设计合适的数据层级结构

**工作量**：4-6 小时（探索性）

---

## 三、非网站相关（会议中提及但不属于本项目）

以下内容在会议中讨论，但属于其他工作流程，不纳入网站开发：

| 内容 | 说明 |
|------|------|
| FC Mutation 数据收集 | Anna 负责，使用 IMGT 网站查找抗体序列和突变 |
| ADC 数据提取验证 | Ian 手动验证提取的数据准确性 |
| 比较组分类整理 | Ian 整理 FDA Label 中不同 comparator 的分类 |

---

## 四、优先级排序建议

| 优先级 | 需求 | 原因 |
|--------|------|------|
| P0 | 部署在线 Demo | Ian 明确要求，阻塞后续反馈收集 |
| P1 | Relative Risk 计算 | 核心分析功能，Ian 会议中重点提到 |
| P1 | 跨数据源对比 | Ian 邮件明确提出，有差异化价值 |
| P2 | 按 Target 聚合 | 增强分析能力，会议中讨论 |
| P2 | Hover 提示优化 | 用户体验改进 |
| P3 | 新增筛选字段 | 等数据就绪后再做 |
| P3 | Sunburst 可视化 | 探索性，可后期考虑 |

---

## 五、下一步行动

1. **立即**：部署在线 Demo 到 Render.com
2. **本周**：实现 Relative Risk 计算
3. **下周**：实现跨数据源对比功能
4. **待定**：按 Target 聚合、Sunburst 图表等

---

*文档更新时间：2026-02-09*
