import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getProfile } from '@/apis/auth'
import { isLoggedIn } from '@/services/token'
import { AuthorRole, type Author } from '@/types'

interface ProfileContextValue {
  profile: Author | null
  isSuperAdmin: boolean
  refresh: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  isSuperAdmin: false,
  refresh: async () => {},
})

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Author | null>(null)

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) return
    setProfile(await getProfile())
  }, [])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  return (
    <ProfileContext.Provider
      value={{ profile, isSuperAdmin: profile?.role === AuthorRole.SuperAdmin, refresh }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
