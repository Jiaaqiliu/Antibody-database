# Antibody Database Explorer — 项目交付文档

> **版本**: 1.0  
> **日期**: 2026-02-01  
> **技术栈**: Python FastAPI + React (Vite) + Tailwind CSS + Plotly.js + SQLite

---

## 目录

1. [项目概述](#1-项目概述)
2. [功能说明](#2-功能说明)
3. [设计说明](#3-设计说明)
4. [使用指南](#4-使用指南)
5. [API 接口参考](#5-api-接口参考)
6. [项目结构](#6-项目结构)
7. [部署与运维](#7-部署与运维)
8. [常见问题](#8-常见问题)

---

## 1. 项目概述

### 1.1 项目目标

为单克隆抗体（mAb）安全性和临床开发数据库构建一个可交互的 Web 查询界面，支持多维度筛选、数据可视化、不良事件分析和治疗臂对比等核心功能。

### 1.2 数据来源

系统使用 `Full_mab_datasets.xlsx` 文件中的 **6 个子表**作为数据源：

| 数据集 | 表名 | 数据行数 | 来源 | 说明 |
|--------|------|----------|------|------|
| CTGOV – All Events | `ctgov_all` | 58,076 | ClinicalTrials.gov | 全部不良事件记录 |
| CTGOV – Serious Events | `ctgov_serious` | 58,076 | ClinicalTrials.gov | 严重不良事件子集 |
| CTGOV – Other Events | `ctgov_other` | 58,076 | ClinicalTrials.gov | 其他不良事件子集 |
| FDA Label – Final | `label_final` | 9,261 | FDA 药品标签 | 完整标签数据（含分级） |
| FDA Label – BBW | `label_bbw` | 9,261 | FDA 药品标签 | Black Box Warning 子集 |
| FDA Label – WAP | `label_wap` | 9,261 | FDA 药品标签 | Warnings & Precautions 子集 |

### 1.3 覆盖的抗体数量

- CTGOV 数据集：**289** 种不同抗体
- FDA Label 数据集：**139** 种不同抗体

---

## 2. 功能说明

### 2.1 数据集切换 (F0)

**功能描述**：在页面顶部 Header 区域提供数据集下拉选择器，用户可在 6 个数据表之间自由切换。

**行为逻辑**：
- 切换数据集后，系统自动清空所有筛选条件
- 重新加载该数据集对应的筛选选项（下拉菜单值）
- 重新查询并刷新所有图表和数据表

### 2.2 全局搜索 (F1)

**功能描述**：页面顶部的全宽搜索栏，用于按抗体/分子名称进行快速检索。

**特性**：
- 支持模糊匹配（LIKE 查询）
- 输入 2 个字符后自动显示下拉补全建议（最多 10 条）
- 300ms 防抖，避免频繁请求
- 点击建议项可直接选中

**搜索字段**：`antibody` 列

### 2.3 筛选面板 (F2–F4)

**功能描述**：两栏式多维筛选面板，支持按分子特征和临床信息进行组合筛选。

#### 左栏 — 分子特征 (Molecular Characteristics)

| 筛选项 | 对应字段 | 类型 | 可选值数量 |
|--------|---------|------|-----------|
| Molecular Category | `general_molecular_category` | 多选下拉 | 12 (CTGOV) / 10 (Label) |
| Target Antigen | `target_1` | 可搜索多选 | 158 (CTGOV) / 78 (Label) |
| Format | `format_general_category` | 多选下拉 | 7 (CTGOV) / 8 (Label) |
| Isotype (Fc) | `isotype_fc` | 多选下拉 | 8 (CTGOV) / 5 (Label) |

#### 右栏 — 临床与研究 (Clinical & Study)

| 筛选项 | 对应字段 | 类型 | 可选值数量 | 备注 |
|--------|---------|------|-----------|------|
| Phase | `phase` | 多选下拉 | 6 | 仅 CTGOV |
| Event Type | `event_type` | 多选下拉 | 2 | 仅 CTGOV |
| MOA | `moa_new` | 多选下拉 | 16 / 15 | |
| Condition | `condition` | 可搜索多选 | 155 / 115 | |
| Record Category | `record_category` | 多选下拉 | 18 / 4 | |
| Source | `source` | 多选下拉 | 视数据集 | |

**筛选逻辑**：
- 不同筛选条件之间：**AND**（交集）
- 同一筛选条件内多个值之间：**OR**（并集）
- 面板支持折叠/展开，节省屏幕空间
- 每个下拉框显示已选中的数量徽章

### 2.4 筛选操作栏 (F5)

| 操作 | 说明 |
|------|------|
| **Apply Filters** | 提交所有筛选条件，刷新图表和数据表 |
| **Clear All** | 清除所有筛选条件（不自动重新查询） |
| **活跃筛选指示器** | 显示当前活跃的筛选条件数量 |
| **结果计数** | 右侧实时显示匹配的总行数 |

### 2.5 数据分布仪表盘 (F6)

**功能描述**：以 2×2 网格展示 4 个甜甜圈图，直观呈现数据分布。

| 图表 | 统计字段 | 说明 |
|------|---------|------|
| Record Category | `record_category` | 记录分类分布 |
| General Molecular Category | `general_molecular_category` | 分子类别分布 |
| Mechanism of Action | `moa_new` | 作用机制分布 |
| Targets | `target_1` | 靶点分布 |

**交互特性**：
- 鼠标悬停显示类别名称、数值和占比
- 超过 10 个类别自动合并为 "Top 9 + Other"，避免标签拥挤
- 每个图表右上角提供"Expand ↗"按钮，点击弹出详细视图
- 详细视图包含更大的图表和完整的数据表格（类别、计数、占比）

### 2.6 不良事件分析 (F7)

**功能描述**：水平条形图展示不良事件发生比例最高的 Top 20 类别。

**分组维度**（可切换）：
- **Organ System**：按器官系统分组（如"Blood and lymphatic system disorders"）
- **AE Term**：按具体不良事件术语分组（如"Anemia"、"Nausea"）

**计算逻辑**：
- CTGOV 数据集：`proportion = SUM(events_ab) / SUM(n_ab) × 100%`
- Label 数据集：`proportion = AVG(all_grades%)`

**可视化特性**：
- 渐变色条形（浅至深表示比例高低）
- 背景网格线辅助对齐
- 悬停显示具体数值

### 2.7 治疗臂对比分析 (F8)

**功能描述**：当数据中存在对照臂信息时，以分组条形图展示治疗臂 vs 对照臂的不良事件比例对比。

**操作流程**：
1. 在 "Antibody" 下拉框中选择目标抗体
2. （可选）在 "Study (NCT ID)" 下拉框中选择特定临床试验
3. 选择分组方式：Organ System 或 AE Term
4. 点击 "Compare" 执行对比

**关键业务规则**：
- 如果选择了特定 NCT ID，仅在该研究内进行对比（**不跨研究聚合**）
- 蓝色条：治疗臂（Treatment Arm）
- 橙色条：对照臂（Comparator Arm）

**计算逻辑**：
- CTGOV：治疗臂 = `events_ab / n_ab × 100%`，对照臂 = `events_comp / n_comp × 100%`
- Label：治疗臂 = `all_grades%`，对照臂 = `comp_all_grades%`

### 2.8 数据表格 (F9)

**功能描述**：以分页表格形式展示筛选后的原始数据。

**特性**：
- 每页 50 行，带数字页码导航
- 点击表头列名可排序（升序/降序切换）
- 当前排序列显示箭头指示器（↑/↓）
- 优先展示核心列（antibody, condition, organ_system, adverse_event_term, general_molecular_category, target_1, record_category, source），其余列依次排列
- 空值显示为 *null*（斜体灰色）
- **Export CSV** 按钮可导出当前筛选条件下的全部数据

---

## 3. 设计说明

### 3.1 技术架构

```
┌─────────────────────────────────────┐
│         用户浏览器 (React SPA)        │
│  Vite Dev Server (port 5173)        │
│  ├── Tailwind CSS (样式)            │
│  ├── Plotly.js (图表)               │
│  └── react-select (下拉菜单)         │
└──────────┬──────────────────────────┘
           │  HTTP /api/*
           │  (Vite proxy)
┌──────────▼──────────────────────────┐
│      FastAPI 后端 (port 8000)        │
│  ├── 7 个 RESTful API 端点           │
│  └── SQLite 查询引擎                 │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│      SQLite 数据库                    │
│  mab_database.sqlite                │
│  6 张表 + 索引                       │
└─────────────────────────────────────┘
```

### 3.2 前端架构

**状态管理**：React Context + useReducer（无 Redux 依赖）

```
FilterContext
├── table          当前选中的数据集
├── filters        {column: [values]} 筛选条件
├── search         搜索关键词
├── filterOptions  各列可选值（从 API 动态加载）
├── results        查询结果 {data, total, page, page_size}
├── distributions  4 个甜甜圈图数据
├── aeData         不良事件图表数据
├── sortBy / sortDir  排序状态
└── loading        加载状态
```

**组件树**：

```
App
├── Header              数据集选择 + 品牌标题
├── SearchBar           全局搜索
├── FilterPanel         筛选面板（可折叠）
│   └── FilterSelect    可复用的多选下拉组件
├── FilterBar           操作按钮 + 结果计数
├── DistributionDashboard  2×2 图表网格
│   └── DonutChart      单个甜甜圈图 + 展开弹窗
│       └── ChartModal  全屏弹窗容器
├── AdverseEventChart   不良事件条形图
├── ComparativeChart    对比分析图
└── DataTable           分页排序表格
```

### 3.3 后端架构

**API 端点一览**：

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/tables` | 列出所有数据表及行数 |
| GET | `/api/filter-options?table=` | 获取指定表的筛选选项 |
| POST | `/api/query` | 主查询（筛选 + 分页 + 排序） |
| GET | `/api/chart/distribution` | 获取分布图表数据 |
| POST | `/api/chart/adverse-events` | 获取不良事件分析数据 |
| POST | `/api/chart/comparative` | 获取对比分析数据 |
| GET | `/api/studies` | 获取某抗体对应的研究列表 |
| GET | `/api/export` | 导出 CSV 文件 |

**数据库索引**：对以下常用筛选列建立了 SQLite 索引，确保查询性能：
`antibody`, `organ_system`, `adverse_event_term`, `condition`, `general_molecular_category`, `record_category`, `source`

### 3.4 数据管线

**Excel → SQLite 转换**（`ingest.py`）：

1. 读取 6 个 Excel 子表
2. 统一列名规范化（小写、下划线替换空格和特殊字符）
3. 处理重复列名（如 Label 表中 `Combo?` 和 `combo` 冲突 → `combo` / `combo_1`）
4. 清除 Excel 公式残留（以 `=` 开头的字符串置为 NULL）
5. 将 `"NA"` / `"None"` / `""` 统一转换为 SQL NULL
6. 写入 SQLite 并建立索引

### 3.5 UI 设计语言

| 设计元素 | 实现方式 |
|---------|---------|
| 字体 | Inter (Google Fonts), weights: 300–800 |
| 背景 | 三色渐变 `#f0f4ff → #faf5ff → #f0fdf4` |
| Header | 深色渐变 `slate-900/indigo-950` + 径向光晕 |
| 卡片 | 磨砂玻璃效果 `bg-white/70 backdrop-blur-sm` |
| 圆角 | 统一 `rounded-2xl` (1rem) |
| 阴影 | 柔和色彩阴影 `shadow-sm shadow-slate-200/50` |
| 主色调 | Indigo (`#6366f1`) |
| 图表配色 | indigo → purple → cyan → emerald → amber (统一色系) |
| 动效 | fadeIn / slideDown 过渡动画, hover 状态变化 |

---

## 4. 使用指南

### 4.1 环境要求

| 依赖 | 最低版本 |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| 浏览器 | Chrome / Firefox / Safari 最新版 |

### 4.2 首次安装

```bash
# 1. 克隆项目后，进入项目根目录
cd Website_Database

# 2. 安装 Python 依赖
pip install -r backend/requirements.txt

# 3. 运行数据导入（Excel → SQLite，约需 1-2 分钟）
python backend/ingest.py

# 4. 安装前端依赖
cd frontend
npm install
cd ..
```

### 4.3 启动服务

```bash
# 终端 1：启动后端 API 服务
cd backend
uvicorn main:app --port 8000
# 控制台输出: Uvicorn running on http://127.0.0.1:8000

# 终端 2：启动前端开发服务
cd frontend
npm run dev
# 控制台输出: Local: http://localhost:5173/
```

打开浏览器访问 **http://localhost:5173**

### 4.4 典型使用场景

#### 场景 1：查看某抗体的不良事件概况

1. 在顶部搜索栏输入抗体名称（如 `dinutuximab`）
2. 从下拉建议中选择目标抗体
3. 点击 **Apply Filters**
4. 查看下方数据分布图表和不良事件条形图
5. 在 AE 图表切换 "Organ System" / "AE Term" 查看不同维度

#### 场景 2：按分子类别筛选

1. 展开筛选面板
2. 在左栏 "Molecular Category" 中选择 "ADC"
3. 在 "Isotype (Fc)" 中选择 "IgG1"
4. 点击 **Apply Filters**
5. 甜甜圈图和表格将更新为仅包含 ADC + IgG1 的数据

#### 场景 3：对比治疗臂与对照臂

1. 确保当前数据集为 CTGOV 系列
2. 滚动到 "Comparative Arm Analysis" 区域
3. 在 "Antibody" 下拉框选择抗体
4. （推荐）在 "Study (NCT ID)" 选择特定研究以避免跨研究聚合
5. 点击 **Compare**
6. 蓝色条 = 治疗臂，橙色条 = 对照臂

#### 场景 4：切换到 FDA Label 数据

1. 点击右上角数据集选择器
2. 选择 "FDA Label – Final"（或 BBW / WAP）
3. 筛选面板自动调整（隐藏 Phase、Event Type 等 CTGOV 专属字段）
4. 数据和图表自动切换为 FDA Label 数据

#### 场景 5：导出数据

1. 设置好筛选条件并点击 Apply Filters
2. 滚动到数据表格区域
3. 点击右上角 **Export CSV**
4. 浏览器自动下载当前筛选结果的 CSV 文件

### 4.5 界面区域说明

```
┌────────────────────────────────────────────────┐
│ ① Header：品牌标题 + 数据集选择器                 │
├────────────────────────────────────────────────┤
│ ② 搜索栏：按抗体名称搜索（支持自动补全）           │
├────────────────────────────────────────────────┤
│ ③ 筛选面板：左栏（分子特征） | 右栏（临床信息）     │
│    可通过顶部箭头折叠/展开                         │
├────────────────────────────────────────────────┤
│ ④ 操作栏：Apply Filters / Clear All / 结果计数    │
├───────────┬───────────┬───────────┬────────────┤
│ ⑤ 甜甜圈  │ ⑤ 甜甜圈  │ ⑤ 甜甜圈  │ ⑤ 甜甜圈   │
│ Record    │ Molecular │ MOA       │ Targets    │
│ Category  │ Category  │           │            │
├───────────┴─────┬─────┴───────────┴────────────┤
│ ⑥ 不良事件条形图 │ ⑦ 治疗臂对比图                 │
│ (Top 20)        │ (选择抗体后激活)                │
├─────────────────┴──────────────────────────────┤
│ ⑧ 数据表格（分页、排序、导出）                     │
├────────────────────────────────────────────────┤
│ ⑨ 页脚                                         │
└────────────────────────────────────────────────┘
```

---

## 5. API 接口参考

### 5.1 GET `/api/tables`

返回所有可用数据表及其行数。

**响应示例**：
```json
{
  "tables": [
    {"name": "ctgov_all", "rows": 58076},
    {"name": "ctgov_serious", "rows": 58076},
    {"name": "ctgov_other", "rows": 58076},
    {"name": "label_final", "rows": 9261},
    {"name": "label_bbw", "rows": 9261},
    {"name": "label_wap", "rows": 9261}
  ]
}
```

### 5.2 GET `/api/filter-options?table={table}`

获取指定表所有可筛选列的去重值列表。

**参数**：`table` — 表名（如 `ctgov_all`）

**响应示例**（节选）：
```json
{
  "antibody": ["abciximab", "adalimumab", "dinutuximab", ...],
  "general_molecular_category": ["ADC", "Bispecific", "Naked monospecific", ...],
  "phase": ["PHASE1", "PHASE2", "PHASE3", ...]
}
```

### 5.3 POST `/api/query`

主查询接口，支持筛选、分页和排序。

**请求体**：
```json
{
  "table": "ctgov_all",
  "filters": {
    "antibody": ["dinutuximab"],
    "general_molecular_category": ["Naked monospecific"]
  },
  "search": null,
  "page": 1,
  "page_size": 50,
  "sort_by": "antibody",
  "sort_dir": "asc"
}
```

**响应体**：
```json
{
  "data": [{"antibody": "dinutuximab", "condition": "Neuroblastoma", ...}, ...],
  "total": 515,
  "page": 1,
  "page_size": 50
}
```

### 5.4 GET `/api/chart/distribution`

获取某一列的值分布用于甜甜圈图。

**参数**：
- `table` — 表名
- `column` — 统计列名
- `filters` — JSON 编码的筛选条件（可选）
- `search` — 搜索关键词（可选）

### 5.5 POST `/api/chart/adverse-events`

获取不良事件分析数据。

**请求体**：
```json
{
  "table": "ctgov_all",
  "group_by": "organ_system",
  "filters": {},
  "search": null,
  "top_n": 20
}
```

**响应体**：
```json
{
  "categories": ["Blood and lymphatic system disorders", ...],
  "proportions": [40.47, 37.09, ...],
  "counts": [567, 1321, ...]
}
```

### 5.6 POST `/api/chart/comparative`

获取治疗臂 vs 对照臂对比数据。

**请求体**：
```json
{
  "table": "ctgov_all",
  "antibody": "dinutuximab",
  "nct_id": "NCT00026312",
  "group_by": "organ_system",
  "top_n": 15
}
```

### 5.7 GET `/api/studies`

获取某抗体关联的所有研究 NCT ID。

**参数**：`table`, `antibody`

### 5.8 GET `/api/export`

导出 CSV 文件下载。

**参数**：`table`, `filters`（JSON），`search`

---

## 6. 项目结构

```
Website_Database/
├── data/
│   ├── Full_mab_datasets.xlsx          # 原始 Excel 数据（6 个子表）
│   └── preliminary_query_build_doc.pdf # 原始需求文档
├── docs/
│   ├── functional_spec.md              # 功能规格说明书
│   ├── documentation_zh.md             # 中文交付文档（本文件）
│   └── documentation_en.md             # 英文交付文档
├── backend/
│   ├── ingest.py                       # 数据导入脚本（Excel → SQLite）
│   ├── main.py                         # FastAPI 后端应用
│   ├── mab_database.sqlite             # SQLite 数据库（自动生成）
│   ├── table_meta.json                 # 表结构元数据（自动生成）
│   └── requirements.txt                # Python 依赖
├── frontend/
│   ├── vite.config.js                  # Vite 配置（含 API 代理）
│   ├── package.json                    # Node.js 依赖
│   ├── src/
│   │   ├── main.jsx                    # React 入口
│   │   ├── index.css                   # 全局样式 + Tailwind
│   │   ├── App.jsx                     # 主布局
│   │   ├── api.js                      # API 调用封装
│   │   ├── context/
│   │   │   └── FilterContext.jsx       # 全局状态管理
│   │   └── components/
│   │       ├── Header.jsx              # 页头 + 数据集选择
│   │       ├── SearchBar.jsx           # 全局搜索
│   │       ├── FilterPanel.jsx         # 筛选面板
│   │       ├── FilterBar.jsx           # 操作按钮
│   │       ├── DistributionDashboard.jsx # 分布图表网格
│   │       ├── DonutChart.jsx          # 甜甜圈图组件
│   │       ├── ChartModal.jsx          # 图表弹窗
│   │       ├── AdverseEventChart.jsx   # 不良事件分析
│   │       ├── ComparativeChart.jsx    # 对比分析
│   │       └── DataTable.jsx           # 数据表格
│   └── dist/                           # 构建产物（自动生成）
```

---

## 7. 部署与运维

### 7.1 生产部署

```bash
# 构建前端静态文件
cd frontend && npm run build

# 使用 Gunicorn 运行后端（生产环境）
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# 使用 Nginx 或其他 Web 服务器提供 frontend/dist/ 静态文件
# 并将 /api/* 反向代理到 localhost:8000
```

### 7.2 数据更新

当需要更新数据时：

1. 替换 `data/Full_mab_datasets.xlsx` 文件
2. 重新运行：`python backend/ingest.py`
3. 重启后端服务

数据库会自动重建，无需手动修改任何配置。

### 7.3 添加新的筛选字段

1. 在 `backend/main.py` 的 `FILTERABLE_COLUMNS` 字典中添加新列名
2. 在 `frontend/src/components/FilterPanel.jsx` 中添加对应的 `<FilterSelect>` 组件
3. 无需修改其他文件，筛选逻辑会自动适配

---

## 8. 常见问题

**Q: 启动后端报错 "Database not found"**  
A: 需要先运行 `python backend/ingest.py` 生成 SQLite 数据库。

**Q: 前端页面空白或 API 404**  
A: 确保后端服务在 `port 8000` 运行，前端 Vite 的代理配置会将 `/api` 请求转发到后端。

**Q: 切换数据集后图表不更新**  
A: 切换数据集后系统会自动重新查询。如果网络较慢，请等待加载完成。

**Q: 导出 CSV 时数据不完整**  
A: Export CSV 会导出当前筛选条件下的**全部**匹配数据（不仅仅是当前页），请确认筛选条件是否正确。

**Q: Label 数据集中某些数值列显示为空**  
A: 原始 Excel 中部分 Label 数据行的数值列为 "NA" 或包含公式引用，系统已将其统一处理为 NULL。

---

*本文档随项目一同交付，如有疑问请联系开发团队。*
