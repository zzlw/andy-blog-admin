import {
  get,
  post,
  put,
  _delete
} from '@/services/plugins/axios'
import { toCompat } from '@/services/utils/compat'

class Category {
  // 新增分类
  createCategory(category) {
    return toCompat(post('api/categories', category))
  }

  // 编辑分类
  updateCategory(id, category) {
    return toCompat(put(`api/categories/${id}`, category))
  }

  // 获取所有分类
  async getCategories() {
    const res = await get('api/categories')
    return res.result
  }

  // 删除某个分类
  deleteCategory(id) {
    return toCompat(_delete(`api/categories/${id}`))
  }
}

export default new Category()
