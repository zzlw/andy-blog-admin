/**
 * 超级看板数据聚合：并发拉取各资源的列表/统计，在前端汇总为看板所需的派生指标。
 * 后端暂无统一的 stats 接口，故此处复用既有资源接口聚合（个人博客数据量小，足够）。
 */
import { getArticles } from './article'
import type { ArticleListQuery } from './article'
import { getCategories } from './category'
import { getTags } from './tag'
import { getAuthors } from './author'
import { getFriends } from './friend'
import { getMessages } from './message'
import { getChatSessions } from './ai-agent'
import { isAiServiceEnabled } from '@/services/ai-http'
import type { Article, Category, ChatSession, Message } from '@/types'

/** 后端单页上限（见 koa MAX_PAGE_SIZE），超过会被校验拒绝（400） */
const MAX_PAGE_SIZE = 100

/** 按后端单页上限翻页拉取全量文章，用于看板派生统计（个人博客量级，请求数极少） */
const fetchAllArticles = async (
  query: Omit<ArticleListQuery, 'page' | 'page_size'> = {},
): Promise<{ articles: Article[]; total: number }> => {
  const first = await getArticles({ ...query, page: 1, page_size: MAX_PAGE_SIZE })
  const articles = [...first.data]
  const { total, total_page } = first.pagination

  if (total_page > 1) {
    const rest = await Promise.all(
      Array.from({ length: total_page - 1 }, (_, i) =>
        getArticles({ ...query, page: i + 2, page_size: MAX_PAGE_SIZE }),
      ),
    )
    for (const res of rest) articles.push(...res.data)
  }

  return { articles, total }
}

export interface DashboardData {
  /** 抓取到的全量文章明细（用于趋势/分布/排行等派生计算） */
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

  const [articleAll, categories, tags, authors, friends, messageRes, aiSessions] = await Promise.all([
    fetchAllArticles(),
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
    articles: articleAll.articles,
    totalArticles: articleAll.total,
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
