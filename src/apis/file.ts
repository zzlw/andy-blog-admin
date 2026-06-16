import http from '@/services/http'

/** 上传图片到 S3 兼容对象存储（单文件 ≤ 2MB），返回相对路径列表 */
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

/** 上传后的附件元信息 */
export interface UploadedAttachment {
  url: string
  name: string
  size: number
}

/** 上传文章附件（任意类型，单文件 ≤ 20MB），返回相对路径 + 原始文件名/大小 */
export const uploadAttachments = async (files: File[]): Promise<UploadedAttachment[]> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const res = (await http.raw.post('/api/files/attachment', formData)) as any
  return res.result.files as UploadedAttachment[]
}
