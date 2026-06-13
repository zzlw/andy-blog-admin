/**
 * AI 对话服务（andy-blog-ai Worker）专用 HTTP 客户端
 * - baseURL 指向 `${aiApiBase}/admin`，与 Koa 业务接口（http.ts）相互独立
 * - 响应为 Hono 风格信封 { success, message, data }，由调用方解包 .data
 * - 鉴权复用后台 access token；Worker 侧反查 Koa /auth/verify-token 校验合法性
 * - 401 表示令牌失效：清除令牌并跳转登录页（与 Koa 侧静默刷新策略不同，AI 接口不重放）
 */
import axios, { AxiosError } from 'axios'
import { message as antdMessage } from 'antd'
import { CONFIG } from '@/config'
import { getAccessToken, removeTokens } from './token'

export interface AiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

interface AiErrorBody {
  success: false
  message: string
  error: unknown
}

const instance = axios.create({
  baseURL: `${CONFIG.aiApiBase}/admin`,
  timeout: 15_000,
})

instance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<AiErrorBody>) => {
    const status = error.response?.status
    const body = error.response?.data

    if (status === 401) {
      antdMessage.error('登录已失效，请重新登录')
      removeTokens()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    antdMessage.error(body?.message || error.message || 'AI 服务请求失败')
    return Promise.reject(error)
  },
)

/** AI 服务是否已配置（未配置则隐藏后台 AI 会话入口） */
export const isAiServiceEnabled = () => Boolean(CONFIG.aiApiBase)

export default {
  get: <T = any>(url: string, params?: object) =>
    instance.request({ method: 'get', url, params }) as Promise<AiResponse<T>>,
  delete: <T = any>(url: string) =>
    instance.request({ method: 'delete', url }) as Promise<AiResponse<T>>,
  raw: instance,
}
