import {
  post,
  get,
  put,
  _delete
} from '@/services/plugins/axios'
import { saveTokens } from '../utils/cookie'
import { toCompat } from '@/services/utils/compat'

// 角色字段兼容：旧视图使用 auth（8/16/32），新 API 字段名为 role（数值不变）
const withAuthAlias = author => ({ ...author, auth: author.role })

const SUPER_ADMIN_ROLE = 32

export default class Author {
  static async getToken(name, password) {
    const res = await post('api/auth/login', {
      name,
      password
    })
    const tokens = res.result
    saveTokens(tokens.access_token, tokens.refresh_token)
    return tokens
  }

  // 刷新令牌（轮换双令牌）
  static async getRefreshToken() {
    const res = await post('api/auth/refresh')
    saveTokens(res.result.access_token, res.result.refresh_token)
  }

  // 获取当前登录作者的信息
  static async getAuthorInfo() {
    const res = await get('api/auth/profile')
    return withAuthAlias(res.result)
  }

  // 获取所有作者
  static async getAuthors() {
    const res = await get('api/authors')
    return res.result.map(withAuthAlias)
  }

  // 获取除了超级管理员之外的所有作者
  static async getAdminAuthors() {
    const res = await get('api/authors')
    return res.result
      .filter(author => author.role !== SUPER_ADMIN_ROLE)
      .map(withAuthAlias)
  }

  // 创建作者
  static createAuthor(author) {
    return toCompat(post('api/authors', {
      name: author.name,
      password: author.password,
      email: author.email,
      description: author.description,
      role: author.auth
    }))
  }

  // 更新作者信息
  static updateAuthor(author, id) {
    return toCompat(put(`api/authors/${id}`, {
      avatar: author.avatar,
      email: author.email,
      description: author.description,
      role: author.auth
    }))
  }

  // 重置作者密码（超管）
  static changePassword(data, id) {
    return toCompat(put(`api/authors/${id}/password`, { password: data.password }))
  }

  // 更换自己的密码
  static changeSelfPassword(data) {
    return toCompat(put('api/auth/password', {
      old_password: data.oldPassword,
      new_password: data.password
    }))
  }

  // 删除作者
  static deleteAuthor(id) {
    return toCompat(_delete(`api/authors/${id}`))
  }
}
