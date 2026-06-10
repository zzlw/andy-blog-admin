import {
  get,
  post,
  put,
  _delete
} from '@/services/plugins/axios'
import { toCompat } from '@/services/utils/compat'

class Tag {
  createTag(tag) {
    return toCompat(post('api/tags', tag))
  }

  // 获取所有标签
  async getTags() {
    const res = await get('api/tags')
    return res.result
  }

  // 更新标签
  updateTag(id, tag) {
    return toCompat(put(`api/tags/${id}`, tag))
  }

  // 删除标签
  deleteTag(id) {
    return toCompat(_delete(`api/tags/${id}`))
  }
}

export default new Tag()
