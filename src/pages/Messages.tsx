import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Popconfirm, Table, message } from 'antd'
import dayjs from 'dayjs'
import { deleteMessage, getMessages } from '@/apis/message'
import { useProfile } from '@/contexts/profile'
import type { Message } from '@/types'

const PAGE_SIZE = 10

export const Messages = () => {
  const [list, setList] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const { isSuperAdmin } = useProfile()

  const load = useCallback(async (current: number) => {
    setLoading(true)
    try {
      const { data, pagination } = await getMessages(current, PAGE_SIZE)
      setList(data)
      setTotal(pagination.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  return (
    <Card title="留言管理">
      <Table<Message>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showTotal: (t) => `共 ${t} 条`,
          onChange: setPage,
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '昵称', dataIndex: 'nickname', width: 160 },
          { title: '内容', dataIndex: 'content' },
          {
            title: '时间',
            dataIndex: 'created_at',
            width: 180,
            render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
          },
          {
            title: '操作',
            width: 100,
            render: (_, record) => (
              <Popconfirm
                title="删除后不可恢复，确认删除？"
                onConfirm={async () => {
                  await deleteMessage(record.id)
                  message.success('删除留言成功')
                  load(page)
                }}
              >
                <Button size="small" danger disabled={!isSuperAdmin}>
                  删除
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />
    </Card>
  )
}
