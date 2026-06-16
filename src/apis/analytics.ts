import http from '@/services/http'

export type VisitorRange = '7d' | '30d' | '90d' | '365d'

export interface VisitorPoint {
  date: string
  pv: number
  uv: number
}

export interface VisitorStats {
  /** 自建统计恒为 true；保留字段以兼容图表组件 */
  configured: boolean
  range: VisitorRange
  series: VisitorPoint[]
  totals: { pv: number; uv: number }
}

export const getVisitorStats = (range: VisitorRange) =>
  http
    .get<VisitorStats>('/api/analytics/visitors', { range })
    .then((res) => res.result)
