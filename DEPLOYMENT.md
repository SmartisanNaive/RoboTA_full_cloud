# RoboTA-SynbioCloudLab 部署手册

> 本文档汇总了 RoboTA-SynbioCloudLab 仓库中所有主要组件（Next.js 前端、ProtoFlow 协议分析服务、LLMcontrolOT3 机器人控制层、ChatMol 分子设计工具及辅助子项目）的安装、配置、联调与运维要点，帮助团队完成本地开发、预发布和线上部署。

> **重要提示**: 本项目统一使用 `uv` 作为 Python 包管理工具，确保依赖管理和环境隔离的一致性。

## 目录
- [1. 快速开始](#1-快速开始)
- [2. 项目概览](#2-项目概览)
- [3. 目录结构与角色划分](#3-目录结构与角色划分)
- [4. 环境要求](#4-环境要求)
- [5. 仓库初始化与公共依赖安装](#5-仓库初始化与公共依赖安装)
- [6. SynbioCloudLab（Next.js 15）前端应用](#6-synbiocloudlabnextjs-15前端应用)
- [7. ProtoFlow 协议分析服务](#7-protoflow-协议分析服务)
  - [7.1 FastAPI 后端](#71-fastapi-后端)
  - [7.2 React 前端查看器](#72-react-前端查看器)
  - [7.3 联调与自测](#73-联调与自测)
- [8. LLMcontrolOT3 机器人控制与自然语言接口](#8-llmcontrolot3-机器人控制与自然语言接口)
- [9. ChatMol 分子设计生态](#9-chatmol-分子设计生态)
- [10. 其他子项目与扩展界面](#10-其他子项目与扩展界面)
- [11. 推荐的部署拓扑与网络规划](#11-推荐的部署拓扑与网络规划)
- [12. 环境变量配置](#12-环境变量配置)
- [13. 安全与运维建议](#13-安全与运维建议)

## 1. 快速开始

### 1.1 前置要求

- **Node.js**: ≥ 18.18 (推荐使用 nvm 管理)
- **Python**: ≥ 3.9 (推荐使用 pyenv 管理)
- **uv**: Python 包管理工具 (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **git**: 版本控制工具

### 1.2 一键启动开发环境

```bash
# 克隆仓库
git clone <repo-url>
cd RoboTA_full_cloud

# 安装 uv (如果尚未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安装前端依赖
npm install

# 创建 Python 环境并安装依赖
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# 启动主前端应用
npm run dev
```

### 1.3 服务启动顺序

```bash
# 1. 启动 ProtoFlow 后端
cd opentronsedge/protoflow/backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uv pip install opentrons
uvicorn app:app --host 0.0.0.0 --port 8000

# 2. 启动 ProtoFlow 前端
cd ../frontend
npm install
npm run dev

# 3. 启动 LLMcontrolOT3 (可选)
cd ../../LLMcontrolOT3
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
uv pip install opentrons
python server/ot_robot_server.py

# 4. 启动 ChatMol (可选)
cd ../ChatMol
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
streamlit run chatmol-streamlit/chatmol-streamlit.py
```

## 2. 项目概览

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

## 4. 环境要求

- **操作系统**：推荐 Linux 或 macOS，Windows 需确保 Python 虚拟环境与 Node.js 工具链可用。
- **Node.js & npm**：Next.js 15.x 至少需要 Node.js 18.18 或 20 LTS。项目依赖记录在 `package.json`，包括 React 19、Tailwind 等。【F:package.json†L1-L77】
- **Python**：README 要求 Python 3.9+，ProtoFlow 后端与 LLMcontrolOT3 均依赖 Opentrons 生态库。【F:README.md†L37-L49】
- **Python 包管理**：**强制使用 `uv`** 创建和管理隔离环境，确保依赖版本一致性。ProtoFlow 后端依赖 FastAPI、uvicorn、python-multipart、pydantic。【F:opentronsedge/protoflow/backend/requirements.txt†L1-L4】
- **Opentrons Python API**：ProtoFlow 与 LLMcontrolOT3 均直接调用 `opentrons` 包，需要额外安装（`uv pip install opentrons`）并准备机器人固件或模拟环境。【F:opentronsedge/protoflow/backend/app.py†L160-L301】【F:LLMcontrolOT3/server/ot_robot_server.py†L1-L200】
- **PyMOL/Streamlit**：若需部署 ChatMol，可安装 PyMOL Open-Source 与 Streamlit。【F:ChatMol/chatmol-streamlit/README.md†L1-L18】

### 4.1 uv 安装与配置

```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 配置 uv 使用国内镜像 (可选)
uv config set pip.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 创建项目级 Python 环境
uv venv --python 3.11
source .venv/bin/activate  # Linux/macOS
# 或 .venv\Scripts\activate  # Windows
```

## 5. 仓库初始化与公共依赖安装

### 5.1 基础环境设置

```bash
# 克隆仓库
git clone <repo-url>
cd RoboTA_full_cloud

# 安装 uv (如果尚未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 配置 uv 使用国内镜像 (可选，推荐国内用户使用)
uv config set pip.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### 5.2 前端依赖安装

```bash
# 安装 Next.js 主应用依赖
npm install

# 安装辅助 Next.js Demo（可选）
cd LocalLiving+LLMtalking+jupyternotebook
npm install
cd ..
```

### 5.3 Python 服务依赖安装（使用 uv）

#### ProtoFlow 协议分析服务

```bash
# 进入 ProtoFlow 后端目录
cd opentronsedge/protoflow/backend

# 使用 uv 创建和管理虚拟环境
uv venv --python 3.11
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate  # Windows

# 使用 uv 安装依赖
uv pip install -r requirements.txt
uv pip install opentrons

# 返回项目根目录
cd ../../..
```

#### LLMcontrolOT3 机器人控制服务

```bash
# 进入 LLMcontrolOT3 目录
cd LLMcontrolOT3

# 使用 uv 创建和管理虚拟环境
uv venv --python 3.11
source .venv/bin/activate

# 使用 uv 安装依赖
uv pip install -r requirements.txt
uv pip install opentrons

# 可选：安装额外的机器学习库
uv pip install numpy pandas scikit-learn

# 返回项目根目录
cd ..
```

#### ChatMol 分子设计工具

```bash
# 进入 ChatMol 目录
cd ChatMol

# 使用 uv 创建和管理虚拟环境
uv venv --python 3.11
source .venv/bin/activate

# 使用 uv 安装依赖
uv pip install -r requirements.txt

# 返回项目根目录
cd ..
```

### 5.4 依赖锁定与环境复制

```bash
# 生成所有 Python 环境的依赖锁定文件
cd opentronsedge/protoflow/backend
source .venv/bin/activate
uv pip compile requirements.txt -o requirements.lock

cd ../../LLMcontrolOT3
source .venv/bin/activate
uv pip compile requirements.txt -o requirements.lock

cd ../ChatMol
source .venv/bin/activate
uv pip compile requirements.txt -o requirements.lock

cd ..
```

### 5.5 开发环境验证

```bash
# 验证 Next.js 前端
npm run lint

# 验证 ProtoFlow 后端
cd opentronsedge/protoflow/backend
source .venv/bin/activate
python -c "import fastapi, uvicorn, opentrons; print('ProtoFlow dependencies OK')"

# 验证 LLMcontrolOT3
cd ../../LLMcontrolOT3
source .venv/bin/activate
python -c "import flask, opentrons; print('LLMcontrolOT3 dependencies OK')"

cd ..
```

## 6. SynbioCloudLab（Next.js 15）前端应用

### 6.1 开发与构建命令

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

### 6.2 关键页面与功能

- **虚拟实验室**：`app/virtual-lab/page.tsx` 提供 Python/Opentrons 编辑器、日志输出，并可在本地/远程 ProtoFlow 服务之间切换。默认远程指向 `http://120.241.223.14:8000/api/analyze` 与 `http://120.241.223.14:3001`，切换开关会改为本地 `localhost`。【F:app/virtual-lab/page.tsx†L152-L389】
  - 如需在部署环境中使用自建 ProtoFlow，请编辑 `serverConfig` 或改为读取环境变量。
  - 运行分析后会调用 `window.open` 打开 `/protoflow/<analysisId>/timeline`，确保部署环境允许弹窗并正确反向代理该路径。【F:app/virtual-lab/page.tsx†L250-L343】

- **API 路由**：Next.js 后端路由承担轻量服务：
  - `/api/execute-python`：将用户代码写入 `temp/` 后通过系统 `python` 执行。部署时应限制代码长度（当前 `MAX_CODE_LENGTH=1000`）并考虑沙箱或容器化执行，以避免安全风险。【F:app/api/execute-python/route.ts†L1-L51】
  - `/api/simulate-opentrons`：纯前端模拟日志，用于快速演示协议执行流程，无需外部依赖。【F:app/api/simulate-opentrons/route.ts†L1-L65】
  - `/api/login`：演示性质的静态账号（admin/123456），生产环境请接入真实身份认证。【F:app/api/login/route.ts†L1-L13】

- **国际化与组件库**：`LanguageProvider` 与 `translations/index.ts` 支持中英双语；UI 主要使用 shadcn/ui 与 lucide 图标。

### 6.3 部署注意事项

1. **环境变量**：建议在 `.env.local` 中声明自定义的 ProtoFlow API、Viewer URL、LLM 网关等，再在代码中通过 `process.env` 注入，避免将真实地址写死在仓库中。
2. **Python 执行安全**：在生产环境中执行用户 Python 代码前应增加沙箱（Docker、Firejail 等）或白名单模块检查。当前仓库仅对 import 模块进行简单校验，需要进一步加固。【F:app/api/execute-python/route.ts†L33-L51】
3. **日志与缓存**：`temp/` 目录用于临时代码，需定期清理；可以将输出写入对象存储或数据库便于审计。

## 6. ProtoFlow 协议分析服务

### 6.1 FastAPI 后端

1. **准备虚拟环境并安装依赖**
   ```bash
   cd opentronsedge/protoflow/backend
   uv venv
   source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
   uv pip install -r requirements.txt
   uv pip install opentrons  # 需要额外安装
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

#### ProtoFlow 前端查看器启动方法

**准备条件**
- Node.js ≥ 18（建议启用 Corepack 使用 Yarn 1.x）、npm ≥ 9
- 先在 `opentronsedge` 根目录安装 `@opentrons/*` 工作区依赖，避免链接的本地包缺失
- 首次跑通前端前建议清理旧的 `node_modules/`，防止与全局包冲突

**步骤 1：安装共享依赖（一次性）**

```bash
cd opentronsedge
corepack enable          # 启用 Yarn，opentronsedge 使用 workspaces
yarn install --immutable # 或 yarn install，确保 @opentrons/* 包就绪
```

**步骤 2：补齐前端工程文件（首次执行）**

`frontend/` 目录目前只有源码与构建产物，需手动恢复 Vite 脚手架：

```bash
cd opentronsedge/protoflow/frontend

# 创建 package.json（若已存在可跳过）
cat <<'EOF' > package.json
{
  "name": "protoflow-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3001",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 3001"
  },
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/icons-material": "^6.4.7",
    "@mui/material": "^6.4.7",
    "@opentrons/api-client": "file:../../api-client",
    "@opentrons/components": "file:../../components",
    "@opentrons/labware-library": "file:../../labware-library",
    "@opentrons/react-api-client": "file:../../react-api-client",
    "@opentrons/shared-data": "file:../../shared-data",
    "@opentrons/step-generation": "file:../../step-generation",
    "@popperjs/core": "^2.1.1",
    "@react-spring/types": "^9.6.1",
    "@react-spring/web": "^9.6.1",
    "@tailwindcss/postcss": "^4.1.6",
    "@types/classnames": "^2.2.5",
    "@types/styled-components": "^5.1.26",
    "ajv": "^6.12.3",
    "axios": "^1.6.5",
    "babel-runtime": "^6.26.0",
    "classnames": "^2.2.5",
    "d3": "^7.9.0",
    "i18next": "^19.9.2",
    "immer": "^5.1.0",
    "interactjs": "^1.10.27",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.3.8",
    "react-i18next": "^14.0.0",
    "react-markdown": "^9.0.3",
    "react-popper": "^1.0.0",
    "react-remove-scroll": "^2.4.3",
    "react-router-dom": "^7.3.0",
    "react-select": "^5.4.0",
    "react-viewport-list": "^6.3.0",
    "redux": "^4.0.5",
    "styled-components": "^5.3.6",
    "uuid": "^3.3.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.21",
    "core-js": "^2.6.12",
    "postcss": "^8.5.3",
    "tailwindcss": "^4.1.6",
    "vite": "^5.0.10"
  }
}
EOF

# 创建 Vite 配置（默认以 /protoflow 作为子路径部署，可按需调整）
cat <<'EOF' > vite.config.mjs
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_APP_BASE?.replace(/\/$/, '') || '/protoflow'
  const port = Number(env.VITE_DEV_PORT || 3001)

  return {
    plugins: [react()],
    base,
    server: {
      host: '0.0.0.0',
      port
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
EOF

# 创建入口文件 src/main.jsx
mkdir -p src
cat <<'EOF' > src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import UploadPage from './components/UploadPage.jsx'
import './components/DeckVisualization.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <UploadPage />
      }
    ]
  }
], {
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
EOF
```

> 如需挂载时间线或详情页，可在上述路由数组中新增子路由，并按需懒加载组件。

**步骤 3：安装依赖并启动开发服务器**

```bash
cd opentronsedge/protoflow/frontend
npm install
npm run dev
```

浏览器访问 `http://localhost:3001/` 即可调试；前端默认请求 `http://localhost:8000/api`。

**步骤 4：生产构建与静态发布**

```bash
# 构建静态资源
npm run build

# 本地验证（可加 --host 0.0.0.0 暴露到局域网）
npm run preview

# 其他静态服务器（任选其一）
npx serve dist -l 3001
python -m http.server 3001 -d dist
```

部署上线时，将 `dist/` 目录交由 Nginx、OSS 或 CDN 托管即可。

**与 FastAPI / Next.js 联调建议**
- FastAPI 后端需先监听 `0.0.0.0:8000`，保持 `/api/*` 路径一致
- 通过 Nginx/Traefik 将 `/protoflow/api/*` 反向代理到 FastAPI，将 `/protoflow/*` 指向本前端
- 若与 Next.js 同域部署，可把 `dist/` 拷贝到 Next.js `public/protoflow`，或在 `next.config.mjs` 中添加重写规则

#### 环境配置

在生产环境中，建议：

1. **配置 API 地址**：
   - 将 `opentronsedge/protoflow/frontend/src/components/UploadPage.jsx:12` 中的 `API_URL` 改为 `const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'`
   - 在 `.env.local` 或 `.env.production` 中写入 `VITE_API_URL=https://<domain>/protoflow/api`

2. **子路径/同域部署**：
   - 通过 `.env` 设置 `VITE_APP_BASE=/protoflow`（或根路径 `/`）
   - 保持与 `vite.config.mjs` 的 `base` 一致，避免刷新子路由出现 404

3. **跨域与鉴权**：
   - FastAPI 层开启 CORS（参考 `opentronsedge/protoflow/backend/app.py:160`）
   - 若需要登录态共享，可在构建时注入 `VITE_AUTH_TOKEN` 等变量，并在前端请求头携带凭证

4. **资源优化**：
   - 静态资源使用 CDN 时，保留 `dist/assets/` 指纹文件并设置长缓存
   - 若嵌入 Next.js 页面，可在构建后使用 `cp -R dist public/protoflow` 由 Next.js 托管

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
   uv venv
   source .venv/bin/activate
   uv pip install -r requirements.txt
   uv pip install opentrons
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
- **Python 包**：`uv pip install chatmol` 后可在脚本中调用 ChatMol 提供的多种 LLM 客户端与 PyMOL 会话管理工具。【F:ChatMol/chatmol_pkg/README.md†L1-L44】

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

## 12. 环境变量配置

### 12.1 环境变量文件示例

在项目根目录创建 `.env.example` 文件，各服务创建对应的 `.env` 文件：

```bash
# 项目根目录 .env.example
# ======================
# LLM 服务配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 机器人配置
OT3_ROBOT_IP=192.168.1.100
OT3_ROBOT_PORT=31950

# 服务配置
SERVER_HOST=0.0.0.0
SERVER_PORT=5000

# ProtoFlow 配置
PROTOFLOW_API_URL=http://localhost:8000/api
PROTOFLOW_FRONTEND_URL=http://localhost:3001

# Next.js 配置
NEXT_PUBLIC_PROTOFLOW_API_URL=http://localhost:8000/api
NEXT_PUBLIC_PROTOFLOW_FRONTEND_URL=http://localhost:3001
```

### 12.2 ProtoFlow 服务环境变量

```bash
# opentronsedge/protoflow/backend/.env
# ===================================
# 数据库配置 (可选)
DATABASE_URL=sqlite:///./protoflow.db

# 文件存储配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# CORS 配置
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# 日志配置
LOG_LEVEL=INFO
```

### 12.3 LLMcontrolOT3 服务环境变量

```bash
# LLMcontrolOT3/.env
# =================
# LLM 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=deepseek-chat
LLM_TEMPERATURE=0.7

# 机器人配置
OT3_ROBOT_IP=192.168.1.100
OT3_ROBOT_PORT=31950

# 服务器配置
FLASK_ENV=development
FLASK_DEBUG=True
```

### 12.4 ChatMol 服务环境变量

```bash
# ChatMol/.env
# =============
# LLM 配置
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# PyMOL 配置
PYMOL_PATH=/usr/local/bin/pymol

# Streamlit 配置
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=0.0.0.0
```

### 12.5 生产环境配置建议

1. **使用秘密管理服务**：
   ```bash
   # 推荐使用 docker secrets 或云服务商的秘密管理
   export DEEPSEEK_API_KEY=$(cat /run/secrets/deepseek_api_key)
   export OPENAI_API_KEY=$(cat /run/secrets/openai_api_key)
   ```

2. **环境变量验证**：
   ```python
   # 在各服务的启动脚本中添加环境变量验证
   import os

   required_env_vars = ['DEEPSEEK_API_KEY', 'OT3_ROBOT_IP']
   for var in required_env_vars:
       if not os.getenv(var):
           raise ValueError(f"Required environment variable {var} is not set")
   ```

3. **配置文件优先级**：
   - 环境变量 > 配置文件 > 默认值
   - 敏感信息必须通过环境变量注入

4. **开发 vs 生产环境**：
   ```bash
   # 开发环境使用 .env.development
   # 生产环境使用 .env.production
   # CI/CD 环境使用 CI/CD 系统的秘密管理
   ```

## 13. 安全与运维建议

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

## 14. 部署最佳实践

### 14.1 容器化部署建议

#### Docker Compose 示例

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 主前端应用
  nextjs-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_PROTOFLOW_API_URL=http://protoflow-backend:8000/api
      - NEXT_PUBLIC_PROTOFLOW_FRONTEND_URL=http://protoflow-frontend:3001
    depends_on:
      - protoflow-backend
      - protoflow-frontend

  # ProtoFlow 后端
  protoflow-backend:
    build: ./opentronsedge/protoflow/backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./protoflow.db
      - CORS_ORIGINS=http://localhost:3000,http://localhost:3001
    volumes:
      - protoflow_data:/app/uploads

  # ProtoFlow 前端
  protoflow-frontend:
    build: ./opentronsedge/protoflow/frontend
    ports:
      - "3001:3001"
    environment:
      - VITE_API_URL=http://protoflow-backend:8000/api
      - VITE_APP_BASE=/protoflow

  # LLMcontrolOT3 (可选)
  llmcontrol-ot3:
    build: ./LLMcontrolOT3
    ports:
      - "5000:5000"
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - OT3_ROBOT_IP=${OT3_ROBOT_IP}
    depends_on:
      - redis

  # ChatMol (可选)
  chatmol:
    build: ./ChatMol
    ports:
      - "8501:8501"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  protoflow_data:
```

### 14.2 生产环境优化

#### 14.2.1 资源限制与监控

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nextjs-app:
    build: .
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 14.2.2 反向代理配置 (Nginx)

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    # 主前端应用
    location / {
        proxy_pass http://nextjs-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ProtoFlow 前端
    location /protoflow/ {
        proxy_pass http://protoflow-frontend:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ProtoFlow API
    location /protoflow/api/ {
        proxy_pass http://protoflow-backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }

    # LLMcontrolOT3 API
    location /llmcontrol/ {
        proxy_pass http://llmcontrol-ot3:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ChatMol
    location /chatmol/ {
        proxy_pass http://chatmol:8501/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 14.3 CI/CD 流水线示例

#### GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install uv
      run: curl -LsSf https://astral.sh/uv/install.sh | sh

    - name: Install dependencies
      run: |
        npm install
        uv venv
        source .venv/bin/activate
        uv pip install -r opentronsedge/protoflow/backend/requirements.txt

    - name: Run tests
      run: |
        npm run lint
        source .venv/bin/activate
        python -m pytest opentronsedge/protoflow/test/

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push
      run: |
        docker build -t your-username/robota-frontend:latest .
        docker push your-username/robota-frontend:latest

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/project
          docker-compose pull
          docker-compose up -d
```

### 14.4 监控与日志

#### 14.4.1 健康检查端点

```python
# 添加到各主要服务
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
```

#### 14.4.2 日志聚合

```yaml
# docker-compose.logging.yml
services:
  # 添加到每个服务
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"

  # Fluentd 日志收集
  fluentd:
    image: fluent/fluentd:v1.16
    volumes:
      - ./fluentd/conf:/fluentd/etc
    ports:
      - "24224:24224"
```

### 14.5 备份与恢复策略

#### 14.5.1 数据备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/robota"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
sqlite3 opentronsedge/protoflow/backend/protoflow.db ".backup $BACKUP_DIR/protoflow_$DATE.db"

# 备份上传文件
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C opentronsedge/protoflow/backend/uploads .

# 备份配置文件
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" .env* docker-compose*.yml

# 清理30天前的备份
find "$BACKUP_DIR" -name "*.db" -o -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$DATE"
```

### 14.6 性能优化建议

1. **前端优化**：
   - 启用 Next.js ISR (Incremental Static Regeneration)
   - 配置 CDN 静态资源缓存
   - 使用 Webpack 代码分割

2. **后端优化**：
   - 启用数据库连接池
   - 配置 Redis 缓存层
   - 使用异步 I/O 处理

3. **网络优化**：
   - 启用 HTTP/2
   - 配置 Gzip 压缩
   - 使用负载均衡

---

> 如需进一步的 CI/CD、容器化或云平台部署示例，可在上述基础上引入 Docker/Helm 文件，或参考 Opentrons 官方脚手架与 Next.js 官方部署文档。

> 📋 **部署检查清单**：
> - [ ] 所有环境变量已正确配置
> - [ ] 服务间网络连接正常
> - [ ] 健康检查端点可访问
> - [ ] 日志收集系统已配置
> - [ ] 备份策略已实施
> - [ ] 监控告警已设置
> - [ ] 安全策略已启用
> - [ ] 性能测试已通过
