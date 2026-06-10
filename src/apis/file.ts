import http from '@/services/http'

/** 上传文件到 S3 兼容对象存储，返回 CDN URL 列表 */
export const uploadFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const res = (await http.raw.post('/api/files', formData)) as any
  return res.result.urls as string[]
}

export const uploadFile = async (file: File): Promise<string> => {
  const [url] = await uploadFiles([file])
  return url
}
