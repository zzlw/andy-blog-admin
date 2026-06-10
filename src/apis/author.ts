import http from '@/services/http'
import type { Author, AuthorRole } from '@/types'

export interface AuthorPayload {
  name: string
  password: string
  email?: string
  description?: string
  role?: AuthorRole
}

export const getAuthors = () => http.get<Author[]>('/api/authors').then((res) => res.result)

export const createAuthor = (data: AuthorPayload) => http.post('/api/authors', data)

export const updateAuthor = (
  id: number,
  data: Partial<Pick<Author, 'avatar' | 'email' | 'description' | 'role'>>,
) => http.put(`/api/authors/${id}`, data)

export const resetAuthorPassword = (id: number, password: string) =>
  http.put(`/api/authors/${id}/password`, { password })

export const deleteAuthor = (id: number) => http.delete(`/api/authors/${id}`)
