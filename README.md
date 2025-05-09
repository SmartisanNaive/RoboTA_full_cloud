# RoboTA-SynbioCloudLab

RoboTA-SynbioCloudLab 是一个基于 Next.js 构建的合成生物学虚拟实验室平台，提供代码执行、实验分析和可视化功能。

## 功能特点

- 🧪 虚拟实验室环境
- 📝 支持 Python 代码执行
- 🤖 集成 Opentrons 协议分析
- 📊 实验数据可视化
- 💬 AI 辅助实验设计
- 🌐 实时实验分析

## 更新日志

### 2025年5月8日

#### ProtoFlow 模块更新
- **修复前端路由 404 错误**: 
  - **问题**: 当 ProtoFlow 应用部署在类似 `/protoflow` 的子路径下时，访问如 `/protoflow/<id>/timeline` 的前端路由会导致 404 错误。
  - **原因**: React Router 的 `createBrowserRouter` 默认配置的路由是基于应用根路径的，没有考虑到 `/protoflow` 这个基础路径。
  - **解决方案**: 在 `opentronsedge/protoflow/frontend/src/main.jsx` 文件中，向 `createBrowserRouter` 配置添加了 `basename: '/protoflow'` 选项。
  - **提交历史**:
    - "解决ProtoFlow前端在子路径部署时的404错误，并添加ProtoFlow模块的README文档"
    - "添加.gitignore和ProtoFlow文档说明"
    - "更新ProtoFlow前端代码和配置"
    - "更新虚拟实验室页面"
    - "更新ProtoFlow后端应用"

#### 其他更新
- 创建了 ProtoFlow 模块专用的 README.md 文件，详细说明了项目结构和最近的修复
- 更新了虚拟实验室页面，支持 ProtoFlow 协议分析
- 优化了 ProtoFlow 后端应用，提高了 API 稳定性
- 更新了前端依赖，解决了版本兼容问题
- 添加了 `/temp` 目录到 `.gitignore` 文件，优化版本控制

## 技术栈

- **前端框架**: Next.js 14
- **UI 组件**: shadcn/ui
- **代码编辑器**: Monaco Editor
- **样式**: Tailwind CSS
- **后端**: Python FastAPI/Flask

## 环境要求

- Node.js 18+
- Python 3.9+
- Opentrons Python 库及依赖

## 部署指南

本项目有两种运行模式：1) 仅运行虚拟实验室和 ProtoFlow 协议分析器，2) 运行完整的 RoboTA-SynbioCloudLab 平台。

### 依赖安装

#### 前端依赖
```bash
# 主项目前端依赖
cd ALLrobotaWEB
npm install

# ProtoFlow 前端依赖
cd opentronsedge/protoflow/frontend
npm install
```

#### 后端依赖
```bash
# ProtoFlow 后端依赖
cd opentronsedge/protoflow/backend
python -m venv protoflow_env
source protoflow_env/bin/activate  # Windows: protoflow_env\Scripts\activate
pip install fastapi uvicorn opentrons
```

### 启动方式

#### 方式一：仅启动虚拟实验室 (ProtoFlow)

ProtoFlow 组件需要按以下顺序启动：

1. **ProtoFlow 后端**:
```bash
cd opentronsedge/protoflow/backend
# 激活虚拟环境 (如果使用)
source protoflow_env/bin/activate  # Windows: protoflow_env\Scripts\activate
# 启动后端服务
python app.py
```
后端服务将在 `http://localhost:8000` 上运行

2. **ProtoFlow 前端**:
```bash
cd opentronsedge/protoflow/frontend
npm run dev
```
前端服务将在 `http://localhost:3001` 上运行

完成后，你可以访问 `http://localhost:3001` 来使用 ProtoFlow 协议分析器。