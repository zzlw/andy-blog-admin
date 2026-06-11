interface AppRuntimeConfig {
  apiBaseUrl?: string
  staticPath?: string
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppRuntimeConfig
  }
}

const runtime: AppRuntimeConfig = window.__APP_CONFIG__ ?? {}

export const CONFIG = {
  /** API 基础地址：运行时注入优先，兜底本地开发地址 */
  apiBaseUrl: runtime.apiBaseUrl || 'http://localhost:3000',
  /** 静态资源域名：图片只存相对路径，展示时拼接此前缀 */
  staticPath: runtime.staticPath || '',
}

/**
 * 相对路径 → 绝对 URL；已是绝对地址 / data: 则原样返回（幂等，兼容外链）。
 * 图片字段在数据库只存相对路径（如 /blog/x.jpg），仅在「展示」时拼接域名，
 * 表单值始终保持相对，回存不会写入域名。换域名只改环境变量即可。
 */
export const resolveStatic = (value?: string): string => {
  if (!value) return value ?? ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value
  const base = CONFIG.staticPath.split(',')[0].trim().replace(/\/$/, '')
  if (!base) return value
  return value.charAt(0) === '/' ? `${base}${value}` : `${base}/${value}`
}

export const STORAGE_KEY = {
  accessToken: 'andy-blog-admin:access_token',
  refreshToken: 'andy-blog-admin:refresh_token',
} as const
