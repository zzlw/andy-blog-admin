/** 与后端（NestJS）约定的数据结构 */

export interface Pagination {
  page: number
  page_size: number
  total: number
  total_page: number
}

export interface PaginateResult<T> {
  data: T[]
  pagination: Pagination
}

/** 作者权限等级 */
export enum AuthorRole {
  Author = 8,
  Admin = 16,
  SuperAdmin = 32,
}

export interface Author {
  id: number
  name: string
  avatar: string
  email: string
  description: string
  role: AuthorRole
}

export interface Category {
  id: number
  name: string
  description: string
  cover: string
}

export interface Tag {
  id: number
  name: string
}

export enum ArticlePublic {
  Public = 1,
  Private = 2,
}

export enum ArticleStatus {
  Published = 1,
  Draft = 2,
}

export enum ArticleStar {
  Normal = 1,
  Star = 2,
}

export interface Article {
  id: number
  title: string
  content?: string
  description: string
  cover: string
  created_date: string
  category_id: number | null
  tag_ids: number[]
  author_ids: number[]
  public: ArticlePublic
  status: ArticleStatus
  star: ArticleStar
  like: number
  views: number
  created_at: string
  updated_at: string
  // 列表/详情接口内联的关联实体
  category?: Category | null
  tags?: Tag[]
  authors?: Author[]
}

export interface Comment {
  id: number
  article_id: number
  parent_id: number
  nickname: string
  content: string
  like: number
  email: string
  website: string
  created_at: string
}

export interface Message {
  id: number
  nickname: string
  content: string
  created_at: string
}

export interface Friend {
  id: number
  name: string
  link: string
  avatar: string
}
