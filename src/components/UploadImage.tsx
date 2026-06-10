import { useState } from 'react'
import { Upload, message } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { uploadFile } from '@/apis/file'

interface UploadImageProps {
  value?: string
  onChange?: (url: string) => void
  /** 展示宽高 */
  width?: number
  height?: number
}

/** 图片上传（七牛云），用于封面/头像，antd Form 受控接入 */
export const UploadImage = ({ value, onChange, width = 200, height = 120 }: UploadImageProps) => {
  const [uploading, setUploading] = useState(false)

  return (
    <Upload
      accept="image/*"
      showUploadList={false}
      customRequest={async ({ file, onSuccess, onError }) => {
        setUploading(true)
        try {
          const url = await uploadFile(file as File)
          onChange?.(url)
          onSuccess?.(url)
          message.success('上传成功')
        } catch (e) {
          onError?.(e as Error)
        } finally {
          setUploading(false)
        }
      }}
    >
      {value ? (
        <img
          src={value}
          alt="uploaded"
          style={{ width, height, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
        />
      ) : (
        <div
          style={{
            width,
            height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            border: '1px dashed #d9d9d9',
            borderRadius: 6,
            cursor: 'pointer',
            color: '#999',
            background: '#fafafa',
          }}
        >
          {uploading ? <LoadingOutlined /> : <PlusOutlined />}
          <span style={{ fontSize: 12 }}>{uploading ? '上传中...' : '点击上传'}</span>
        </div>
      )}
    </Upload>
  )
}
