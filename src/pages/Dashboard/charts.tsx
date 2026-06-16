/**
 * 看板专用的零依赖轻量图表（CSS/SVG 实现），避免引入与 React 19 兼容性存疑的重型图表库。
 */
import { Empty, Flex, Segmented, Skeleton, Space, Tooltip } from 'antd'
import type { VisitorRange, VisitorStats } from '@/apis/analytics'

export interface BarDatum {
  label: string
  value: number
}

/** 调色板：用于分类分布等多色场景 */
export const CHART_PALETTE = [
  '#1677ff',
  '#13c2c2',
  '#52c41a',
  '#faad14',
  '#eb2f96',
  '#722ed1',
  '#fa541c',
  '#2f54eb',
  '#a0d911',
  '#fa8c16',
]

/** CSS 柱状图：用于「近 12 个月发布趋势」等时间序列 */
export const BarChart = ({
  data,
  height = 220,
  color = '#1677ff',
}: {
  data: BarDatum[]
  height?: number
  color?: string
}) => {
  const max = Math.max(1, ...data.map((d) => d.value))
  const plotHeight = height - 28

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: plotHeight }}>
        {data.map((d) => (
          <div
            key={d.label}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ fontSize: 12, color: '#8c8c8c', lineHeight: '16px', marginBottom: 4 }}>
              {d.value || ''}
            </div>
            <Tooltip title={`${d.label}：${d.value} 篇`}>
              <div
                style={{
                  width: '62%',
                  maxWidth: 28,
                  height: `${(d.value / max) * 100}%`,
                  minHeight: d.value > 0 ? 4 : 0,
                  background: `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height .4s ease',
                }}
              />
            </Tooltip>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#8c8c8c' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

const VISITOR_RANGE_OPTIONS: { label: string; value: VisitorRange }[] = [
  { label: '最近一周', value: '7d' },
  { label: '最近一月', value: '30d' },
  { label: '最近三月', value: '90d' },
  { label: '最近一年', value: '365d' },
]

const PV_COLOR = '#fa8c16'
const UV_COLOR = '#1677ff'

const VisitorLegend = ({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value?: number
}) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13, color: '#595959' }}>
    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, marginRight: 6 }} />
    {label}
    {value != null && (
      <strong style={{ marginLeft: 6, color: '#262626' }}>{value.toLocaleString('en-US')}</strong>
    )}
  </span>
)

/**
 * 访客统计：每日 PV（橙）/ UV（蓝）双色柱 + 时间范围切换。
 * 数据来自自托管 Umami（后端代理），未配置或暂无数据时降级为引导/空态。
 */
export const VisitorChart = ({
  stats,
  loading,
  range,
  onRangeChange,
  height = 240,
}: {
  stats: VisitorStats | null
  loading: boolean
  range: VisitorRange
  onRangeChange: (range: VisitorRange) => void
  height?: number
}) => {
  const series = stats?.series ?? []
  const hasData = series.some((d) => d.pv > 0 || d.uv > 0)
  const max = Math.max(1, ...series.map((d) => d.pv))
  const plotHeight = height - 28

  // 稀疏 x 轴标签：等距取点并确保包含末尾
  const labelStep = Math.max(1, Math.ceil(series.length / 6))
  const labelIndices: number[] = []
  for (let i = 0; i < series.length; i += labelStep) labelIndices.push(i)
  if (series.length && labelIndices[labelIndices.length - 1] !== series.length - 1) {
    labelIndices.push(series.length - 1)
  }

  return (
    <div>
      <Flex justify="space-between" align="center" wrap gap="small" style={{ marginBottom: 12 }}>
        <Space size={16}>
          <VisitorLegend color={PV_COLOR} label="浏览量 PV" value={stats?.totals.pv} />
          <VisitorLegend color={UV_COLOR} label="访客数 UV" value={stats?.totals.uv} />
        </Space>
        <Segmented
          size="small"
          value={range}
          onChange={(value) => onRangeChange(value as VisitorRange)}
          options={VISITOR_RANGE_OPTIONS}
        />
      </Flex>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !stats?.configured ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: '#8c8c8c' }}>
              尚未接入 Umami。请在后端配置 <code>UMAMI_API_URL</code>、<code>UMAMI_WEBSITE_ID</code>{' '}
              及读数账号后查看访客统计。
            </span>
          }
          style={{ padding: '32px 0' }}
        />
      ) : !hasData ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#8c8c8c' }}>暂无访客数据</span>}
          style={{ padding: '32px 0' }}
        />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: plotHeight }}>
            {series.map((d) => (
              <Tooltip
                key={d.date}
                title={
                  <div style={{ fontSize: 12 }}>
                    <div>{d.date}</div>
                    <div>浏览量 PV：{d.pv}</div>
                    <div>访客数 UV：{d.uv}</div>
                  </div>
                }
              >
                <div
                  style={{
                    flex: 1,
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '72%',
                      height: `${(d.pv / max) * 100}%`,
                      minHeight: d.pv > 0 ? 2 : 0,
                      background: `linear-gradient(180deg, ${PV_COLOR} 0%, ${PV_COLOR}99 100%)`,
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: '40%',
                      height: `${(d.uv / max) * 100}%`,
                      minHeight: d.uv > 0 ? 2 : 0,
                      background: `linear-gradient(180deg, ${UV_COLOR} 0%, ${UV_COLOR}cc 100%)`,
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                </div>
              </Tooltip>
            ))}
          </div>
          <div style={{ position: 'relative', height: 16, marginTop: 8 }}>
            {labelIndices.map((i) => {
              const pct = series.length > 1 ? (i / (series.length - 1)) * 100 : 0
              const isFirst = i === 0
              const isLast = i === series.length - 1
              return (
                <span
                  key={series[i].date}
                  style={{
                    position: 'absolute',
                    left: `${pct}%`,
                    transform: isFirst
                      ? 'none'
                      : isLast
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)',
                    fontSize: 11,
                    color: '#8c8c8c',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {series[i].date.slice(5)}
                </span>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export interface DonutDatum {
  label: string
  value: number
  color: string
}

/** CSS conic-gradient 环形图 + 图例：用于「分类内容分布」 */
export const DonutChart = ({
  data,
  centerLabel = '文章',
  size = 150,
}: {
  data: DonutDatum[]
  centerLabel?: string
  size?: number
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分布数据" />
  }

  let acc = 0
  const stops = data
    .map((d) => {
      const start = (acc / total) * 360
      acc += d.value
      const end = (acc / total) * 360
      return `${d.color} ${start}deg ${end}deg`
    })
    .join(', ')

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${stops})`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '24%',
            background: '#fff',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{total}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{centerLabel}</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: d.color,
                marginRight: 8,
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.label}
            </span>
            <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
              {d.value} · {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
