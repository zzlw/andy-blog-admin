import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { createTag, deleteTag, getTags, updateTag } from '@/apis/tag'
import type { Tag } from '@/types'

export const Tags = () => {
  const [list, setList] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setList(await getTags())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = (tag: Tag | null) => {
    setEditing(tag)
    form.setFieldsValue(tag ?? { name: '' })
    setModalOpen(true)
  }

  const submit = async () => {
    const { name } = await form.validateFields()
    if (editing) {
      await updateTag(editing.id, name)
    } else {
      await createTag(name)
    }
    message.success(editing ? '更新标签成功' : '创建标签成功')
    setModalOpen(false)
    load()
  }

  return (
    <Card
      title="标签管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
          新增标签
        </Button>
      }
    >
      <Table<Tag>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name' },
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
                    await deleteTag(record.id)
                    message.success('删除标签成功')
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
        title={editing ? '编辑标签' : '新增标签'}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入标签名称' }]}>
            <Input maxLength={64} placeholder="标签名称" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
