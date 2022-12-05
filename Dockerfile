# 第一阶段（构建阶段）
FROM node:12-alpine as builder

WORKDIR /app

COPY . /app

# RUN npm i --registry=https://registry.npm.taobao.org
RUN npm i

RUN npm run build

# 第二阶段
FROM nginx:alpine as server
COPY --from=builder /app/dist/ /var/www/html/
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 5000