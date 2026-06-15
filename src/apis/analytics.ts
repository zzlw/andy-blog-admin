import http from '@/services/http'

export type VisitorRange = '7d' | '30d' | '90d' | '365d'

export interface VisitorPoint {
  date: string
  pv: number
  uv: number
}

export interface VisitorStats {
  /** 后端是否已正确配置 GA4；false 时前端展示配置引导 */
  configured: boolean
  range: VisitorRange
  series: VisitorPoint[]
  totals: { pv: number; uv: number }
}

export const getVisitorStats = (range: VisitorRange) =>
  http
    .get<VisitorStats>('/api/analytics/visitors', { range })
    .then((res) => res.result)
