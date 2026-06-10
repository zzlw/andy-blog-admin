import { STORAGE_KEY } from '@/config'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export const setTokens = (tokens: TokenPair) => {
  localStorage.setItem(STORAGE_KEY.accessToken, tokens.access_token)
  localStorage.setItem(STORAGE_KEY.refreshToken, tokens.refresh_token)
}

export const getAccessToken = () => localStorage.getItem(STORAGE_KEY.accessToken)

export const getRefreshToken = () => localStorage.getItem(STORAGE_KEY.refreshToken)

export const removeTokens = () => {
  localStorage.removeItem(STORAGE_KEY.accessToken)
  localStorage.removeItem(STORAGE_KEY.refreshToken)
}

export const isLoggedIn = () => Boolean(getAccessToken())
