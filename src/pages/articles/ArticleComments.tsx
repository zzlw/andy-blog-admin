import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, List, Popconfirm, Space, Tag, message } from 'antd'
import { ArrowLeftOutlined, LikeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router'
import { deleteComment, getComments } from '@/apis/comment'
import { useProfile } from '@/contexts/profile'
import type { Comment } from '@/types'

export const ArticleComments = () => {
  const { id } = useParams()
  const articleId = Number(id)
  const navigate = useNavigate()
  const { isSuperAdmin } = useProfile()

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setComments(await getComments(articleId))
    } finally {
      setLoading(false)
    }
  }, [articleId])

  useEffect(() => {
    load()
  }, [load])

  /** parent_id → 父评论昵称（展示回复关系） */
  const nicknameMap = useMemo(
    () => new Map(comments.map((comment) => [comment.id, comment.nickname])),
    [comments],
  )

  return (
    <Card
      title={
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/articles')} />
          文章评论（#{articleId}）
        </Space>
      }
    >
      <List<Comment>
        loading={loading}
        dataSource={comments}
        locale={{ emptyText: '暂无评论' }}
        renderItem={(comment) => (
          <List.Item
            actions={[
              <Space key="like">
                <LikeOutlined />
                {comment.like}
              </Space>,
              <Popconfirm
                key="delete"
                title="删除后不可恢复，确认删除？"
                onConfirm={async () => {
                  await deleteComment(comment.id)
                  message.success('删除评论成功')
                  load()
                }}
              >
                <Button size="small" danger disabled={!isSuperAdmin}>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <strong>{comment.nickname}</strong>
                  {comment.parent_id !== 0 && (
                    <Tag color="blue">回复 {nicknameMap.get(comment.parent_id) ?? '已删除评论'}</Tag>
                  )}
                  <span style={{ color: '#999', fontWeight: 'normal', fontSize: 12 }}>
                    {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                  </span>
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  <span style={{ color: '#333' }}>{comment.content}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {comment.email && `邮箱：${comment.email}`}
                    {comment.website && ` 主页：${comment.website}`}
                  </span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
