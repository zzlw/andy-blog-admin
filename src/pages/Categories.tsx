import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/apis/category'
import { UploadImage } from '@/components/UploadImage'
import type { Category } from '@/types'

export const Categories = () => {
  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setList(await getCategories())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = (category: Category | null) => {
    setEditing(category)
    form.setFieldsValue(category ?? { name: '', description: '', cover: '' })
    setModalOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateCategory(editing.id, values)
    } else {
      await createCategory(values)
    }
    message.success(editing ? '更新分类成功' : '创建分类成功')
    setModalOpen(false)
    load()
  }

  return (
    <Card
      title="分类管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
          新增分类
        </Button>
      }
    >
      <Table<Category>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name', width: 200 },
          { title: '描述', dataIndex: 'description' },
          {
            title: '封面',
            dataIndex: 'cover',
            width: 140,
            render: (cover: string) =>
              cover ? <img src={cover} alt="" style={{ height: 40, borderRadius: 4 }} /> : '-',
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
                    await deleteCategory(record.id)
                    message.success('删除分类成功')
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
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input maxLength={64} placeholder="分类名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea maxLength={255} rows={3} placeholder="分类描述" />
          </Form.Item>
          <Form.Item name="cover" label="封面">
            <UploadImage />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
