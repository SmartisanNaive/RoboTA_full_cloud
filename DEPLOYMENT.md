# RoboTA-SynbioCloudLab 部署手册

> 本文档汇总了 RoboTA-SynbioCloudLab 仓库中所有主要组件（Next.js 前端、ProtoFlow 协议分析服务、LLMcontrolOT3 机器人控制层、ChatMol 分子设计工具及辅助子项目）的安装、配置、联调与运维要点，帮助团队完成本地开发、预发布和线上部署。

## 目录
- [1. 项目概览](#1-项目概览)
- [2. 目录结构与角色划分](#2-目录结构与角色划分)
- [3. 环境要求](#3-环境要求)
- [4. 仓库初始化与公共依赖安装](#4-仓库初始化与公共依赖安装)
- [5. SynbioCloudLab（Next.js 15）前端应用](#5-synbiocloudlabnextjs-15前端应用)
- [6. ProtoFlow 协议分析服务](#6-protoflow-协议分析服务)
  - [6.1 FastAPI 后端](#61-fastapi-后端)
  - [6.2 React 前端查看器](#62-react-前端查看器)
  - [6.3 联调与自测](#63-联调与自测)
- [7. LLMcontrolOT3 机器人控制与自然语言接口](#7-llmcontrolot3-机器人控制与自然语言接口)
- [8. ChatMol 分子设计生态](#8-chatmol-分子设计生态)
- [9. 其他子项目与扩展界面](#9-其他子项目与扩展界面)
- [10. 推荐的部署拓扑与网络规划](#10-推荐的部署拓扑与网络规划)
- [11. 安全与运维建议](#11-安全与运维建议)

## 1. 项目概览

RoboTA-SynbioCloudLab 是一个面向合成生物学的云端实验平台，提供虚拟实验室、Python 代码执行、Opentrons 协议分析、实验可视化和 AI 协助设计等能力。【F:README.md†L1-L33】

仓库内主要模块如下：

| 模块 | 技术栈与职责 |
| ---- | ------------ |
| **SynbioCloudLab 前端** | 基于 Next.js 15.2.1 + TypeScript + Tailwind，承担门户、虚拟实验室 UI、API 路由等功能。【F:package.json†L1-L77】|
| **ProtoFlow** | FastAPI/uvicorn 提供协议分析 API，React 查看器展示分析结果；分析结果供虚拟实验室和外部客户端调用。【F:opentronsedge/protoflow/backend/app.py†L160-L301】【F:opentronsedge/protoflow/frontend/src/components/UploadPage.jsx†L1-L149】|
| **LLMcontrolOT3** | Flask + Requests + Opentrons Python API，封装 OT-3 机器人控制，并通过大模型解析自然语言命令。【F:LLMcontrolOT3/readme.md†L1-L118】【F:LLMcontrolOT3/server/ot_robot_server.py†L1-L200】|
| **ChatMol 套件** | 提供 PyMOL 插件、Streamlit 前端与 Python 包，支持分子建模与设计辅助。【F:ChatMol/README.md†L1-L92】【F:ChatMol/chatmol-streamlit/README.md†L1-L18】【F:ChatMol/chatmol_pkg/README.md†L1-L44】|
| **其它 Next.js Demo** | `LocalLiving+LLMtalking+jupyternotebook` 为实验性监控面板/LLM 对话界面，运行在独立端口 3003。【F:LocalLiving+LLMtalking+jupyternotebook/package.json†L1-L73】|

## 2. 目录结构与角色划分

```
RoboTA_full_cloud/
├── app/                      # SynbioCloudLab Next.js 应用（含页面、上下文、API 路由）
├── components/, lib/, styles/ # Next.js 共享组件与样式
├── opentronsedge/            # ProtoFlow 及 Opentrons 相关工具链
│   ├── protoflow/backend/    # FastAPI 协议分析服务
│   └── protoflow/frontend/   # 协议可视化 React 项目骨架
├── LLMcontrolOT3/            # OT-3 机器人控制与 LLM 接口
├── ChatMol/                  # 分子设计套件
├── LocalLiving+.../          # 额外的 Next.js 控制面板示例
└── README.md, DEPLOYMENT.md  # 项目说明与部署指南
```

各目录的更细粒度说明请参阅各自子目录下的 README（例如 ProtoFlow、LLMcontrolOT3 与 ChatMol）。【F:README.md†L14-L35】【F:LLMcontrolOT3/readme.md†L1-L186】【F:ChatMol/README.md†L1-L92】

## 3. 环境要求

- **操作系统**：推荐 Linux 或 macOS，Windows 需确保 Python 虚拟环境与 Node.js 工具链可用。
- **Node.js & npm**：Next.js 15.x 至少需要 Node.js 18.18 或 20 LTS。项目依赖记录在 `package.json`，包括 React 19、Tailwind 等。【F:package.json†L1-L77】
- **Python**：README 要求 Python 3.9+，ProtoFlow 后端与 LLMcontrolOT3 均依赖 Opentrons 生态库。【F:README.md†L37-L49】
- **Python 包管理**：建议使用 `venv`/`conda` 创建隔离环境，ProtoFlow 后端依赖 FastAPI、uvicorn、python-multipart、pydantic。【F:opentronsedge/protoflow/backend/requirements.txt†L1-L4】
- **Opentrons Python API**：ProtoFlow 与 LLMcontrolOT3 均直接调用 `opentrons` 包，需要额外安装（`pip install opentrons`）并准备机器人固件或模拟环境。【F:opentronsedge/protoflow/backend/app.py†L160-L301】【F:LLMcontrolOT3/server/ot_robot_server.py†L1-L200】
- **PyMOL/Streamlit**：若需部署 ChatMol，可安装 PyMOL Open-Source 与 Streamlit。【F:ChatMol/chatmol-streamlit/README.md†L1-L18】

## 4. 仓库初始化与公共依赖安装

1. **克隆仓库**
   ```bash
   git clone <repo-url>
   cd RoboTA_full_cloud
   ```

2. **安装 Next.js 主应用依赖**
   ```bash
   npm install
   ```
   根级 `package.json` 已定义 `dev`、`build`、`start`、`lint` 脚本，可在后续章节按需调用。【F:package.json†L5-L9】

3. **安装辅助 Next.js Demo（可选）**
   ```bash
   cd LocalLiving+LLMtalking+jupyternotebook
   npm install
   ```
   该子项目使用独立端口 `3003`，可作为实验室仪表盘示例。【F:LocalLiving+LLMtalking+jupyternotebook/package.json†L1-L73】

4. **安装 ProtoFlow/LLMcontrolOT3 Python 依赖**
   - ProtoFlow：创建虚拟环境后安装 requirements 与 `opentrons`。
   - LLMcontrolOT3：安装 `flask`, `requests`, `openai`，同时准备 DeepSeek 或其他 LLM API Key。【F:LLMcontrolOT3/requirements.txt†L1-L3】【F:LLMcontrolOT3/config/ai_settings.py†L1-L200】

## 5. SynbioCloudLab（Next.js 15）前端应用

### 5.1 开发与构建命令

```bash
# 开发模式（默认端口 3000）
npm run dev

# 生产构建（可选先执行 Lint）
npm run lint  # 如需静态检查
npm run build
npm run start  # 在构建后启动生产服务器
```
【F:package.json†L5-L9】

项目启用了 `reactStrictMode`，并将 `shiki` 标记为服务器外部依赖，如果部署在 Serverless 环境需确保运行时可访问对应模块。【F:next.config.mjs†L1-L10】

### 5.2 关键页面与功能

- **虚拟实验室**：`app/virtual-lab/page.tsx` 提供 Python/Opentrons 编辑器、日志输出，并可在本地/远程 ProtoFlow 服务之间切换。默认远程指向 `http://120.241.223.14:8000/api/analyze` 与 `http://120.241.223.14:3001`，切换开关会改为本地 `localhost`。【F:app/virtual-lab/page.tsx†L152-L389】
  - 如需在部署环境中使用自建 ProtoFlow，请编辑 `serverConfig` 或改为读取环境变量。
  - 运行分析后会调用 `window.open` 打开 `/protoflow/<analysisId>/timeline`，确保部署环境允许弹窗并正确反向代理该路径。【F:app/virtual-lab/page.tsx†L250-L343】

- **API 路由**：Next.js 后端路由承担轻量服务：
  - `/api/execute-python`：将用户代码写入 `temp/` 后通过系统 `python` 执行。部署时应限制代码长度（当前 `MAX_CODE_LENGTH=1000`）并考虑沙箱或容器化执行，以避免安全风险。【F:app/api/execute-python/route.ts†L1-L51】
  - `/api/simulate-opentrons`：纯前端模拟日志，用于快速演示协议执行流程，无需外部依赖。【F:app/api/simulate-opentrons/route.ts†L1-L65】
  - `/api/login`：演示性质的静态账号（admin/123456），生产环境请接入真实身份认证。【F:app/api/login/route.ts†L1-L13】

- **国际化与组件库**：`LanguageProvider` 与 `translations/index.ts` 支持中英双语；UI 主要使用 shadcn/ui 与 lucide 图标。

### 5.3 部署注意事项

1. **环境变量**：建议在 `.env.local` 中声明自定义的 ProtoFlow API、Viewer URL、LLM 网关等，再在代码中通过 `process.env` 注入，避免将真实地址写死在仓库中。
2. **Python 执行安全**：在生产环境中执行用户 Python 代码前应增加沙箱（Docker、Firejail 等）或白名单模块检查。当前仓库仅对 import 模块进行简单校验，需要进一步加固。【F:app/api/execute-python/route.ts†L33-L51】
3. **日志与缓存**：`temp/` 目录用于临时代码，需定期清理；可以将输出写入对象存储或数据库便于审计。

## 6. ProtoFlow 协议分析服务

### 6.1 FastAPI 后端

1. **准备虚拟环境并安装依赖**
   ```bash
   cd opentronsedge/protoflow/backend
   python -m venv .venv
   source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
   pip install -r requirements.txt
   pip install opentrons  # 需要额外安装
   ```
   【F:opentronsedge/protoflow/backend/requirements.txt†L1-L4】【F:opentronsedge/protoflow/backend/app.py†L160-L301】

2. **运行服务**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```
   `app.py` 也提供直接运行入口，默认监听 `0.0.0.0:8000` 并调整了 keep-alive、并发等参数，适合部署为长期服务。【F:opentronsedge/protoflow/backend/app.py†L285-L301】

3. **主要 API**
   - `POST /api/analyze`：接收协议文件及运行时参数，返回 `analysisId`。文件会落地到临时目录，分析结果保存为 JSON。【F:opentronsedge/protoflow/backend/app.py†L177-L258】
   - `GET /api/analysis/{analysis_id}`：返回指定分析的完整结果。【F:opentronsedge/protoflow/backend/app.py†L267-L278】
   - `GET /api/analyses`：列出当前缓存的所有分析概览。【F:opentronsedge/protoflow/backend/app.py†L280-L283】
   - `GET /health`：健康检查，可用于负载均衡存活探测。【F:opentronsedge/protoflow/backend/app.py†L285-L288】

4. **持久化策略**：默认将分析结果写入系统临时目录，可在容器化部署时挂载数据卷或改写为数据库存储。

### 6.2 React 前端查看器

- `frontend/index.html` 期望通过 `src/main.jsx` 启动应用，需要在部署时使用 Vite 或其他构建工具生成入口文件并挂载到 `#root`。【F:opentronsedge/protoflow/frontend/index.html†L1-L13】
- `src/App.jsx` 基于 MUI 设计主框架，`<Outlet />` 用于 React Router 渲染子页面，适合集成时间轴、详情视图等组件。【F:opentronsedge/protoflow/frontend/src/App.jsx†L1-L183】
- `src/components/UploadPage.jsx` 默认指向 `http://localhost:8000/api`，部署到生产环境时请根据实际域名/端口修改 `API_URL`，并考虑通过环境变量注入。【F:opentronsedge/protoflow/frontend/src/components/UploadPage.jsx†L1-L149】

如果需要快速搭建：

```bash
cd opentronsedge/protoflow/frontend
npm install  # 初始化 Vite/React 依赖
npm run dev  # 监听 3001 端口
```

如需自定义 Router，请创建 `src/main.jsx`，使用 `createBrowserRouter` 设置 `basename='/protoflow'` 以兼容子路径部署（参考根 README 的更新记录）。【F:README.md†L18-L35】

### 6.3 联调与自测

- **本地联调**：
  1. 启动 ProtoFlow FastAPI（端口 8000）。
  2. 启动 ProtoFlow 前端（端口 3001）。
  3. 在 SynbioCloudLab 虚拟实验室页面切换到 “LOCAL” 模式后上传协议。

- **自测脚本**：`opentronsedge/protoflow/test/test_analyze.py` 可向本地服务发送示例协议并保存分析结果，适用于流水线验收。【F:opentronsedge/protoflow/test/test_analyze.py†L1-L93】

- **健康检查**：利用 `/health` 接口结合 Prometheus/Grafana 监控响应时间和错误率。

## 7. LLMcontrolOT3 机器人控制与自然语言接口

LLMcontrolOT3 将 Flask API、Opentrons 控制逻辑和大模型解析结合，支持结构化调用与自然语言控制。【F:LLMcontrolOT3/readme.md†L1-L118】【F:LLMcontrolOT3/server/ot_robot_server.py†L1-L200】

### 7.1 环境准备

1. 创建虚拟环境并安装依赖：
   ```bash
   cd LLMcontrolOT3
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   pip install opentrons
   ```
   【F:LLMcontrolOT3/requirements.txt†L1-L3】

2. 配置 `config/settings.py`：修改 OT-3 机器人 IP、端口、服务器监听地址等，默认监听 `0.0.0.0:5000`。【F:LLMcontrolOT3/config/settings.py†L1-L31】

3. 配置 `config/ai_settings.py`：
   - 将 `DEEPSEEK_API_KEY` 等敏感信息改为读取环境变量。
   - 根据需求调整 `FUNCTION_MAPPINGS`、运行参数默认值与提示词。
   - `API_KEY = os.getenv("DEEPSEEK_API_KEY", "YOUR_API_KEY")` 支持通过环境变量覆盖默认值。【F:LLMcontrolOT3/config/ai_settings.py†L1-L200】

### 7.2 启动与接口

```bash
cd LLMcontrolOT3
python server/ot_robot_server.py
```

主要接口：
- `/move-labware`、`/pipette`、`/thermocycler`、`/heater-shaker` 等用于直接发送结构化控制命令。【F:LLMcontrolOT3/server/ot_robot_server.py†L121-L200】
- `/ai-command`（在 AI 控制器中实现）用于自然语言解析；`ai_settings.py` 定义了参数校验与默认值，缺失参数会返回 `missing_info` 提示。【F:LLMcontrolOT3/readme.md†L63-L118】【F:LLMcontrolOT3/config/ai_settings.py†L1-L200】
- `/upload-protocol/`、`/run-protocol/`、`/execute-action/` 等辅助端点负责上传协议并触发执行。【F:LLMcontrolOT3/server/ot_robot_server.py†L80-L111】

运行后可使用 README 中的 `curl`/`requests` 示例验证自然语言控制链路，单元测试可通过 `python -m unittest discover test` 执行。【F:LLMcontrolOT3/readme.md†L91-L118】

## 8. ChatMol 分子设计生态

ChatMol 提供多种面向 PyMOL 的交互方式，包括插件、迷你 GUI、Streamlit 应用和 Python SDK。【F:ChatMol/README.md†L1-L92】

- **PyMOL 插件**：可通过 `load https://raw.githubusercontent.com/ChatMol/ChatMol/main/chatmol.py` 安装。适合直接在 PyMOL 中执行自然语言命令。【F:ChatMol/README.md†L33-L52】
- **miniGUI**：运行 `python miniGUI.py` 启动独立界面，可保留会话历史。【F:ChatMol/README.md†L54-L62】
- **Streamlit 应用**：安装 PyMOL、Streamlit、OpenAI/Anthropic 等依赖后执行 `streamlit run chatmol-streamlit.py`。【F:ChatMol/chatmol-streamlit/README.md†L1-L18】
- **Python 包**：`pip install chatmol` 后可在脚本中调用 ChatMol 提供的多种 LLM 客户端与 PyMOL 会话管理工具。【F:ChatMol/chatmol_pkg/README.md†L1-L44】

部署时需准备对应的 API Key（OpenAI、Anthropic 等）并在环境变量中配置。

## 9. 其他子项目与扩展界面

- **LocalLiving+LLMtalking+jupyternotebook**：Next.js 15.1 demo，默认 `npm run dev -p 3003`，用于展示实验室监控与多面板布局。可根据需要将其与主站合并或拆分部署。【F:LocalLiving+LLMtalking+jupyternotebook/package.json†L1-L73】
- **opentronsedge 其它目录**：包含 Opentrons 官方应用、组件库与测试工具，可按需阅读官方文档后集成。

## 10. 推荐的部署拓扑与网络规划

| 服务 | 默认端口 | 建议部署 | 备注 |
| ---- | -------- | -------- | ---- |
| SynbioCloudLab (Next.js) | 3000 / 80 | Node.js 服务器或容器，可接入 Nginx/Traefik 反向代理 | 与 ProtoFlow 前端共享域名时需配置子路径 `/protoflow` |
| ProtoFlow FastAPI | 8000 | Python 应用服务器或 Kubernetes Deployment | 暴露 `/api/*` 与 `/health`，建议启用 HTTPS 或内网访问 |
| ProtoFlow React Viewer | 3001 | 静态文件服务器或与 Next.js 合并 | 确保路由 `basename` 为 `/protoflow`，方便嵌入主站 |
| LLMcontrolOT3 | 5000 | 内网服务，需能访问 OT-3 机器人与 LLM 网关 | 生产环境务必启用认证与权限控制 |
| ChatMol Streamlit | 8501 (默认) | 研究人员内部访问 | 需部署 PyMOL 与 GPU/CPU 资源 |

### 联网建议
- 使用 Nginx/Traefik 将 `/api/execute-python`、`/api/simulate-opentrons` 反向代理到 Next.js 服务器，将 `/protoflow/*` 代理到 ProtoFlow 前端，将 `/protoflow/api/*` 代理到 FastAPI。
- LLMcontrolOT3 建议与机器人控制网络隔离，通过 VPN 或零信任访问。
- 如需多租户支持，可使用 JWT/OIDC 替换演示用登录接口，并在各服务间传递访问令牌。

## 11. 安全与运维建议

1. **凭证管理**：
   - 移除仓库中的测试 API Key，将 `DEEPSEEK_API_KEY`、OpenAI Key 等写入环境变量或秘密管理系统。【F:LLMcontrolOT3/config/ai_settings.py†L1-L200】
   - 更换演示账号密码（admin/123456），接入企业统一登录。【F:app/api/login/route.ts†L6-L11】

2. **代码执行隔离**：
   - `execute-python` 仅用于演示，生产环境应改为容器化运行、设置 CPU/内存限制，并在执行完成后删除临时文件。【F:app/api/execute-python/route.ts†L13-L29】

3. **日志与监控**：
   - ProtoFlow FastAPI 默认记录关键日志，可配合 Prometheus Exporter 采集 `/health` 与错误率。【F:opentronsedge/protoflow/backend/app.py†L177-L288】
   - LLMcontrolOT3 内部大量调用机器人 REST API，建议在 `post_request` 中增加告警与重试机制。【F:LLMcontrolOT3/server/ot_robot_server.py†L35-L58】

4. **存储清理**：
   - ProtoFlow 将分析结果写入临时目录并缓存 ID，定期清理旧数据以防磁盘占满。【F:opentronsedge/protoflow/backend/app.py†L197-L258】
   - Next.js `temp/` 目录保存用户脚本，建议部署 cron 任务或在执行后立即删除。

5. **自动化测试**：
   - 在 CI 中集成 `npm run lint` 与 ProtoFlow `test_analyze.py`，可提前捕获兼容性问题。【F:package.json†L5-L9】【F:opentronsedge/protoflow/test/test_analyze.py†L1-L93】

6. **文档维护**：
   - 若新增环境变量或接口，请同步更新本手册与各模块 README，确保团队成员获取到一致的部署说明。【F:README.md†L14-L35】

---

> 如需进一步的 CI/CD、容器化或云平台部署示例，可在上述基础上引入 Docker/Helm 文件，或参考 Opentrons 官方脚手架与 Next.js 官方部署文档。
