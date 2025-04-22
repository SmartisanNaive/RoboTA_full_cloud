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
synbiocloudlab/
├── app/                    # Next.js 应用目录
│   ├── api/               # API 路由
│   ├── virtual-lab/       # 虚拟实验室页面
│   └── real-lab-control/  # 实际实验室控制页面
├── components/            # React 组件
├── lib/                   # 工具函数
├── public/               # 静态资源
└── styles/              # 样式文件
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
