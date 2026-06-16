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

/** 维度聚合项（地区 / 国家 / 页面） */
export interface DimensionStat {
  key: string
  pv: number
  uv: number
}

/** 最近访客明细（后台管理可见，含 IP/设备） */
export interface RecentVisitor {
  time: string
  ip: string
  location: string
  country: string
  country_code: string
  isp: string
  browser: string
  os: string
  device: string
  path: string
}

export interface VisitorInsights {
  range: VisitorRange
  totals: { pv: number; uv: number }
  topLocations: DimensionStat[]
  topCountries: DimensionStat[]
  topPages: DimensionStat[]
  recent: RecentVisitor[]
}

export const getVisitorInsights = (range: VisitorRange) =>
  http
    .get<VisitorInsights>('/api/analytics/insights', { range })
    .then((res) => res.result)
