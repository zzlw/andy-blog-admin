# syntax=docker/dockerfile:1

# ---------- 基础层 ----------
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# ---------- 开发层：Vite Dev Server 热重载（compose dev 使用 target: dev） ----------
FROM base AS dev
ENV NODE_ENV=development
RUN pnpm install
COPY . .
EXPOSE 8080
CMD ["pnpm", "dev"]

# ---------- 构建层 ----------
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY . .
# 注意：构建期不注入任何 API 地址，API 地址由运行时 app-config.js 提供
RUN pnpm build

# ---------- 运行层：nginx 托管静态资源 ----------
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist/ /usr/share/nginx/html/

# nginx 官方镜像入口会自动 envsubst 渲染 templates 下的配置
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
# 启动时渲染前端运行时配置（在 nginx 启动前执行）
COPY docker/30-render-app-config.sh /docker-entrypoint.d/30-render-app-config.sh
RUN chmod +x /docker-entrypoint.d/30-render-app-config.sh

ENV NGINX_PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
