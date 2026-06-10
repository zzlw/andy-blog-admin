/**
 * 新版后端语义化错误码（配合标准 HTTP 状态码）
 * 401 + TOKEN_EXPIRED 会触发拦截器静默刷新
 */
const stateCode = {
  AUTH_FAILED: '认证失败',
  TOKEN_INVALID: '令牌无效',
  TOKEN_EXPIRED: '令牌过期',
  REFRESH_FAILED: '登录已失效',
  NO_PERMISSION: '权限不足',
  NOT_FOUND: '资源不存在',
  VALIDATION_FAILED: '参数错误',
  UPLOAD_FAILED: '上传失败',
  SERVER_ERROR: '服务器异常'
}

export default stateCode
