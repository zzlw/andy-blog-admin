import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from 'antd'
import { DeleteOutlined, PlusOutlined, SoundOutlined, UploadOutlined } from '@ant-design/icons'
import { resolveStatic } from '@/config'
import { useProfile } from '@/contexts/profile'
import { UploadImage } from '@/components/UploadImage'
import {
  batchCreateSongs,
  deleteSong,
  getMusic,
  updateSong,
  uploadAudio,
  type SongPayload,
} from '@/apis/music'
import type { Song } from '@/types'

interface EditFormValues {
  name: string
  artist: string
  cover: string
  sort: number
}

/** 批量上传行：每个选中的音频文件一行，上传完成后可编辑歌手/曲名 */
interface UploadRow {
  uid: string
  filename: string
  status: 'uploading' | 'done' | 'error'
  url: string
  name: string
  artist: string
}

export const Music = () => {
  const { isSuperAdmin } = useProfile()
  const [list, setList] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Song | null>(null)
  const [form] = Form.useForm<EditFormValues>()

  const [batchOpen, setBatchOpen] = useState(false)
  const [rows, setRows] = useState<UploadRow[]>([])
  const [saving, setSaving] = useState(false)

  const [previewSong, setPreviewSong] = useState<Song | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setList(await getMusic())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const preview = (song: Song) => {
    setPreviewSong(song)
    // 等 src 更新后再播放
    requestAnimationFrame(() => audioRef.current?.play().catch(() => {}))
  }

  const openEdit = (song: Song) => {
    setEditing(song)
    form.setFieldsValue({
      name: song.name,
      artist: song.artist,
      cover: song.cover,
      sort: song.sort,
    })
    setEditOpen(true)
  }

  const submitEdit = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateSong(editing.id, values)
      message.success('更新歌曲成功')
    }
    setEditOpen(false)
    load()
  }

  // 选中音频后立即逐个上传（低内存、带状态），上传结果填入可编辑行
  const handleSelect = async (file: File) => {
    const uid = `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 7)}`
    setRows((prev) => [
      ...prev,
      { uid, filename: file.name, status: 'uploading', url: '', name: file.name, artist: '' },
    ])
    try {
      const result = await uploadAudio(file)
      setRows((prev) =>
        prev.map((row) =>
          row.uid === uid
            ? { ...row, status: 'done', url: result.url, name: result.name, artist: result.artist }
            : row,
        ),
      )
    } catch {
      setRows((prev) =>
        prev.map((row) => (row.uid === uid ? { ...row, status: 'error' } : row)),
      )
    }
    return false
  }

  const patchRow = (uid: string, patch: Partial<UploadRow>) =>
    setRows((prev) => prev.map((row) => (row.uid === uid ? { ...row, ...patch } : row)))

  const saveBatch = async () => {
    const ready = rows.filter((row) => row.status === 'done' && row.url)
    if (!ready.length) {
      message.warning('没有可保存的歌曲')
      return
    }
    if (ready.some((row) => !row.name.trim())) {
      message.error('曲名不能为空')
      return
    }
    setSaving(true)
    try {
      const payload: SongPayload[] = ready.map((row) => ({
        name: row.name.trim(),
        artist: row.artist.trim(),
        url: row.url,
      }))
      await batchCreateSongs(payload)
      message.success(`成功新增 ${payload.length} 首`)
      setBatchOpen(false)
      setRows([])
      load()
    } finally {
      setSaving(false)
    }
  }

  const uploading = rows.some((row) => row.status === 'uploading')

  return (
    <Card
      title="音乐管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setBatchOpen(true)}>
          批量上传
        </Button>
      }
    >
      {previewSong && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            marginBottom: 16,
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
          }}
        >
          <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
            正在试听：{previewSong.artist ? `${previewSong.artist} - ` : ''}
            {previewSong.name}
          </span>
          <audio
            ref={audioRef}
            src={resolveStatic(previewSong.url)}
            controls
            style={{ flex: 1, height: 36 }}
          />
        </div>
      )}

      <Table<Song>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 首`, showSizeChanger: true }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: '排序', dataIndex: 'sort', width: 70 },
          {
            title: '封面',
            dataIndex: 'cover',
            width: 72,
            render: (cover: string) => (
              <Image
                src={resolveStatic(cover)}
                width={44}
                height={44}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                preview={false}
              />
            ),
          },
          { title: '曲名', dataIndex: 'name', ellipsis: true },
          {
            title: '歌手',
            dataIndex: 'artist',
            width: 160,
            ellipsis: true,
            render: (artist: string) => artist || <Tag>未知</Tag>,
          },
          {
            title: '操作',
            width: 220,
            render: (_, record) => (
              <Space>
                <Button
                  size="small"
                  icon={<SoundOutlined />}
                  onClick={() => preview(record)}
                >
                  试听
                </Button>
                <Button size="small" onClick={() => openEdit(record)}>
                  编辑
                </Button>
                <Popconfirm
                  title="确定删除这首歌曲？"
                  disabled={!isSuperAdmin}
                  onConfirm={async () => {
                    await deleteSong(record.id)
                    message.success('删除成功')
                    load()
                  }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} disabled={!isSuperAdmin}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="编辑歌曲"
        open={editOpen}
        onOk={submitEdit}
        onCancel={() => setEditOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="曲名" rules={[{ required: true, message: '请输入曲名' }]}>
            <Input placeholder="曲名" />
          </Form.Item>
          <Form.Item name="artist" label="歌手">
            <Input placeholder="歌手" />
          </Form.Item>
          <Form.Item name="sort" label="排序（越小越靠前）">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cover" label="封面">
            <UploadImage width={120} height={120} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="批量上传音乐"
        open={batchOpen}
        width={760}
        onCancel={() => {
          if (!saving) {
            setBatchOpen(false)
            setRows([])
          }
        }}
        onOk={saveBatch}
        okText={`保存全部（${rows.filter((r) => r.status === 'done').length}）`}
        okButtonProps={{ loading: saving, disabled: uploading || !rows.length }}
        cancelButtonProps={{ disabled: saving }}
        destroyOnHidden
      >
        <Upload.Dragger
          accept="audio/*,.mp3,.flac,.m4a,.wav,.ogg"
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            void handleSelect(file)
            return false
          }}
          style={{ marginBottom: 16 }}
        >
          <p className="ant-upload-drawer-icon" style={{ marginBottom: 8 }}>
            <UploadOutlined style={{ fontSize: 28, color: '#1677ff' }} />
          </p>
          <p>点击或拖拽音频文件到此处（支持多选，单文件 ≤ 30MB）</p>
          <p style={{ color: '#999', fontSize: 12 }}>
            将自动从「歌手 - 曲名.mp3」解析信息，保存前可修改
          </p>
        </Upload.Dragger>

        {rows.length > 0 && (
          <Table<UploadRow>
            rowKey="uid"
            size="small"
            dataSource={rows}
            pagination={false}
            scroll={{ y: 320 }}
            columns={[
              {
                title: '状态',
                dataIndex: 'status',
                width: 80,
                render: (status: UploadRow['status']) =>
                  status === 'uploading' ? (
                    <Tag color="processing">上传中</Tag>
                  ) : status === 'done' ? (
                    <Tag color="success">就绪</Tag>
                  ) : (
                    <Tag color="error">失败</Tag>
                  ),
              },
              {
                title: '歌手',
                dataIndex: 'artist',
                width: 180,
                render: (artist: string, record) => (
                  <Input
                    size="small"
                    value={artist}
                    placeholder="歌手"
                    onChange={(e) => patchRow(record.uid, { artist: e.target.value })}
                  />
                ),
              },
              {
                title: '曲名',
                dataIndex: 'name',
                render: (name: string, record) => (
                  <Input
                    size="small"
                    value={name}
                    placeholder="曲名"
                    onChange={(e) => patchRow(record.uid, { name: e.target.value })}
                  />
                ),
              },
            ]}
          />
        )}
      </Modal>
    </Card>
  )
}
