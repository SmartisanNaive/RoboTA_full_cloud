# OptKnock Simulator 部署与使用说明

本项目是一个交互式 OptKnock 算法模拟器，使用 Node.js + Express 提供后端服务，前端静态页面位于 `public/` 目录。您可以在本地快速启动，也可部署到任何支持 Node.js 的环境。

## 目录结构

```
d:\Project\Succinate
├── public\
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── server.js
├── package.json
├── package-lock.json
├── optKnock_results.json
├── compare_optKnock_scenarios.m
├── tutorial_optKnock.m
├── iJO1366.csv
└── result.md
```

- 后端入口：`server.js`（Express 静态资源与 API）
- 前端资源：`public/`（HTML/CSS/JS）
- 项目描述与依赖：`package.json`
- 示例/数据：`optKnock_results.json`、`iJO1366.csv`、MATLAB 文件等

## 环境要求

- Node.js（建议 v16+）
- npm（随 Node.js 提供）
- 操作系统：Windows/Linux/macOS 均可（下文以 Windows PowerShell 举例）

## 安装依赖

在项目根目录执行：

```
npm install
```

这会安装运行所需的依赖：`express`、`path`、`fs`，以及开发依赖 `nodemon`。

## 启动与预览

默认启动端口为 `3000`。

- 常规启动：

```
npm start
```

或直接执行：

```
node server.js
```

- 指定端口（示例：3001）：

在 Windows PowerShell 中：

```
$env:PORT=3001; node server.js
```

启动后，控制台会显示：

```
OptKnock Simulator server running on http://localhost:<PORT>
```

用浏览器打开：`http://localhost:3000/`（或您指定的端口）。

> 提示：通过 `Ctrl + C` 可停止正在运行的服务。

## 开发模式（热更新）

开发时可使用 `nodemon` 自动重启服务：

```
npm run dev
```

它会监听文件变更并自动重启 `server.js`，方便迭代调试。

## 前端说明

- 前端页面位于 `public/index.html`，逻辑在 `public/script.js`。
- 终端面板的提示信息（以 `>>` 开头）采用同步追加方式，代码行（赋值/函数调用等）使用打字机效果逐行输出，确保视觉顺序稳定。
- 如需修改交互与显示效果，建议直接编辑 `script.js` 并使用开发模式观察变化。

## API 说明

由 `server.js` 提供的主要接口：

- `GET /`：返回首页 `public/index.html`
- `GET /api/optknock-data`：读取并返回 `optKnock_results.json` 的全部数据
- `GET /api/scenario/:id`：按场景 ID（如 `scenario_1`）返回对应数据
- `GET /api/scenario?geneset=...&glucose=...&target=...&knockout=...`：根据查询参数返回匹配场景，若无匹配则返回模拟结果
- `GET /api/gene-sets`：返回预置的基因集信息

> 注意：若需自定义数据来源或格式，请修改 `server.js` 中对应路由逻辑。

## 部署建议

- 生产环境建议使用进程管理工具（如 PM2）或容器化方案（如 Docker）运行 Node 服务，并配置反向代理（如 Nginx）暴露外网端口。
- 确保环境变量 `PORT` 与外部代理/负载均衡端口一致。
- 日志与监控：请结合您的运维体系，启用日志滚动与健康检查。

## 常见问题排查

- 端口被占用：
  - 修改端口：`$env:PORT=<新的端口>; node server.js`
  - 或关闭占用该端口的进程后再启动。
- 数据文件缺失：
  - `optKnock_results.json` 不存在或格式异常会导致接口报错，请确保文件存在且 JSON 格式正确。
- 无法访问页面：
  - 检查控制台是否出现错误信息；确认浏览器访问的端口与服务启动端口一致。
- Windows 下中文路径/权限问题：
  - 建议在具有读写权限的目录运行；避免路径中包含特殊字符。

## 许可证

本项目采用 MIT 许可证，详见 `package.json` 中的 `license` 字段。