import {
  get,
  _delete
} from '@/services/plugins/axios'
import { toCompat } from '@/services/utils/compat'

class Message {
  // 获取所有留言（视图侧 page 从 0 开始）
  async getMessages(page = 0) {
    const res = await get('api/messages', { page: page + 1 })
    const { data, pagination } = res.result
    // 字段兼容：旧响应为 { collection, total }，且时间字段名为 createTime
    return {
      collection: data.map(v => ({ ...v, createTime: v.created_at })),
      total: pagination.total
    }
  }

  // 删除某条留言
  deleteMessage(id) {
    return toCompat(_delete(`api/messages/${id}`))
  }
}

export default new Message()
