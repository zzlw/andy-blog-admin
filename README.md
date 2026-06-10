# andy-blog-admin

博客管理后台（React 重写版），参考 [surmon.me.admin](https://github.com/surmon-china/surmon.me.admin) 架构设计，对接 [andy-blog-koa](../andy-blog-koa)（NestJS）后端。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite（dev server 热更新 / 多阶段 Docker 构建）
- **UI**: Ant Design 5
- **路由**: React Router 7（`createBrowserRouter`）
- **请求**: Axios 服务层 —— 统一响应解包、access token 过期静默刷新并重放请求
- **编辑器**: CodeMirror 6（Markdown）+ marked 预览
- **包管理**: pnpm

## 目录结构

```
src/
├── apis/          # 按资源划分的 API 模块（auth/article/category/...）
├── components/    # 公共组件（布局、鉴权守卫、图片上传）
├── contexts/      # 全局上下文（当前登录作者）
├── pages/         # 路由页面
├── services/      # http（axios 实例 + 拦截器）、token 存储
├── config.ts      # 运行时配置读取（window.__APP_CONFIG__）
└── types.ts       # 与后端约定的数据模型
```

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:8080
```

API 地址默认 `http://localhost:3000`，可修改 `public/app-config.js`。

推荐使用 [andy-blog-deploy](../andy-blog-deploy) 一键启动全部服务：

```bash
cd ../andy-blog-deploy && make up   # admin 映射到 http://localhost:3002
```

## 构建与部署

```bash
pnpm build      # 产物输出 dist/
```

生产镜像为多阶段构建（builder → nginx），**构建产物不包含任何环境信息**：
容器启动时 entrypoint 脚本根据 `API_BASE_URL` 环境变量渲染 `app-config.js`，
实现「一份构建包部署多环境」。

```bash
docker build -t andy-blog-admin .
docker run -p 8080:80 -e API_BASE_URL=https://api.example.com andy-blog-admin
```
