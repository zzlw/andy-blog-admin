/**
 * 写操作兼容层：旧视图通过 res.errorCode === 0 与 res.msg 判断结果并提示，
 * 此处将新版统一响应 { status, message, result } 转换为旧约定
 */
export function toCompat(promise) {
  return promise
    .then(res => ({
      errorCode: 0,
      msg: (res && res.message) || '操作成功',
      result: res && res.result
    }))
    .catch(e => ({
      errorCode: 1,
      msg: (e && e.message) || '操作失败'
    }))
}
