import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag as AntTag,
  message,
} from 'antd'
import { CommentOutlined, EditOutlined, PlusOutlined, StarFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router'
import { deleteArticle, getArticles, updateArticle, type ArticleListQuery } from '@/apis/article'
import { getCategories } from '@/apis/category'
import { getTags } from '@/apis/tag'
import { getAuthors } from '@/apis/author'
import { useProfile } from '@/contexts/profile'
import {
  ArticlePublic,
  ArticleStar,
  ArticleStatus,
  type Article,
  type Author,
  type Category,
  type Tag,
} from '@/types'

const PAGE_SIZE = 10

export const ArticleList = () => {
  const navigate = useNavigate()
  const { isSuperAdmin } = useProfile()

  const [list, setList] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Omit<ArticleListQuery, 'page' | 'page_size'>>({})

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
    getTags().then(setTags)
    getAuthors().then(setAuthors)
  }, [])

  const load = useCallback(
    async (current: number, query: typeof filters) => {
      setLoading(true)
      try {
        const { data, pagination } = await getArticles({
          ...query,
          page: current,
          page_size: PAGE_SIZE,
        })
        setList(data)
        setTotal(pagination.total)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    load(page, filters)
  }, [load, page, filters])

  const patchFilter = (patch: Partial<typeof filters>) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const toggleField = async (article: Article, field: 'public' | 'star', checked: boolean) => {
    const valueMap = {
      public: checked ? ArticlePublic.Public : ArticlePublic.Private,
      star: checked ? ArticleStar.Star : ArticleStar.Normal,
    }
    await updateArticle(article.id, { [field]: valueMap[field] })
    message.success('更新成功')
    load(page, filters)
  }

  return (
    <Card
      title="文章管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/articles/new')}>
          写文章
        </Button>
      }
    >
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="搜索标题 / 描述"
          style={{ width: 220 }}
          onSearch={(keyword) => patchFilter({ keyword: keyword || undefined })}
        />
        <Select
          allowClear
          placeholder="分类"
          style={{ width: 140 }}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          onChange={(value) => patchFilter({ category_id: value })}
        />
        <Select
          allowClear
          placeholder="标签"
          style={{ width: 140 }}
          options={tags.map((t) => ({ label: t.name, value: t.id }))}
          onChange={(value) => patchFilter({ tag_id: value })}
        />
        <Select
          allowClear
          placeholder="作者"
          style={{ width: 140 }}
          options={authors.map((a) => ({ label: a.name, value: a.id }))}
          onChange={(value) => patchFilter({ author_id: value })}
        />
        <Select
          allowClear
          placeholder="可见性"
          style={{ width: 120 }}
          options={[
            { label: '公开', value: ArticlePublic.Public },
            { label: '私密', value: ArticlePublic.Private },
          ]}
          onChange={(value) => patchFilter({ public: value })}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 120 }}
          options={[
            { label: '已发布', value: ArticleStatus.Published },
            { label: '草稿', value: ArticleStatus.Draft },
          ]}
          onChange={(value) => patchFilter({ status: value })}
        />
        <Select
          allowClear
          placeholder="精选"
          style={{ width: 120 }}
          options={[
            { label: '精选', value: ArticleStar.Star },
            { label: '普通', value: ArticleStar.Normal },
          ]}
          onChange={(value) => patchFilter({ star: value })}
        />
      </Space>

      <Table<Article>
        rowKey="id"
        loading={loading}
        dataSource={list}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showTotal: (t) => `共 ${t} 篇`,
          onChange: setPage,
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          {
            title: '标题',
            dataIndex: 'title',
            render: (title: string, record) => (
              <Space>
                {record.star === ArticleStar.Star && <StarFilled style={{ color: '#faad14' }} />}
                {title}
              </Space>
            ),
          },
          {
            title: '分类',
            width: 110,
            render: (_, record) => record.category?.name ?? '-',
          },
          {
            title: '标签',
            width: 180,
            render: (_, record) => record.tags?.map((t) => <AntTag key={t.id}>{t.name}</AntTag>),
          },
          {
            title: '状态',
            width: 90,
            render: (_, record) =>
              record.status === ArticleStatus.Published ? (
                <AntTag color="green">已发布</AntTag>
              ) : (
                <AntTag color="orange">草稿</AntTag>
              ),
          },
          {
            title: '公开',
            width: 80,
            render: (_, record) => (
              <Switch
                size="small"
                checked={record.public === ArticlePublic.Public}
                onChange={(checked) => toggleField(record, 'public', checked)}
              />
            ),
          },
          {
            title: '精选',
            width: 80,
            render: (_, record) => (
              <Switch
                size="small"
                checked={record.star === ArticleStar.Star}
                onChange={(checked) => toggleField(record, 'star', checked)}
              />
            ),
          },
          { title: '阅读', dataIndex: 'views', width: 80 },
          { title: '点赞', dataIndex: 'like', width: 80 },
          {
            title: '发布时间',
            dataIndex: 'created_date',
            width: 160,
            render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
          },
          {
            title: '操作',
            width: 220,
            render: (_, record) => (
              <Space>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/articles/${record.id}/edit`)}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  icon={<CommentOutlined />}
                  onClick={() => navigate(`/articles/${record.id}/comments`)}
                >
                  评论
                </Button>
                <Popconfirm
                  title="删除后不可恢复，确认删除？"
                  onConfirm={async () => {
                    await deleteArticle(record.id)
                    message.success('删除文章成功')
                    load(page, filters)
                  }}
                >
                  <Button size="small" danger disabled={!isSuperAdmin}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  )
}
