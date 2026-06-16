/**
 * 访客分析：基于自建埋点（后端 MongoDB 聚合 + IP 归属地解析）的多维洞察。
 * - 每日 PV/UV 趋势
 * - 访客地区 Top（精确到区县/运营商）、国家分布、热门页面
 * - 最近访客明细（仅展示归属地，不含原始 IP）
 */
import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Segmented,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tooltip,
  Typography,
} from 'antd'
import { EnvironmentOutlined, GlobalOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getVisitorInsights,
  getVisitorStats,
  type DimensionStat,
  type RecentVisitor,
  type VisitorInsights,
  type VisitorRange,
  type VisitorStats,
} from '@/apis/analytics'
import { VisitorChart } from '@/pages/Dashboard/charts'

const { Text } = Typography

const RANGE_OPTIONS: { label: string; value: VisitorRange }[] = [
  { label: '最近一周', value: '7d' },
  { label: '最近一月', value: '30d' },
  { label: '最近三月', value: '90d' },
  { label: '最近一年', value: '365d' },
]

/** 两位国家码转 emoji 国旗（区域指示符号） */
const flagOf = (code: string) =>
  code && /^[a-zA-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : '🌐'

const formatNumber = (value: number) => value.toLocaleString('en-US')

/** 横向排行条：标签 + 占比条 + PV/UV */
const RankList = ({
  data,
  emptyText = '暂无数据',
  renderLabel,
}: {
  data: DimensionStat[]
  emptyText?: string
  renderLabel?: (key: string) => React.ReactNode
}) => {
  if (!data.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
  }
  const max = Math.max(1, ...data.map((d) => d.pv))
  return (
    <Space direction="vertical" size={10} style={{ width: '100%' }}>
      {data.map((d, i) => (
        <div key={d.key}>
          <Flex justify="space-between" align="center" gap="small" style={{ marginBottom: 4 }}>
            <Text style={{ minWidth: 0, flex: 1 }} ellipsis={{ tooltip: d.key }}>
              <Text type="secondary" style={{ marginRight: 6 }}>
                {i + 1}.
              </Text>
              {renderLabel ? renderLabel(d.key) : d.key}
            </Text>
            <Text style={{ whiteSpace: 'nowrap', fontSize: 12, color: '#8c8c8c' }}>
              PV {formatNumber(d.pv)} · UV {formatNumber(d.uv)}
            </Text>
          </Flex>
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(d.pv / max) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1677ff 0%, #69b1ff 100%)',
                borderRadius: 3,
                transition: 'width .4s ease',
              }}
            />
          </div>
        </div>
      ))}
    </Space>
  )
}

export const Analytics = () => {
  const [range, setRange] = useState<VisitorRange>('30d')
  const [stats, setStats] = useState<VisitorStats | null>(null)
  const [insights, setInsights] = useState<VisitorInsights | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (target: VisitorRange) => {
      setLoading(true)
      try {
        const [s, i] = await Promise.all([getVisitorStats(target), getVisitorInsights(target)])
        setStats(s)
        setInsights(i)
      } catch {
        setStats(null)
        setInsights(null)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    load(range)
  }, [load, range])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title="访客分析"
        extra={
          <Space>
            <Segmented
              size="small"
              value={range}
              onChange={(v) => setRange(v as VisitorRange)}
              options={RANGE_OPTIONS}
            />
            <Tooltip title="刷新">
              <Button size="small" icon={<ReloadOutlined />} loading={loading} onClick={() => load(range)} />
            </Tooltip>
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic title="浏览量 PV" value={insights?.totals.pv ?? 0} loading={loading} />
          </Col>
          <Col span={12}>
            <Statistic title="独立访客 UV" value={insights?.totals.uv ?? 0} loading={loading} />
          </Col>
        </Row>
        <VisitorChart
          stats={stats}
          loading={loading}
          range={range}
          onRangeChange={setRange}
          height={260}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                访客地区 Top
              </Space>
            }
            style={{ height: '100%' }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <RankList data={insights?.topLocations ?? []} emptyText="暂无地区数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <GlobalOutlined />
                国家 / 地区分布
              </Space>
            }
            style={{ height: '100%' }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <RankList
                data={insights?.topCountries ?? []}
                emptyText="暂无国家数据"
                renderLabel={(key) => {
                  const item = insights?.recent.find((r) => r.country === key)
                  return (
                    <>
                      <span style={{ marginRight: 6 }}>{flagOf(item?.country_code ?? '')}</span>
                      {key}
                    </>
                  )
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="热门页面 Top">
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <RankList
            data={insights?.topPages ?? []}
            emptyText="暂无页面数据"
            renderLabel={(key) => (
              <Text code style={{ fontSize: 12 }}>
                {key}
              </Text>
            )}
          />
        )}
      </Card>

      <Card title="最近访客">
        <Table<RecentVisitor>
          rowKey={(_, index) => String(index)}
          size="small"
          loading={loading}
          dataSource={insights?.recent ?? []}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 720 }}
          columns={[
            {
              title: '时间',
              dataIndex: 'time',
              width: 170,
              render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
              title: '归属地',
              dataIndex: 'location',
              render: (value: string, record) => (
                <Space size={4}>
                  <span>{flagOf(record.country_code)}</span>
                  <Text>{value || '未知'}</Text>
                </Space>
              ),
            },
            {
              title: '运营商',
              dataIndex: 'isp',
              width: 180,
              ellipsis: true,
              render: (value: string) => value || <Text type="secondary">—</Text>,
            },
            {
              title: '页面',
              dataIndex: 'path',
              width: 220,
              ellipsis: true,
              render: (value: string) =>
                value ? (
                  <Text code style={{ fontSize: 12 }}>
                    {value}
                  </Text>
                ) : (
                  <Text type="secondary">—</Text>
                ),
            },
          ]}
        />
      </Card>
    </Space>
  )
}
