import { createBrowserRouter, Navigate } from 'react-router'
import { RequireAuth } from '@/components/RequireAuth'
import { AppLayout } from '@/components/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Analytics } from '@/pages/Analytics'
import { ArticleList } from '@/pages/articles/ArticleList'
import { ArticleEditor } from '@/pages/articles/ArticleEditor'
import { ArticleComments } from '@/pages/articles/ArticleComments'
import { Categories } from '@/pages/Categories'
import { Tags } from '@/pages/Tags'
import { Friends } from '@/pages/Friends'
import { Music } from '@/pages/Music'
import { Messages } from '@/pages/Messages'
import { Authors } from '@/pages/Authors'
import { AiAgent } from '@/pages/AiAgent'
import { Profile } from '@/pages/Profile'
import { NotFound } from '@/pages/NotFound'

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'articles', element: <ArticleList /> },
      { path: 'articles/new', element: <ArticleEditor /> },
      { path: 'articles/:id/edit', element: <ArticleEditor /> },
      { path: 'articles/:id/comments', element: <ArticleComments /> },
      { path: 'categories', element: <Categories /> },
      { path: 'tags', element: <Tags /> },
      { path: 'music', element: <Music /> },
      { path: 'friends', element: <Friends /> },
      { path: 'messages', element: <Messages /> },
      { path: 'authors', element: <Authors /> },
      { path: 'ai-agent', element: <AiAgent /> },
      { path: 'profile', element: <Profile /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
