import { Navigate, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { isLoggedIn } from '@/services/token'

/** 鉴权路由守卫：未登录跳转登录页（带回跳地址） */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
