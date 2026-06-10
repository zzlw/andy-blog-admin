// 运行时配置优先（window.__APP_CONFIG__ 由 public/app-config.js 提供，
// 生产环境由 nginx 容器启动时通过 envsubst 渲染），构建期变量仅作兜底
const runtimeConfig = window.__APP_CONFIG__ || {}

const Config = {
  sideBarLevel: 3, // 侧边栏层级限制, 3表示三级, 可设置 2 和 3
  defaultRoute: '/about', // 默认打开的路由
  baseUrl: runtimeConfig.apiBaseUrl || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000',
  notLoginRoute: ['login'], // 无需登录即可访问的路由 name
}

export default Config
