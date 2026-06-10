import http from '@/services/http'
import type { Friend } from '@/types'

export type FriendPayload = Pick<Friend, 'name' | 'link'> & Partial<Pick<Friend, 'avatar'>>

export const getFriends = () => http.get<Friend[]>('/api/friends').then((res) => res.result)

export const createFriend = (data: FriendPayload) => http.post('/api/friends', data)

export const updateFriend = (id: number, data: FriendPayload) =>
  http.put(`/api/friends/${id}`, data)

export const deleteFriend = (id: number) => http.delete(`/api/friends/${id}`)
