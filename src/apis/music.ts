import http from '@/services/http'
import type { Song } from '@/types'

export interface SongPayload {
  name: string
  artist?: string
  url: string
  cover?: string
  sort?: number
}

/** 上传音频后返回的解析结果（歌手/曲名由后端从文件名推断） */
export interface UploadedAudio {
  url: string
  name: string
  artist: string
}

/** 歌单列表（按 sort 升序，全量返回） */
export const getMusic = () => http.get<Song[]>('/api/music').then((res) => res.result)

/** 上传单个音频文件（≤ 30MB），返回相对路径与解析出的歌手/曲名 */
export const uploadAudio = async (file: File): Promise<UploadedAudio> => {
  const formData = new FormData()
  formData.append('files', file)
  const res = (await http.raw.post('/api/music/upload', formData)) as any
  return (res.result.files as UploadedAudio[])[0]
}

export const createSong = (data: SongPayload) => http.post<Song>('/api/music', data)

/** 批量新增歌曲（批量上传完成后落库元数据） */
export const batchCreateSongs = (songs: SongPayload[]) =>
  http.post<Song[]>('/api/music/batch', { songs })

export const updateSong = (id: number, data: Partial<SongPayload>) =>
  http.put<Song>(`/api/music/${id}`, data)

export const deleteSong = (id: number) => http.delete(`/api/music/${id}`)
