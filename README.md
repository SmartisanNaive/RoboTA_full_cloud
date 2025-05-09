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
- **部署**: Docker

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.9+
- Docker (可选)

### 本地开发

1. 克隆项目
```bash
git clone [项目地址]
cd synbiocloudlab
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 访问应用
打开浏览器访问 http://localhost:3000

### Docker 部署

1. 构建镜像
```bash
docker build -t synbiocloudlab .
```

2. 运行容器
```bash
docker run -p 3000:3000 synbiocloudlab
```

## 项目结构

```
ALLrobotaWEB/
├── app/                    # Next.js 应用主目录
│   ├── api/                # API 路由（执行Python、登录注册、模拟Opentrons）
│   ├── components/         # 共享UI组件
│   ├── contexts/           # React上下文（如语言上下文）
│   ├── course/             # 课程相关页面
│   ├── experiment/         # 实验详情页面和控制界面
│   ├── experiments/        # 实验列表页面
│   ├── help/               # 帮助文档页面
│   ├── profile/            # 用户资料页面
│   ├── resources/          # 学习资源页面
│   ├── translations/       # 国际化翻译文件
│   ├── utils/              # 工具函数
│   ├── virtual-lab/        # 虚拟实验室页面
│   ├── globals.css         # 全局样式
│   ├── layout.tsx          # 主布局组件
│   └── page.tsx            # 主页/欢迎页面
├── components/             # 通用UI组件
│   └── ui/                 # 基础UI组件（基于shadcn/ui）
├── hooks/                  # 自定义React hooks
├── lib/                    # 工具函数库
├── public/                 # 静态资源
├── styles/                 # 样式文件
│
├── opentronsedge/          # Opentrons平台相关代码
│   ├── api/                # Opentrons API代码
│   ├── app/                # Opentrons应用程序
│   ├── protocol-designer/  # 协议设计器
│   ├── components/         # Opentrons组件库
│   ├── robot-server/       # 机器人服务器
│   └── ...                 # 其他Opentrons相关代码
│
├── LLMcontrolOT3/          # 大语言模型控制Opentrons设备
│   ├── ai_controller/      # AI控制器模块（处理自然语言指令）
│   ├── ai_interface/       # AI接口
│   ├── config/             # 配置文件（LLM API和机器人设置）
│   ├── server/             # Flask服务器（提供REST API接口）
│   ├── templates/          # Opentrons协议模板
│   ├── protocalLibrary/    # 协议库（示例协议）
│   └── utils/              # 工具函数（协议生成等）
│
├── ChatMol/                # 分子设计与分析LLM助手
│   ├── chatmol_pkg/        # ChatMol Python包
│   ├── chatmol-streamlit/  # Streamlit界面应用
│   ├── copilot_public/     # ChatMol Copilot（分子设计助手）
│   ├── miniGUI/            # 轻量级GUI界面
│   └── pymol_plugin/       # PyMOL插件
```

## 主要功能模块

### 虚拟实验室
- Python 代码执行环境
- Opentrons 协议分析
- 实时输出显示
- 代码编辑器集成

### 实验分析
- 协议分析
- 数据可视化
- 实验时间线展示

### 实际实验室控制
- 实验设备控制
- 实时状态监控
- 数据采集

### Opentrons平台集成 (opentronsedge)
- 实验协议解析与可视化
- 协议运行动画反馈
- 实验分析与错误检测
- 机器人操作API接口
- 硬件控制与监控支持

### 大语言模型实验设备控制 (LLMcontrolOT3)
- 自然语言指令解析（支持中英文）
- 结构化机器人操作命令生成
- 动态协议生成与执行
- 参数验证与交互式反馈
- 支持移液、温控、加热震荡等多种操作
- Flask REST API服务

## 开发指南

### 添加新功能

1. 在 `app` 目录下创建新的页面或组件
2. 在 `components` 目录下添加可复用组件
3. 在 `lib` 目录下添加工具函数
4. 更新路由配置

### 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化

## 许可证

MIT License

## 联系方式

- 邮箱: gaoyuanbio@qq.com

## 致谢

感谢所有为这个项目做出贡献的开发者！ 