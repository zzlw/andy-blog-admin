interface AppRuntimeConfig {
  apiBaseUrl?: string
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
}

export const STORAGE_KEY = {
  accessToken: 'andy-blog-admin:access_token',
  refreshToken: 'andy-blog-admin:refresh_token',
} as const
