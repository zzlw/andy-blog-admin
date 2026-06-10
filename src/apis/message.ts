import http from '@/services/http'
import type { Message, PaginateResult } from '@/types'

export const getMessages = (page: number, pageSize = 10) =>
  http
    .get<PaginateResult<Message>>('/api/messages', { page, page_size: pageSize })
    .then((res) => res.result)

export const deleteMessage = (id: number) => http.delete(`/api/messages/${id}`)
