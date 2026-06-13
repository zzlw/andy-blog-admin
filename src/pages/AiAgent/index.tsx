/**
 * AI 对话管理：浏览前台 AI 助手的匿名/登录用户会话、查看完整对话记录、清理历史。
 * 数据源为 andy-blog-ai Worker 的后台接口（`${aiApiBase}/admin/chat-sessions`）。
 */
import { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Card, Divider, Drawer, Flex, Modal, Select, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  deleteChatMessages,
  getChatSessions,
  type GetSessionsParams,
  type SessionSortField,
  type SessionSortOrder,
} from '@/apis/ai-agent'
import { isAiServiceEnabled } from '@/services/ai-http'
import { useProfile } from '@/contexts/profile'
import type { ChatSession } from '@/types'
import { SessionTable } from './SessionTable'
import { SessionDetail } from './SessionDetail'

const PAGE_SIZE = 50
const DEFAULT_SORT_FIELD = '' as const

export const AiAgent = () => {
  const enabled = isAiServiceEnabled()
  const { isSuperAdmin } = useProfile()

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const [sortField, setSortField] = useState<SessionSortField | ''>(DEFAULT_SORT_FIELD)
  const [sortOrder, setSortOrder] = useState<SessionSortOrder>('desc')

  const [detailSession, setDetailSession] = useState<ChatSession | null>(null)

  const queryParams = useCallback(
    (targetPage: number): GetSessionsParams => ({
      page: targetPage,
      page_size: PAGE_SIZE,
      sort_field: sortField || undefined,
      sort_order: sortOrder,
    }),
    [sortField, sortOrder],
  )

  const fetchFirstPage = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const result = await getChatSessions(queryParams(1))
      setSessions(result)
      setPage(1)
      setHasMore(result.length >= PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }, [enabled, queryParams])

  const fetchNextPage = async () => {
    if (loading) return
    const nextPage = page + 1
    setLoading(true)
    try {
      const result = await getChatSessions(queryParams(nextPage))
      setSessions((prev) => [...prev, ...result])
      setPage(nextPage)
      setHasMore(result.length >= PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSortField(DEFAULT_SORT_FIELD)
    setSortOrder('desc')
  }

  const confirmDelete = (session: ChatSession) => {
    Modal.confirm({
      title: `确定要删除该会话下的 ${session.message_count} 条对话记录吗？`,
      content: '删除后不可恢复',
      centered: true,
      okButtonProps: { danger: true },
      onOk: () => deleteChatMessages(session.session_id).then(() => fetchFirstPage()),
    })
  }

  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage])

  if (!enabled) {
    return (
      <Card title="AI 对话管理">
        <Alert
          type="info"
          showIcon
          message="AI 服务未配置"
          description="未检测到 AI 服务地址（aiApiBase）。请在部署环境注入 AI_API_BASE 后重试。"
        />
      </Card>
    )
  }

  return (
    <Card title={`AI 对话管理（共 ${sessions.length} 个会话）`}>
      <Flex justify="space-between" gap="middle" wrap>
        <Space wrap>
          <Space.Compact>
            <Select
              style={{ width: 150 }}
              disabled={loading}
              value={sortField}
              onChange={setSortField}
              options={[
                { value: '', label: '默认排序' },
                { value: 'last_active', label: '最后对话时间' },
                { value: 'message_count', label: '对话消息总数' },
                { value: 'total_tokens', label: 'Token 总用量' },
              ]}
            />
            <Select
              style={{ width: 90 }}
              disabled={loading}
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: 'desc', label: '倒序' },
                { value: 'asc', label: '正序' },
              ]}
            />
          </Space.Compact>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={resetFilters}>
            重置刷新
          </Button>
        </Space>
      </Flex>
      <Divider />
      <SessionTable
        loading={loading}
        data={sessions}
        canDelete={isSuperAdmin}
        onDetail={setDetailSession}
        onDelete={confirmDelete}
        footer={
          <Flex justify="center">
            <Button
              loading={loading}
              disabled={!hasMore}
              icon={<PlusOutlined />}
              onClick={fetchNextPage}
            >
              {hasMore ? '加载更多' : '没有更多了'}
            </Button>
          </Flex>
        }
      />
      <Drawer
        size="large"
        title="对话详情"
        open={Boolean(detailSession)}
        onClose={() => setDetailSession(null)}
      >
        {detailSession && <SessionDetail key={detailSession.session_id} session={detailSession} />}
      </Drawer>
    </Card>
  )
}
