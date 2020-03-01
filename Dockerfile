# 第一阶段（构建阶段）
FROM node:12-alpine AS builder

ARG API_DOMAIN

ENV API_DOMAIN=${API_DOMAIN}

WORKDIR /app

COPY . /app

RUN npm i

RUN npm run build

# 第二阶段（运行阶段）
FROM nginx:alpine AS server

# 将构建的文件复制到 Nginx 服务器
COPY --from=builder /app/dist/ /var/www/html/

# 复制自定义的 Nginx 配置文件
COPY ./nginx.conf /etc/nginx/nginx.conf

# 暴露端口 80
EXPOSE 80

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
