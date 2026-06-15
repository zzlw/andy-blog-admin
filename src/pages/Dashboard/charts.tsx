/**
 * 看板专用的零依赖轻量图表（CSS/SVG 实现），避免引入与 React 19 兼容性存疑的重型图表库。
 */
import { Empty, Tooltip } from 'antd'

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
