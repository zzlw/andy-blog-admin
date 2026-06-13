import aiHttp from '@/services/ai-http'
import type { ChatMessage, ChatSession } from '@/types'

export type SessionSortField = 'last_active' | 'message_count' | 'total_tokens'
export type SessionSortOrder = 'asc' | 'desc'

export interface GetSessionsParams {
  author_name?: string
  author_email?: string
  user_id?: number
  page?: number
  page_size?: number
  sort_field?: SessionSortField
  sort_order?: SessionSortOrder
}

/** 获取对话会话列表（按 session_id 聚合，支持排序/筛选/分页） */
export const getChatSessions = (params: GetSessionsParams = {}) =>
  aiHttp.get<ChatSession[]>('/chat-sessions', params).then((res) => res.data)

/** 获取某会话的完整对话消息记录（按时间正序） */
export const getChatMessages = (sessionId: string) =>
  aiHttp.get<ChatMessage[]>(`/chat-sessions/${sessionId}`).then((res) => res.data)

/** 删除某会话下的全部对话记录 */
export const deleteChatMessages = (sessionId: string) =>
  aiHttp.delete(`/chat-sessions/${encodeURIComponent(sessionId)}`)
