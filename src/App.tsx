import { RouterProvider } from 'react-router'
import { ProfileProvider } from '@/contexts/profile'
import { router } from '@/router'

const App = () => (
  <ProfileProvider>
    <RouterProvider router={router} />
  </ProfileProvider>
)

export default App
