# ProtoFlow

ProtoFlow 是一个用于分析 Opentrons 协议的工具。它包含一个 FastAPI 后端和一个 React 前端。

## 项目结构

- `backend/`: FastAPI 后端应用，处理协议分析逻辑。
- `frontend/`: React 前端应用，提供用户界面进行协议上传和结果展示。

## 近期更新与修复

**2025年5月8号**

- **修复前端路由 404 错误**:
  - **问题**: 当应用部署在类似 `/protoflow` 的子路径下时，访问如 `/protoflow/<id>/timeline` 的前端路由会导致 404 错误。
  - **原因**: React Router 的 `createBrowserRouter` 默认配置的路由是基于应用根路径的，没有考虑到 `/protoflow` 这个基础路径。
  - **解决方案**:
    - 修改了 `opentronsedge/protoflow/frontend/src/main.jsx` 文件。
    - 在 `createBrowserRouter` 的配置中添加了 `basename: '/protoflow'` 选项。
    ```javascript
    const router = createBrowserRouter([
      // ... route definitions ...
    ], {
      basename: '/protoflow' // 添加了此行
    });
    ```
  - **效果**: 此修改确保了所有在 `main.jsx` 中定义的路由都正确地相对于 `/protoflow` 基础路径进行解析，解决了在子路径下部署时的 404 错误。 
