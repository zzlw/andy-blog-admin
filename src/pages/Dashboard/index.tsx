/**
 * 超级看板：站点核心指标总览。
 * - 时段问候 Hero
 * - 核心指标卡（文章 / 浏览 / 点赞 / 留言）
 * - 近 12 个月发布趋势、分类内容分布图表
 * - 热门文章排行、最新留言、最新 AI 会话
 * - 内容概览与快捷操作
 * 数据由 apis/dashboard.ts 并发聚合，纯前端派生。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  List,
  Result,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  AppstoreOutlined,
  EyeOutlined,
  FileTextOutlined,
  LikeOutlined,
  LinkOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  StarOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getDashboardData, type DashboardData } from '@/apis/dashboard'
import { useProfile } from '@/contexts/profile'
import { ArticlePublic, ArticleStar, ArticleStatus, type Article } from '@/types'
import { BarChart, CHART_PALETTE, DonutChart } from './charts'

const { Title, Text, Paragraph } = Typography

const greet = (hour: number) => {
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

const formatNumber = (value: number) => value.toLocaleString('en-US')

export const Dashboard = () => {
  const navigate = useNavigate()
  const { profile } = useProfile()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      setData(await getDashboardData())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    if (!data) return null
    const { articles } = data

    const published = articles.filter((a) => a.status === ArticleStatus.Published).length
    const draft = articles.filter((a) => a.status === ArticleStatus.Draft).length
    const starred = articles.filter((a) => a.star === ArticleStar.Star).length
    const privateCount = articles.filter((a) => a.public === ArticlePublic.Private).length
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)
    const totalLikes = articles.reduce((sum, a) => sum + (a.like || 0), 0)

    // 近 12 个月发布趋势
    const months = Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, 'month'))
    const monthCount = new Map(months.map((m) => [m.format('YYYY-MM'), 0]))
    articles.forEach((a) => {
      const key = dayjs(a.created_at).format('YYYY-MM')
      if (monthCount.has(key)) monthCount.set(key, (monthCount.get(key) ?? 0) + 1)
    })
    const trend = months.map((m) => ({
      label: m.format('M月'),
      value: monthCount.get(m.format('YYYY-MM')) ?? 0,
    }))

    // 分类内容分布
    const catCount = new Map<number, number>()
    let uncategorized = 0
    articles.forEach((a) => {
      if (a.category_id == null) uncategorized += 1
      else catCount.set(a.category_id, (catCount.get(a.category_id) ?? 0) + 1)
    })
    const distribution = data.categories
      .map((c, i) => ({
        label: c.name,
        value: catCount.get(c.id) ?? 0,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
    if (uncategorized > 0) {
      distribution.push({ label: '未分类', value: uncategorized, color: '#bfbfbf' })
    }

    const topArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8)

    return {
      published,
      draft,
      starred,
      privateCount,
      totalViews,
      totalLikes,
      trend,
      distribution,
      topArticles,
    }
  }, [data])

  if (error) {
    return (
      <Result
        status="error"
        title="看板数据加载失败"
        subTitle="请检查网络或后端服务后重试。"
        extra={
          <Button type="primary" icon={<ReloadOutlined />} onClick={load}>
            重新加载
          </Button>
        }
      />
    )
  }

  const hour = dayjs().hour()

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 问候 Hero */}
      <Card
        styles={{ body: { padding: 24 } }}
        style={{
          background: 'linear-gradient(120deg, #1677ff 0%, #4096ff 50%, #36cfc9 100%)',
          border: 'none',
        }}
      >
        <Flex justify="space-between" align="center" wrap gap="middle">
          <div style={{ color: '#fff' }}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              {greet(hour)}，{profile?.name ?? '管理员'} 👋
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', margin: '8px 0 0' }}>
              今天是 {dayjs().format('YYYY 年 M 月 D 日 dddd')}，
              {data ? `站点已沉淀 ${formatNumber(data.totalArticles)} 篇文章，继续加油！` : '正在加载站点概览…'}
            </Paragraph>
          </div>
          <Space>
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate('/articles/new')}
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none' }}
            >
              写文章
            </Button>
            <Tooltip title="刷新数据">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={load}
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none' }}
              />
            </Tooltip>
          </Space>
        </Flex>
      </Card>

      {/* 核心指标卡 */}
      <Row gutter={[16, 16]}>
        <StatCard
          loading={loading}
          title="文章总数"
          value={data?.totalArticles ?? 0}
          icon={<FileTextOutlined />}
          color="#1677ff"
          suffix={stats ? `已发布 ${stats.published} · 草稿 ${stats.draft}` : undefined}
        />
        <StatCard
          loading={loading}
          title="总浏览量"
          value={stats?.totalViews ?? 0}
          icon={<EyeOutlined />}
          color="#13c2c2"
        />
        <StatCard
          loading={loading}
          title="总点赞数"
          value={stats?.totalLikes ?? 0}
          icon={<LikeOutlined />}
          color="#eb2f96"
        />
        <StatCard
          loading={loading}
          title="留言总数"
          value={data?.totalMessages ?? 0}
          icon={<MessageOutlined />}
          color="#fa8c16"
        />
      </Row>

      {/* 图表区 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="近 12 个月发布趋势">
            {loading || !stats ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <BarChart data={stats.trend} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="分类内容分布" style={{ height: '100%' }}>
            {loading || !stats ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <DonutChart data={stats.distribution} />
            )}
          </Card>
        </Col>
      </Row>

      {/* 排行 + 动态 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="热门文章 Top 8" extra={<Link to="/articles">查看全部</Link>}>
            <Table<Article>
              rowKey="id"
              size="small"
              loading={loading}
              dataSource={stats?.topArticles ?? []}
              pagination={false}
              columns={[
                {
                  title: '#',
                  width: 44,
                  render: (_, __, index) => (
                    <Tag color={index < 3 ? ['gold', 'cyan', 'blue'][index] : 'default'}>{index + 1}</Tag>
                  ),
                },
                {
                  title: '标题',
                  dataIndex: 'title',
                  ellipsis: true,
                  render: (title: string, record) => (
                    <Link to={`/articles/${record.id}/edit`}>{title}</Link>
                  ),
                },
                {
                  title: '浏览',
                  dataIndex: 'views',
                  width: 90,
                  align: 'right',
                  render: (views: number) => formatNumber(views || 0),
                },
                {
                  title: '点赞',
                  dataIndex: 'like',
                  width: 80,
                  align: 'right',
                  render: (like: number) => formatNumber(like || 0),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最新留言" extra={<Link to="/messages">查看全部</Link>}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : data && data.messages.length > 0 ? (
              <List
                size="small"
                dataSource={data.messages}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{item.nickname?.slice(0, 1).toUpperCase()}</Avatar>}
                      title={
                        <Flex justify="space-between" gap="small">
                          <Text strong ellipsis>
                            {item.nickname}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                            {dayjs(item.created_at).format('MM-DD HH:mm')}
                          </Text>
                        </Flex>
                      }
                      description={
                        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                          {item.content}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无留言" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 内容概览 + 快捷操作 (+ AI 会话) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={data?.aiEnabled ? 8 : 12}>
          <Card title="内容概览">
            <Row gutter={[16, 16]}>
              <OverviewItem icon={<AppstoreOutlined />} label="分类" value={data?.categories.length ?? 0} loading={loading} />
              <OverviewItem icon={<TagsOutlined />} label="标签" value={data?.tagCount ?? 0} loading={loading} />
              <OverviewItem icon={<StarOutlined />} label="精选文章" value={stats?.starred ?? 0} loading={loading} />
              <OverviewItem icon={<EyeOutlined />} label="私密文章" value={stats?.privateCount ?? 0} loading={loading} />
              <OverviewItem icon={<LinkOutlined />} label="友链" value={data?.friendCount ?? 0} loading={loading} />
              <OverviewItem icon={<TeamOutlined />} label="作者" value={data?.authorCount ?? 0} loading={loading} />
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={data?.aiEnabled ? 8 : 12}>
          <Card title="快捷操作" style={{ height: '100%' }}>
            <Space wrap size={[12, 12]}>
              <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/articles/new')}>
                写文章
              </Button>
              <Button icon={<FileTextOutlined />} onClick={() => navigate('/articles')}>
                文章管理
              </Button>
              <Button icon={<AppstoreOutlined />} onClick={() => navigate('/categories')}>
                分类管理
              </Button>
              <Button icon={<TagsOutlined />} onClick={() => navigate('/tags')}>
                标签管理
              </Button>
              <Button icon={<MessageOutlined />} onClick={() => navigate('/messages')}>
                留言管理
              </Button>
              <Button icon={<LinkOutlined />} onClick={() => navigate('/friends')}>
                友链管理
              </Button>
            </Space>
          </Card>
        </Col>
        {data?.aiEnabled && (
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <RobotOutlined />
                  最新 AI 会话
                </Space>
              }
              extra={<Link to="/ai-agent">查看全部</Link>}
              style={{ height: '100%' }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : data.aiSessions.length > 0 ? (
                <List
                  size="small"
                  dataSource={data.aiSessions.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Flex justify="space-between" gap="small">
                            <Text ellipsis>{item.author_name || '匿名访客'}</Text>
                            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                              {dayjs(item.last_active).format('MM-DD HH:mm')}
                            </Text>
                          </Flex>
                        }
                        description={
                          <Paragraph ellipsis={{ rows: 1 }} type="secondary" style={{ margin: 0 }}>
                            {item.last_user_message || '（无内容）'}
                          </Paragraph>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会话" />
              )}
            </Card>
          </Col>
        )}
      </Row>
    </Space>
  )
}

const StatCard = ({
  loading,
  title,
  value,
  icon,
  color,
  suffix,
}: {
  loading: boolean
  title: string
  value: number
  icon: ReactNode
  color: string
  suffix?: string
}) => (
  <Col xs={12} sm={12} md={6}>
    <Card>
      {loading ? (
        <Skeleton active paragraph={false} title={{ width: '60%' }} />
      ) : (
        <Flex align="center" gap="middle">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `${color}1a`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <Statistic title={title} value={value} valueStyle={{ fontSize: 24, fontWeight: 600 }} />
            {suffix && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {suffix}
              </Text>
            )}
          </div>
        </Flex>
      )}
    </Card>
  </Col>
)

const OverviewItem = ({
  icon,
  label,
  value,
  loading,
}: {
  icon: ReactNode
  label: string
  value: number
  loading: boolean
}) => (
  <Col span={12}>
    <Flex align="center" gap="small">
      <span style={{ color: '#1677ff', fontSize: 18 }}>{icon}</span>
      <Statistic
        title={label}
        value={value}
        loading={loading}
        valueStyle={{ fontSize: 18, fontWeight: 600 }}
      />
    </Flex>
  </Col>
)
