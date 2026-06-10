import http from '@/services/http'
import type { Article, PaginateResult } from '@/types'

export interface ArticleListQuery {
  page?: number
  page_size?: number
  category_id?: number
  tag_id?: number
  author_id?: number
  keyword?: string
  public?: number
  status?: number
  star?: number
}

export interface ArticlePayload {
  title: string
  content: string
  description?: string
  cover?: string
  created_date?: string
  category_id?: number
  tag_ids?: number[]
  author_ids?: number[]
  public?: number
  status?: number
  star?: number
}

export const getArticles = (query: ArticleListQuery) =>
  http.get<PaginateResult<Article>>('/api/articles', query).then((res) => res.result)

export const getArticle = (id: number) =>
  http.get<Article>(`/api/articles/${id}`).then((res) => res.result)

export const createArticle = (data: ArticlePayload) => http.post<Article>('/api/articles', data)

export const updateArticle = (id: number, data: Partial<ArticlePayload>) =>
  http.put<Article>(`/api/articles/${id}`, data)

export const deleteArticle = (id: number) => http.delete(`/api/articles/${id}`)
