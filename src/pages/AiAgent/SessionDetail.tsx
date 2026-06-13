import { useEffect, useState } from 'react'
import { Avatar, Descriptions, Divider, Empty, List, Skeleton, Statistic, Tag, Typography } from 'antd'
import { RobotOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'github-markdown-css/github-markdown-light.css'
import { getChatMessages } from '@/apis/ai-agent'
import { markdownToHtml } from '@/utils/markdown'
import type { ChatMessage, ChatSession } from '@/types'

const fmtTime = (sec: number) => dayjs(sec * 1000).format('YYYY-MM-DD HH:mm:ss')

const roleMeta = (role: ChatMessage['role']) => {
  switch (role) {
    case 'user':
      return { label: '用户', icon: <UserOutlined />, color: 'orange' }
    case 'assistant':
      return { label: '助手', icon: <RobotOutlined />, color: '#1677ff' }
    default:
      return { label: role, icon: <ToolOutlined />, color: '#8c8c8c' }
  }
}

export interface SessionDetailProps {
  session: ChatSession
}

export const SessionDetail = ({ session }: SessionDetailProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getChatMessages(session.session_id)
      .then((data) => {
        if (alive) setMessages(data)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [session.session_id])

  return (
    <div>
      <Descriptions
        column={1}
        size="small"
        items={[
          {
            key: 'id',
            label: 'Session ID',
            children: <Typography.Text copyable>{session.session_id}</Typography.Text>,
          },
          { key: 'last', label: '最后对话', children: fmtTime(session.last_active) },
          {
            key: 'user',
            label: '用户',
            children: session.author_name ? (
              <Typography.Text strong>{session.author_name}</Typography.Text>
            ) : (
              <Tag>匿名访客</Tag>
            ),
          },
          {
            key: 'email',
            label: '邮箱',
            children: session.author_email ? (
              <Typography.Text copyable>{session.author_email}</Typography.Text>
            ) : (
              <Typography.Text type="secondary">无邮箱</Typography.Text>
            ),
          },
        ]}
      />
      <Divider />
      <Descriptions column={4} size="small">
        <Descriptions.Item>
          <Statistic title="消息数量" value={session.message_count} />
        </Descriptions.Item>
        <Descriptions.Item>
          <Statistic title="总用 Token" value={session.total_tokens} />
        </Descriptions.Item>
        <Descriptions.Item>
          <Statistic title="输入 Token" value={session.input_tokens} />
        </Descriptions.Item>
        <Descriptions.Item>
          <Statistic title="输出 Token" value={session.output_tokens} />
        </Descriptions.Item>
      </Descriptions>
      <Divider>对话记录</Divider>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : messages.length === 0 ? (
        <Empty description="暂无对话记录" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={messages}
          renderItem={(msg) => {
            const meta = roleMeta(msg.role)
            return (
              <List.Item
                key={msg.id}
                actions={
                  msg.role === 'user'
                    ? undefined
                    : [
                        <Typography.Text key="model" type="secondary">
                          {msg.model || '-'}
                        </Typography.Text>,
                        <Typography.Text key="in" type="secondary">
                          Input {msg.input_tokens}
                        </Typography.Text>,
                        <Typography.Text key="out" type="secondary">
                          Output {msg.output_tokens}
                        </Typography.Text>,
                      ]
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ background: meta.color }} icon={meta.icon} />
                  }
                  title={meta.label}
                  description={fmtTime(msg.created_at)}
                />
                {msg.tool_calls ? (
                  <Typography.Paragraph>
                    <Typography.Text type="secondary">工具调用：</Typography.Text>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                      {msg.tool_calls}
                    </pre>
                  </Typography.Paragraph>
                ) : msg.role === 'assistant' && msg.content ? (
                  <div
                    className="markdown-body"
                    style={{ background: 'transparent' }}
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}
                  />
                ) : (
                  <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {msg.content || '-'}
                  </Typography.Paragraph>
                )}
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )
}
