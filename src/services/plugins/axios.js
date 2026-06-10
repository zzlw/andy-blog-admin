/**
 * 适配新版 NestJS 后端：
 * - 统一响应 { status: 'success' | 'error', message, result }
 * - 错误语义：HTTP 401 + error === 'TOKEN_EXPIRED' 触发静默刷新重放
 * - 刷新失败（REFRESH_FAILED / TOKEN_INVALID）强制重新登录
 */

import Config from '@/config/index'
import Vue from 'vue'
import author from '@/services/models/author'
import axios from 'axios'
import { getToken } from '@/services/utils/cookie'
import store from '@/store'

const REFRESH_URL = 'api/auth/refresh'

const config = {
  baseURL: Config.baseUrl,
  timeout: 5 * 1000,
  crossDomain: true,
  validateStatus(status) {
    return status >= 200 && status < 500
  }
}

const _axios = axios.create(config)

_axios.interceptors.request.use(originConfig => {
  const reqConfig = { ...originConfig }

  // step1: 容错处理
  if (!reqConfig.url) {
    throw new Error({
      source: 'axiosInterceptors',
      message: 'request need url',
    })
  }

  // 默认使用 get 请求
  if (!reqConfig.method) {
    reqConfig.method = 'get'
  }

  // 大小写
  reqConfig.method = reqConfig.method.toLowerCase()

  if (reqConfig.method === 'get') {
    if (!reqConfig.params) {  // 防止字段用错
      reqConfig.params = reqConfig.data || {}
    }
  } else if (reqConfig.method === 'post') {
    if (!reqConfig.data) {
      reqConfig.data = reqConfig.params || {}
    }

    let hasFile = false
    Object.keys(reqConfig.data).forEach((key) => {
      if (typeof reqConfig.data[key] === 'object') {
        const item = reqConfig.data[key]
        if (item instanceof FileList || item instanceof File || item instanceof Blob) {
          hasFile = true
        } else if (Object.prototype.toString.call(item) === '[object Object]') {
          reqConfig.data[key] = JSON.stringify(reqConfig.data[key])
        }
      }
    })

    if (hasFile) {
      const formData = new FormData()
      Object.keys(reqConfig.data).forEach(key => {
        formData.append(key, reqConfig.data[key])
      })
      reqConfig.data = formData
    }
  }

  // step2: auth 处理（cookie 中已带 Bearer 前缀）
  if (reqConfig.url.replace(/^\//, '') === REFRESH_URL) {
    const refreshToken = getToken('refresh_token')
    if (refreshToken) {
      reqConfig.headers.Authorization = refreshToken
    }
  } else {
    const accessToken = getToken('access_token')
    if (accessToken) {
      reqConfig.headers.Authorization = accessToken
    }
  }
  return reqConfig
}, error => {
  Promise.reject(error)
})

function forceLogin() {
  setTimeout(() => {
    store.dispatch('loginOut')
    const { origin } = window.location
    window.location.href = origin
  }, 1500)
}

_axios.interceptors.response.use(async (res) => {
  const body = res.data

  // 成功：返回完整响应体 { status, message, result }，由 service 层解包
  if (res.status.toString().charAt(0) === '2' && body && body.status === 'success') {
    return body
  }

  // 失败：body 为 { status: 'error', message, error }
  const { url, method, params, data } = res.config
  const message = (body && body.message) || '未知错误'
  const errorCode = body && body.error

  // access token 过期：静默刷新后重放原请求（仅重试一次）
  if (res.status === 401 && errorCode === 'TOKEN_EXPIRED' && !res.config.__isRetry) {
    store.commit('SET_REFRESH_OPTION', { url, method, params, data })
    try {
      await author.getRefreshToken()
      return await _axios({ ...store.state.refreshOptions, __isRetry: true })
    } catch (e) {
      forceLogin()
      return Promise.reject(body)
    }
  }

  // 刷新令牌失效 / 令牌非法：强制重新登录
  if (res.status === 401 && (errorCode === 'REFRESH_FAILED' || errorCode === 'TOKEN_INVALID')) {
    Vue.prototype.$message({ message: '登录已失效，请重新登录', type: 'error' })
    forceLogin()
    return Promise.reject(body)
  }

  Vue.prototype.$message({
    message,
    type: 'error',
  })

  return Promise.reject(body)
}, error => {
  // eslint-disable-next-line no-console
  console.log(error)
  return Promise.reject(error)
})

const Plugin = {}

Plugin.install = function (Vue) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios
      }
    },
    $axios: {
      get() {
        return _axios
      }
    }
  })
}

if (!Vue.axios) {
  Vue.use(Plugin)
}

// 导出常用函数

export function post(url, data = {}, params = {}) {
  return _axios({
    method: 'post',
    url,
    data,
    params,
  })
}

export function get(url, params = {}) {
  return _axios({
    method: 'get',
    url,
    params
  })
}

export function put(url, data = {}, params = {}) {
  return _axios({
    method: 'put',
    url,
    params,
    data,
  })
}

export function _delete(url, params = {}) {
  return _axios({
    method: 'delete',
    url,
    params,
  })
}

export default _axios
