// 运行时配置：生产容器启动时由 entrypoint 脚本用环境变量渲染本文件，
// 实现「一份构建包部署多环境」。本地开发使用以下默认值。
window.__APP_CONFIG__ = {
  apiBaseUrl: 'http://localhost:3000',
  staticPath: 'https://static.jiawen.live'
}
