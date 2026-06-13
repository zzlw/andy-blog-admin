import { useMemo } from 'react'
import { Avatar, Dropdown, Layout, Menu } from 'antd'
import {
  AppstoreOutlined,
  FileTextOutlined,
  LinkOutlined,
  LogoutOutlined,
  MessageOutlined,
  RobotOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useProfile } from '@/contexts/profile'
import { removeTokens } from '@/services/token'
import { resolveStatic } from '@/config'
import { isAiServiceEnabled } from '@/services/ai-http'

const { Sider, Header, Content } = Layout

const MENU_ITEMS = [
  { key: '/articles', icon: <FileTextOutlined />, label: '文章管理' },
  { key: '/categories', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/tags', icon: <TagsOutlined />, label: '标签管理' },
  { key: '/messages', icon: <MessageOutlined />, label: '留言管理' },
  { key: '/friends', icon: <LinkOutlined />, label: '友链管理' },
  { key: '/authors', icon: <TeamOutlined />, label: '作者管理' },
  ...(isAiServiceEnabled()
    ? [{ key: '/ai-agent', icon: <RobotOutlined />, label: 'AI 对话' }]
    : []),
]

export const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfile()

  // 高亮当前一级菜单（/articles/1/edit → /articles）
  const selectedKey = useMemo(() => {
    const top = `/${location.pathname.split('/')[1]}`
    return MENU_ITEMS.some((item) => item.key === top) ? top : '/articles'
  }, [location.pathname])

  const logout = () => {
    removeTokens()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={208}>
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          博客管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={MENU_ITEMS}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          }}
        >
          <Dropdown
            trigger={['hover', 'click']}
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: '个人资料' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
              ],
              onClick: ({ key }) => (key === 'logout' ? logout() : navigate('/profile')),
            }}
          >
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" src={resolveStatic(profile?.avatar) || undefined} icon={<UserOutlined />} />
              {profile?.name ?? '...'}
            </span>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
