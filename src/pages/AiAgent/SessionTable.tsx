import type { ReactNode } from 'react'
import { Button, Popover, Space, Table, Tag, Tooltip, Typography } from 'antd'
import {
  CommentOutlined,
  DeleteOutlined,
  FieldNumberOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ChatSession } from '@/types'

const fmtTime = (sec: number) => dayjs(sec * 1000).format('YYYY-MM-DD HH:mm')
const fromNow = (sec: number) => {
  const diff = Date.now() - sec * 1000
  const min = Math.floor(diff / 60_000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day} 天前`
  return dayjs(sec * 1000).format('YYYY-MM-DD')
}

export interface SessionTableProps {
  loading: boolean
  data: ChatSession[]
  canDelete: boolean
  footer?: ReactNode
  onDetail(session: ChatSession): void
  onDelete(session: ChatSession): void
}

export const SessionTable = ({
  loading,
  data,
  canDelete,
  footer,
  onDetail,
  onDelete,
}: SessionTableProps) => (
  <Table<ChatSession>
    rowKey="session_id"
    loading={loading}
    dataSource={data}
    pagination={false}
    footer={() => footer}
    scroll={{ x: 'max-content' }}
    columns={[
      {
        title: '最后对话',
        dataIndex: 'last_active',
        width: 120,
        render: (_, s) => (
          <Tooltip title={fmtTime(s.last_active)}>{fromNow(s.last_active)}</Tooltip>
        ),
      },
      {
        title: '最后消息',
        dataIndex: 'last_user_message',
        ellipsis: { showTitle: false },
        render: (_, s) => (
          <Popover
            placement="bottomLeft"
            content={
              <Typography.Paragraph style={{ maxWidth: 360, marginBottom: 0 }}>
                {s.last_user_message || '-'}
              </Typography.Paragraph>
            }
          >
            <span>{s.last_user_message || '-'}</span>
          </Popover>
        ),
      },
      {
        title: '消息数',
        dataIndex: 'message_count',
        width: 90,
        render: (value: number) => <Typography.Text strong>{value}</Typography.Text>,
      },
      {
        title: 'Token 用量',
        dataIndex: 'total_tokens',
        width: 120,
        render: (_, s) => (
          <Popover
            title="Token 用量"
            placement="bottomLeft"
            content={
              <Space direction="vertical" size="small">
                <Typography.Text strong>总计：{s.total_tokens}</Typography.Text>
                <Typography.Text type="secondary">输入：{s.input_tokens}</Typography.Text>
                <Typography.Text type="secondary">输出：{s.output_tokens}</Typography.Text>
              </Space>
            }
          >
            <Typography.Text strong>{s.total_tokens}</Typography.Text>
          </Popover>
        ),
      },
      {
        title: '用户',
        dataIndex: 'author_name',
        width: 120,
        ellipsis: true,
        render: (_, s) => (
          <Popover
            title="用户身份"
            placement="bottomRight"
            content={
              <Space direction="vertical" size="small">
                <Typography.Text>
                  <FieldNumberOutlined /> {s.user_id ?? '非登录用户'}
                </Typography.Text>
                <Typography.Text>
                  <UserOutlined /> {s.author_name || '匿名访客'}
                </Typography.Text>
                <Typography.Text copyable={Boolean(s.author_email)}>
                  <MailOutlined /> {s.author_email || '无邮箱'}
                </Typography.Text>
              </Space>
            }
          >
            {s.author_name ? (
              <Typography.Text strong>{s.author_name}</Typography.Text>
            ) : (
              <Tag color="default">匿名访客</Tag>
            )}
          </Popover>
        ),
      },
      {
        title: '操作',
        dataIndex: 'session_id',
        width: 180,
        fixed: 'right',
        render: (_, s) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<CommentOutlined />}
              onClick={() => onDetail(s)}
            >
              对话记录
            </Button>
            <Button
              type="link"
              size="small"
              danger
              disabled={!canDelete}
              icon={<DeleteOutlined />}
              onClick={() => onDelete(s)}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ]}
  />
)
