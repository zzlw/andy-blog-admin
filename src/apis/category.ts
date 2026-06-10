import http from '@/services/http'
import type { Category } from '@/types'

export type CategoryPayload = Pick<Category, 'name'> & Partial<Pick<Category, 'description' | 'cover'>>

export const getCategories = () =>
  http.get<Category[]>('/api/categories').then((res) => res.result)

export const createCategory = (data: CategoryPayload) => http.post('/api/categories', data)

export const updateCategory = (id: number, data: CategoryPayload) =>
  http.put(`/api/categories/${id}`, data)

export const deleteCategory = (id: number) => http.delete(`/api/categories/${id}`)
