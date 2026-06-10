// 运行时配置（本地开发默认值）
// 生产容器启动时，docker/30-render-app-config.sh 会用环境变量重新渲染此文件，
// 实现「一份构建包部署多环境」，切换环境无需重新构建前端
window.__APP_CONFIG__ = {
  apiBaseUrl: 'http://localhost:3000'
}
