/**
 * 超级看板数据聚合：并发拉取各资源的列表/统计，在前端汇总为看板所需的派生指标。
 * 后端暂无统一的 stats 接口，故此处复用既有资源接口聚合（个人博客数据量小，足够）。
 */
import { getArticles } from './article'
import { getCategories } from './category'
import { getTags } from './tag'
import { getAuthors } from './author'
import { getFriends } from './friend'
import { getMessages } from './message'
import { getChatSessions } from './ai-agent'
import { isAiServiceEnabled } from '@/services/ai-http'
import type { Article, Category, ChatSession, Message } from '@/types'

/** 聚合用的文章抓取上限（个人博客量级，单次足够覆盖全量用于派生统计） */
const ARTICLE_FETCH_LIMIT = 1000

export interface DashboardData {
  /** 抓取到的文章明细（用于趋势/分布/排行等派生计算，最多 ARTICLE_FETCH_LIMIT 条） */
  articles: Article[]
  /** 文章总数（来自分页 total，不受抓取上限影响） */
  totalArticles: number
  categories: Category[]
  tagCount: number
  authorCount: number
  friendCount: number
  /** 最近留言（用于列表展示） */
  messages: Message[]
  /** 留言总数（来自分页 total） */
  totalMessages: number
  /** 最近 AI 会话（未启用 AI 服务时为空数组） */
  aiSessions: ChatSession[]
  aiEnabled: boolean
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const aiEnabled = isAiServiceEnabled()

  const [articleRes, categories, tags, authors, friends, messageRes, aiSessions] = await Promise.all([
    getArticles({ page: 1, page_size: ARTICLE_FETCH_LIMIT }),
    getCategories(),
    getTags(),
    getAuthors(),
    getFriends(),
    getMessages(1, 8),
    aiEnabled
      ? getChatSessions({ page: 1, page_size: 8, sort_field: 'last_active', sort_order: 'desc' }).catch(
          () => [] as ChatSession[],
        )
      : Promise.resolve([] as ChatSession[]),
  ])

  return {
    articles: articleRes.data,
    totalArticles: articleRes.pagination.total,
    categories,
    tagCount: tags.length,
    authorCount: authors.length,
    friendCount: friends.length,
    messages: messageRes.data,
    totalMessages: messageRes.pagination.total,
    aiSessions,
    aiEnabled,
  }
}
