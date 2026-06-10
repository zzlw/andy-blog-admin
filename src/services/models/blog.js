import {
  get,
  post,
  put,
  _delete
} from '@/services/plugins/axios'
import { toCompat } from '@/services/utils/compat'

class Blog {
  // 创建友链
  createFriend(friend) {
    return toCompat(post('api/friends', friend))
  }

  // 获取所有友链
  async getFriends() {
    const res = await get('api/friends')
    return res.result
  }

  // 更新友链
  updateFriend(id, friend) {
    return toCompat(put(`api/friends/${id}`, friend))
  }

  // 删除友链
  deleteFriend(id) {
    return toCompat(_delete(`api/friends/${id}`))
  }
}

export default new Blog()
