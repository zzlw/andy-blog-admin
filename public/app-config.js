// 运行时配置：生产容器启动时由 entrypoint 脚本用环境变量渲染本文件，
// 实现「一份构建包部署多环境」。本地开发使用以下默认值。
window.__APP_CONFIG__ = {
  apiBaseUrl: 'http://localhost:3000',
  // 本地 MinIO（线上 OSS 已整桶镜像进本地，自包含，避免跨境拉取 CDN 失败）
  staticPath: 'http://localhost:9000/andy-blog',
  // 本地 andy-blog-ai worker（wrangler dev 默认端口 8787）。
  // 浏览器直连宿主机端口，故用 localhost；worker 侧需在 .dev.vars 放行 CORS。
  aiApiBase: 'http://localhost:8787'
}
