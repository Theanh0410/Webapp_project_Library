import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialUsers } from '../data/mockData'
import type { User, UserRole } from '../types'

interface RegisterInput {
  studentId: string
  name: string
  email: string
  password: string
  role: Extract<UserRole, 'student' | 'lecturer'>
}

interface AuthContextValue {
  user: User | null
  users: User[]
  login: (studentId: string, password: string) => string | null
  register: (input: RegisterInput) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'iu-library-user'

function loadStoredUser(users: User[]): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const id = JSON.parse(raw) as string
    return users.find((u) => u.id === id) ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [user, setUser] = useState<User | null>(() => loadStoredUser(initialUsers))

  const login = useCallback(
    (studentId: string, password: string) => {
      const found = users.find(
        (u) => u.studentId.toLowerCase() === studentId.trim().toLowerCase(),
      )
      if (!found) return 'Mã sinh viên / giảng viên không tồn tại.'
      if (found.password !== password) return 'Mật khẩu không đúng.'
      setUser(found)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found.id))
      return null
    },
    [users],
  )

  const register = useCallback(
    (input: RegisterInput) => {
      const exists = users.some(
        (u) =>
          u.studentId.toLowerCase() === input.studentId.trim().toLowerCase() ||
          u.email.toLowerCase() === input.email.trim().toLowerCase(),
      )
      if (exists) return 'Mã hoặc email đã được đăng ký.'
      const newUser: User = {
        id: `u${Date.now()}`,
        studentId: input.studentId.trim(),
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        password: input.password,
      }
      setUsers((prev) => [...prev, newUser])
      setUser(newUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser.id))
      return null
    },
    [users],
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({ user, users, login, register, logout }),
    [user, users, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
