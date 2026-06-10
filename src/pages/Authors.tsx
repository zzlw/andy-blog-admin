import { useCallback, useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { KeyOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import {
  createAuthor,
  deleteAuthor,
  getAuthors,
  resetAuthorPassword,
  updateAuthor,
} from '@/apis/author'
import { useProfile } from '@/contexts/profile'
import { AuthorRole, type Author } from '@/types'

const ROLE_OPTIONS = [
  { label: '作者', value: AuthorRole.Author },
  { label: '管理员', value: AuthorRole.Admin },
  { label: '超级管理员', value: AuthorRole.SuperAdmin },
]

const roleTag = (role: AuthorRole) => {
  switch (role) {
    case AuthorRole.SuperAdmin:
      return <Tag color="red">超级管理员</Tag>
    case AuthorRole.Admin:
      return <Tag color="blue">管理员</Tag>
    default:
      return <Tag>作者</Tag>
  }
}

export const Authors = () => {
  const { profile, isSuperAdmin } = useProfile()
  const [list, setList] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Author | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState<Author | null>(null)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setList(await getAuthors())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openModal = (author: Author | null) => {
    setEditing(author)
    form.setFieldsValue(
      author ?? { name: '', password: '', email: '', description: '', role: AuthorRole.Author },
    )
    setModalOpen(true)
  }

  const submit = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateAuthor(editing.id, {
        email: values.email,
        description: values.description,
        role: values.role,
      })
    } else {
      await createAuthor(values)
    }
    message.success(editing ? '更新作者成功' : '创建作者成功')
    setModalOpen(false)
    load()
  }

  const submitPassword = async () => {
    const { password } = await passwordForm.validateFields()
    await resetAuthorPassword(passwordTarget!.id, password)
    message.success('重置密码成功')
    setPasswordTarget(null)
    passwordForm.resetFields()
  }

  return (
    <Card
      title="作者管理"
      extra={
        isSuperAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
            新增作者
          </Button>
        )
      }
    >
      <Table<Author>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={false}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          {
            title: '作者',
            width: 200,
            render: (_, record) => (
              <Space>
                <Avatar src={record.avatar || undefined} icon={<UserOutlined />} />
                {record.name}
              </Space>
            ),
          },
          { title: '邮箱', dataIndex: 'email', width: 220 },
          { title: '简介', dataIndex: 'description' },
          {
            title: '角色',
            dataIndex: 'role',
            width: 130,
            render: (role: AuthorRole) => roleTag(role),
          },
          {
            title: '操作',
            width: 240,
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openModal(record)}>
                  编辑
                </Button>
                <Button
                  size="small"
                  icon={<KeyOutlined />}
                  disabled={!isSuperAdmin}
                  onClick={() => setPasswordTarget(record)}
                >
                  重置密码
                </Button>
                <Popconfirm
                  title="删除后不可恢复，确认删除？"
                  onConfirm={async () => {
                    await deleteAuthor(record.id)
                    message.success('删除作者成功')
                    load()
                  }}
                >
                  <Button size="small" danger disabled={!isSuperAdmin || record.id === profile?.id}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? '编辑作者' : '新增作者'}
        open={modalOpen}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <>
              <Form.Item
                name="name"
                label="用户名"
                rules={[{ required: true, min: 2, max: 32, message: '用户名长度需 2~32 位' }]}
              >
                <Input placeholder="登录用户名" autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label="初始密码"
                rules={[
                  {
                    required: true,
                    pattern: /^(?=.*[A-Za-z])(?=.*\d)\S{6,32}$/,
                    message: '密码需 6~32 位且同时包含字母和数字',
                  },
                ]}
              >
                <Input.Password placeholder="初始密码" autoComplete="new-password" />
              </Form.Item>
            </>
          )}
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="联系邮箱" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea maxLength={255} rows={3} placeholder="作者简介" />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select options={ROLE_OPTIONS} disabled={!isSuperAdmin} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`重置密码 - ${passwordTarget?.name ?? ''}`}
        open={Boolean(passwordTarget)}
        onOk={submitPassword}
        onCancel={() => setPasswordTarget(null)}
        destroyOnHidden
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              {
                required: true,
                pattern: /^(?=.*[A-Za-z])(?=.*\d)\S{6,32}$/,
                message: '密码需 6~32 位且同时包含字母和数字',
              },
            ]}
          >
            <Input.Password placeholder="新密码" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
