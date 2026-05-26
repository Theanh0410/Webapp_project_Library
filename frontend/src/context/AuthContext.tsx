import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User, UserRole } from '../types'

interface RegisterInput {
  studentId: string
  name: string
  email: string
  password: string
  role: Extract<UserRole, 'student' | 'lecturer'>
}

interface AuthResult {
  error: string | null
  redirectTo?: string
}

interface AuthContextValue {
  user: User | null
  users: User[]
  login: (studentId: string, password: string) => Promise<AuthResult>
  register: (input: RegisterInput) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API_URL = 'http://localhost:5000/api'
const USER_STORAGE_KEY = 'iu-library-user'
const TOKEN_STORAGE_KEY = 'iu-library-token'

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users] = useState<User[]>([])
  const [user, setUser] = useState<User | null>(() => loadStoredUser())

  const login = useCallback(async (studentId: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: studentId, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return {
          error: data.message || 'Login failed.',
        }
      }

      setUser(data.user)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)

      return {
        error: null,
        redirectTo: data.redirectTo,
      }
    } catch {
      return {
        error: 'Cannot connect to backend server.',
      }
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      const data = await res.json()

      if (!res.ok) {
        return {
          error: data.message || 'Register failed.',
        }
      }

      setUser(data.user)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)

      return {
        error: null,
        redirectTo: data.redirectTo,
      }
    } catch {
      return {
        error: 'Cannot connect to backend server.',
      }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
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