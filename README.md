# RoboTA-SynbioCloudLab

RoboTA-SynbioCloudLab 是一个基于 Next.js 构建的合成生物学虚拟实验室平台，提供代码执行、实验分析和可视化功能。

## 功能特点

- 🧪 虚拟实验室环境
- 📝 支持 Python 代码执行
- 🤖 集成 Opentrons 协议分析
- 📊 实验数据可视化
- 💬 AI 辅助实验设计
- 🌐 实时实验分析

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

### 分子设计与分析助手 (ChatMol)
- 自然语言转PyMOL命令
- 分子结构预测与分析
- 分子对接模拟
- 序列设计辅助
- 小分子分析与生成
- 轻量级图形界面
- Streamlit交互式应用
- 自动化的分子设计Copilot

## 主页设计 (Homepage Design)

应用程序的主页 (`/`) 作为用户的欢迎入口，其设计侧重于引导和信息展示：

1.  **欢迎区域 (Header):**
    *   页面顶部是一个醒目的头部区域，采用从浅蓝到白色的渐变背景，并包含一个独特的蓝色横幅 (`bg-blue-600`)，带有视觉效果（倾斜和微妙的 DNA 图案覆盖）。
    *   显示一个大号、加粗的标题（例如，"欢迎来到 ALLrobota"）和一个描述平台宗旨的副标题，两者都会根据所选语言进行翻译。
    *   一个清晰的"开始探索" (`{translate('getStarted', language)}`) 按钮醒目地将用户链接到 `/experiments` 页面。整个头部区域使用动画 (`framer-motion`) 以实现平滑的进入效果。

2.  **主要内容区域:**
    *   头部下方的主内容区使用容器来居中内容。
    *   **功能卡片 (Feature Cards):** 一个网格布局（响应式：根据屏幕尺寸显示 1、2 或 3 列）使用自定义的 `FeatureCard` 组件展示平台的关键功能。每个卡片包含：
        *   一个图标 (例如, `Microscope`, `FlaskRound`, `Dna`)。
        *   一个标题 (例如, `{translate('virtualExperiments', language)}`)。
        *   一段描述 (例如, `{translate('virtualExperimentsDesc', language)}`)。
        *   一个链接到对应版块的按钮，带有翻译后的文本 (例如, "探索实验")。
        *   具体来说，这些卡片链接到：
            *   **虚拟实验 (`/virtual-lab`)**: 由 `virtualExperimentsDesc` 描述。
            *   **真实实验室控制 (`/experiment/real-lab-control`)**: 由 `realLabControlDesc` 描述。
            *   **学习资源 (`/resources`)**: 由 `learningResourcesDesc` 描述。
        *   这些卡片具有悬停和点击动画以增强交互性。
    *   **关于版块 (About Section):**
        *   一个带有渐变背景的大卡片 (`Card` 组件) 提供关于平台的更详细信息 (`{translate('aboutTitle', language)}`, `{translate('aboutSubtitle', language)}`, `{translate('aboutDescription', language)}`)。
        *   它使用图标 (`Beaker`, `Users`, `FlaskRound`, `Brain`, `Dna`) 和翻译后的文本描述 (`feature1` 到 `feature5`) 列出关键特性。
        *   最后以一句鼓励性的话语结束 (`{translate('joinUs', language)}`)。
    *   主要内容区域同样运用了入场动画。

**整体印象:**

主页作为一个友好的登陆页面，清晰地介绍了平台，通过视觉上独特的卡片突出了其主要功能（虚拟实验室、真实实验室控制、资源），通过按钮提供了快速访问途径，并在"关于"部分提供了更详细的信息。设计上采用了清新的蓝色主题调色板、图标和动画，旨在创造引人入胜的用户体验，并集成了国际化支持。

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

## 部署指南

### 亚马逊 EC2 部署

1. 启动 EC2 实例（香港区域）
2. 安装 Docker 和 Docker Compose
3. 配置 Nginx 反向代理
4. 部署应用

详细部署步骤请参考部署文档。

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 邮箱: gaoyuanbio@qq.com

## 致谢

感谢所有为这个项目做出贡献的开发者！ 
