import http from '@/services/http'
import type { Comment } from '@/types'

export const getComments = (articleId: number) =>
  http.get<Comment[]>('/api/comments', { article_id: articleId }).then((res) => res.result)

export const deleteComment = (id: number) => http.delete(`/api/comments/${id}`)
