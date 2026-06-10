import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  message,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { marked } from 'marked'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { useNavigate, useParams } from 'react-router'
import 'github-markdown-css/github-markdown-light.css'
import { createArticle, getArticle, updateArticle } from '@/apis/article'
import { getCategories } from '@/apis/category'
import { getTags } from '@/apis/tag'
import { getAuthors } from '@/apis/author'
import { UploadImage } from '@/components/UploadImage'
import {
  ArticlePublic,
  ArticleStar,
  ArticleStatus,
  type Author,
  type Category,
  type Tag,
} from '@/types'

interface EditorFormValues {
  title: string
  description: string
  cover?: string
  created_date: Dayjs
  category_id: number
  tag_ids: number[]
  author_ids: number[]
  public: ArticlePublic
  status: ArticleStatus
  star: ArticleStar
}

export const ArticleEditor = () => {
  const { id } = useParams()
  const articleId = id ? Number(id) : null
  const navigate = useNavigate()
  const [form] = Form.useForm<EditorFormValues>()

  const [content, setContent] = useState('')
  const [view, setView] = useState<'编辑' | '预览'>('编辑')
  const [saving, setSaving] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
    getTags().then(setTags)
    getAuthors().then(setAuthors)
  }, [])

  useEffect(() => {
    if (!articleId) return
    getArticle(articleId).then((article) => {
      form.setFieldsValue({
        title: article.title,
        description: article.description,
        cover: article.cover,
        created_date: dayjs(article.created_date),
        category_id: article.category_id ?? undefined,
        tag_ids: article.tag_ids,
        author_ids: article.author_ids,
        public: article.public,
        status: article.status,
        star: article.star,
      })
      setContent(article.content ?? '')
    })
  }, [articleId, form])

  const previewHtml = useMemo(
    () => (view === '预览' ? (marked.parse(content) as string) : ''),
    [view, content],
  )

  const submit = async (status?: ArticleStatus) => {
    if (!content.trim()) {
      message.error('请输入文章内容')
      return
    }
    const values = await form.validateFields()
    const payload = {
      ...values,
      content,
      created_date: values.created_date.toISOString(),
      status: status ?? values.status,
    }
    setSaving(true)
    try {
      if (articleId) {
        await updateArticle(articleId, payload)
        message.success('更新文章成功')
      } else {
        await createArticle(payload)
        message.success('发布文章成功')
      }
      navigate('/articles')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      title={
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/articles')} />
          {articleId ? '编辑文章' : '写文章'}
        </Space>
      }
      extra={
        <Space>
          <Button loading={saving} onClick={() => submit(ArticleStatus.Draft)}>
            存为草稿
          </Button>
          <Button type="primary" loading={saving} onClick={() => submit(ArticleStatus.Published)}>
            {articleId ? '保存' : '发布'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          public: ArticlePublic.Public,
          status: ArticleStatus.Published,
          star: ArticleStar.Normal,
          created_date: dayjs(),
          tag_ids: [],
          author_ids: [],
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input maxLength={64} placeholder="文章标题" showCount />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <Input.TextArea maxLength={255} rows={2} placeholder="文章摘要 / SEO 描述" showCount />
            </Form.Item>
            <Form.Item label="内容" required>
              <Segmented
                options={['编辑', '预览']}
                value={view}
                onChange={(value) => setView(value as '编辑' | '预览')}
                style={{ marginBottom: 8 }}
              />
              {view === '编辑' ? (
                <CodeMirror
                  value={content}
                  height="480px"
                  extensions={[
                    markdown({ base: markdownLanguage, codeLanguages: languages }),
                  ]}
                  onChange={setContent}
                  placeholder="使用 Markdown 书写…"
                  style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}
                />
              ) : (
                <div
                  className="markdown-body"
                  style={{ height: 520, border: '1px solid #d9d9d9', borderRadius: 6 }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="category_id"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select
                placeholder="选择分类"
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
            <Form.Item
              name="tag_ids"
              label="标签"
              rules={[{ required: true, message: '请选择标签' }]}
            >
              <Select
                mode="multiple"
                placeholder="选择标签"
                options={tags.map((t) => ({ label: t.name, value: t.id }))}
              />
            </Form.Item>
            <Form.Item
              name="author_ids"
              label="作者"
              rules={[{ required: true, message: '请选择作者' }]}
            >
              <Select
                mode="multiple"
                placeholder="选择作者"
                options={authors.map((a) => ({ label: a.name, value: a.id }))}
              />
            </Form.Item>
            <Form.Item
              name="created_date"
              label="发布时间"
              rules={[{ required: true, message: '请选择发布时间' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="cover" label="封面">
              <UploadImage width={240} height={135} />
            </Form.Item>
            <Form.Item name="public" label="可见性">
              <Radio.Group>
                <Radio value={ArticlePublic.Public}>公开</Radio>
                <Radio value={ArticlePublic.Private}>私密</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="star" label="精选">
              <Radio.Group>
                <Radio value={ArticleStar.Normal}>普通</Radio>
                <Radio value={ArticleStar.Star}>精选</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="status" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}
