const Config = {
  sideBarLevel: 3, // 侧边栏层级限制, 3表示三级, 可设置 2 和 3
  defaultRoute: '/about', // 默认打开的路由
  baseUrl: process.env.API_DOMAIN,
  notLoginRoute: ['login'], // 无需登录即可访问的路由 name
}

export default Config
