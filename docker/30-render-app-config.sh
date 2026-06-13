#!/bin/sh
# 容器启动时根据环境变量渲染运行时配置，实现「一份构建包部署多环境」
set -e

cat > /usr/share/nginx/html/app-config.js <<EOF
window.__APP_CONFIG__ = {
  apiBaseUrl: '${API_BASE_URL}',
  staticPath: '${STATIC_PATH}',
  aiApiBase: '${AI_API_BASE}'
}
EOF

echo "app-config.js rendered: API_BASE_URL=${API_BASE_URL} STATIC_PATH=${STATIC_PATH} AI_API_BASE=${AI_API_BASE}"
