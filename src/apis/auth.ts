import http from '@/services/http'
import { setTokens, type TokenPair } from '@/services/token'
import type { Author } from '@/types'

export const login = async (name: string, password: string) => {
  const res = await http.post<TokenPair>('/api/auth/login', { name, password })
  setTokens(res.result)
  return res.result
}

export const getProfile = () => http.get<Author>('/api/auth/profile').then((res) => res.result)

export const updateProfile = (data: Partial<Pick<Author, 'avatar' | 'email' | 'description'>>) =>
  http.put<Author>('/api/auth/profile', data)

export const updatePassword = (oldPassword: string, newPassword: string) =>
  http.put('/api/auth/password', { old_password: oldPassword, new_password: newPassword })
