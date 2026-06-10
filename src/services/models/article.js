import {
  get,
  post,
  put,
  _delete
} from '@/services/plugins/axios'
import { toCompat } from '@/services/utils/compat'

// 表单（驼峰）→ 新 API DTO（下划线）
function toArticlePayload(form) {
  return {
    title: form.title,
    content: form.content,
    description: form.description,
    cover: form.cover || undefined,
    created_date: form.createdDate ? new Date(form.createdDate).toISOString() : undefined,
    category_id: form.categoryId || undefined,
    tag_ids: form.tags,
    author_ids: form.authors,
    public: form.public,
    status: form.status,
    star: form.star
  }
}

class Article {
  // 创建文章
  createArticle(article) {
    return toCompat(post('api/articles', toArticlePayload(article)))
  }

  // 获取所有文章（视图侧 page 从 0 开始；筛选值 0 表示全部，需省略）
  async getArticles(params = {}) {
    const query = { page: (params.page || 0) + 1 }
    if (params.categoryId) query.category_id = params.categoryId
    if (params.authorId) query.author_id = params.authorId
    if (params.tagId) query.tag_id = params.tagId
    if (params.publicId) query.public = params.publicId
    if (params.statusId) query.status = params.statusId
    if (params.starId) query.star = params.starId
    if (params.search) query.keyword = params.search

    const res = await get('api/articles', query)
    const { data, pagination } = res.result
    // 视图直接访问 article.category.id，无分类时兜底
    const articles = data.map(v => ({
      ...v,
      category: v.category || { id: 0, name: '未分类' }
    }))
    return { articles, total: pagination.total }
  }

  // 删除某篇文章
  deleteArticle(id) {
    return toCompat(_delete(`api/articles/${id}`))
  }

  // 设为公开 或 私密
  updateArticlePublic(id, params) {
    return toCompat(put(`api/articles/${id}`, { public: params.publicId }))
  }

  // 设为精选
  updateArticleStar(id, params) {
    return toCompat(put(`api/articles/${id}`, { star: params.starId }))
  }

  // 获取该文章的所有评论
  async getComments(id) {
    const res = await get('api/comments', { article_id: id })
    // 字段兼容：视图使用 created_date 展示评论时间
    return res.result.map(v => ({ ...v, created_date: v.created_at }))
  }

  // 删除某条评论
  deleteComment(id) {
    return toCompat(_delete(`api/comments/${id}`))
  }

  // 获取某篇文章的内容
  async getContent(id) {
    const res = await get(`api/articles/${id}`)
    return res.result
  }

  // 更新某篇文章
  updateArticle(article) {
    return toCompat(put(`api/articles/${article.id}`, toArticlePayload(article)))
  }
}

export default new Article()
