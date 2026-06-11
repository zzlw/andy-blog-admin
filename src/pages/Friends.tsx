import { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Card, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { createFriend, deleteFriend, getFriends, updateFriend } from '@/apis/friend'
import { UploadImage } from '@/components/UploadImage'
import type { Friend } from '@/types'
import { resolveStatic } from '@/config'

export const Friends = () => {
  const [list, setList] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Friend | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setList(await getFriends())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = (friend: Friend | null) => {
    setEditing(friend)
    form.setFieldsValue(friend ?? { name: '', link: '', avatar: '' })
    setModalOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateFriend(editing.id, values)
    } else {
      await createFriend(values)
    }
    message.success(editing ? '更新友链成功' : '创建友链成功')
    setModalOpen(false)
    load()
  }

  return (
    <Card
      title="友链管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
          新增友链
        </Button>
      }
    >
      <Table<Friend>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          {
            title: '头像',
            dataIndex: 'avatar',
            width: 80,
            render: (avatar: string) => <Avatar src={resolveStatic(avatar) || undefined} />,
          },
          { title: '名称', dataIndex: 'name', width: 200 },
          {
            title: '链接',
            dataIndex: 'link',
            render: (link: string) => (
              <a href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
            ),
          },
          {
            title: '操作',
            width: 160,
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openModal(record)}>
                  编辑
                </Button>
                <Popconfirm
                  title="删除后不可恢复，确认删除？"
                  onConfirm={async () => {
                    await deleteFriend(record.id)
                    message.success('删除友链成功')
                    load()
                  }}
                >
                  <Button size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title={editing ? '编辑友链' : '新增友链'}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入友链名称' }]}>
            <Input maxLength={64} placeholder="站点名称" />
          </Form.Item>
          <Form.Item
            name="link"
            label="链接"
            rules={[
              { required: true, message: '请输入链接' },
              { type: 'url', message: '请输入合法 URL' },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item name="avatar" label="头像">
            <UploadImage width={96} height={96} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
