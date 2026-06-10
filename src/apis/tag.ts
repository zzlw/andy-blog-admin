import http from '@/services/http'
import type { Tag } from '@/types'

export const getTags = () => http.get<Tag[]>('/api/tags').then((res) => res.result)

export const createTag = (name: string) => http.post('/api/tags', { name })

export const updateTag = (id: number, name: string) => http.put(`/api/tags/${id}`, { name })

export const deleteTag = (id: number) => http.delete(`/api/tags/${id}`)
