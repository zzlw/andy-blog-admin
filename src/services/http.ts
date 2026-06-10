/**
 * HTTP 服务层（参考 surmon.me.admin 的 nodepress service 设计）
 * - 统一响应 { status: 'success' | 'error', message, result }，成功自动解包
 * - 401 + TOKEN_EXPIRED：用 refresh token 静默换发后重放原请求（仅一次）
 * - 刷新失效：清除令牌并跳转登录页
 */
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { message as antdMessage } from 'antd'
import { CONFIG } from '@/config'
import { getAccessToken, getRefreshToken, removeTokens, setTokens } from './token'

export interface HttpResponse<T = any> {
  status: 'success' | 'error'
  message: string
  result: T
}

interface HttpErrorBody {
  status: 'error'
  message: string
  error: string
}

const REFRESH_PATH = '/api/auth/refresh'

const instance = axios.create({
  baseURL: CONFIG.apiBaseUrl,
  timeout: 10_000,
})

instance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && config.url !== REFRESH_PATH) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const redirectToLogin = () => {
  removeTokens()
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

/** 并发 401 时复用同一个刷新请求 */
let refreshing: Promise<void> | null = null

const refreshTokens = (): Promise<void> => {
  refreshing ??= axios
    .post<HttpResponse<{ access_token: string; refresh_token: string }>>(
      `${CONFIG.apiBaseUrl}${REFRESH_PATH}`,
      null,
      { headers: { Authorization: `Bearer ${getRefreshToken()}` } },
    )
    .then((res) => setTokens(res.data.result))
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

instance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<HttpErrorBody>) => {
    const body = error.response?.data
    const status = error.response?.status
    const config = error.config as (AxiosRequestConfig & { __isRetry?: boolean }) | undefined

    // access token 过期：静默刷新后重放
    if (status === 401 && body?.error === 'TOKEN_EXPIRED' && config && !config.__isRetry) {
      try {
        await refreshTokens()
        return await instance({ ...config, __isRetry: true } as AxiosRequestConfig)
      } catch {
        antdMessage.error('登录已失效，请重新登录')
        redirectToLogin()
        return Promise.reject(error)
      }
    }

    if (status === 401 && (body?.error === 'REFRESH_FAILED' || body?.error === 'TOKEN_INVALID')) {
      antdMessage.error('登录已失效，请重新登录')
      redirectToLogin()
      return Promise.reject(error)
    }

    antdMessage.error(body?.message || error.message || '请求失败')
    return Promise.reject(error)
  },
)

/** 类型化请求封装：返回值为解包后的完整响应体 */
const request = <T = any>(config: AxiosRequestConfig): Promise<HttpResponse<T>> =>
  instance.request(config) as Promise<HttpResponse<T>>

export default {
  get: <T = any>(url: string, params?: object) => request<T>({ method: 'get', url, params }),
  post: <T = any>(url: string, data?: object) => request<T>({ method: 'post', url, data }),
  put: <T = any>(url: string, data?: object) => request<T>({ method: 'put', url, data }),
  delete: <T = any>(url: string) => request<T>({ method: 'delete', url }),
  raw: instance,
}
