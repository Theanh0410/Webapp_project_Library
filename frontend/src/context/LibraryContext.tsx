import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Book, BookOrder, BorrowRecord, User } from '../types'

const API_URL = 'http://localhost:5000/api'
const TOKEN_STORAGE_KEY = 'iu-library-token'
const PENALTY_PER_DAY = 5000

interface LibraryContextValue {
  books: Book[]
  borrowRecords: BorrowRecord[]
  orders: BookOrder[]
  users: User[]

  borrowBook: (user: User, bookId: string) => Promise<string | null>
  returnBook: (user: User, borrowId: string) => Promise<string | null>
  approveBorrowRequest: (borrowId: string) => Promise<string | null>
  approveReturnRequest: (borrowId: string) => Promise<string | null>
  getPendingApprovals: () => BorrowRecord[]
  getPendingReturns: () => BorrowRecord[]
  orderBook: (user: User, bookId: string) => Promise<string | null>
  cancelOrder: (orderId: string) => Promise<void>

  refreshLibraryData: () => Promise<void>

  getUserBorrows: (userId: string) => BorrowRecord[]
  getUserOrders: (userId: string) => BookOrder[]
  getReminders: (userId: string) => string[]
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

async function getApiError(res: Response, fallback: string) {
  try {
    const data = await res.json()
    return data.message || fallback
  } catch {
    return fallback
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [borrows, setBorrows] = useState<BorrowRecord[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<BorrowRecord[]>([])
  const [pendingReturns, setPendingReturns] = useState<BorrowRecord[]>([])
  const [orders, setOrders] = useState<BookOrder[]>([])
  const [users, setUsers] = useState<User[]>([])

  const refreshLibraryData = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    }

    try {
      // Load books first because books API does not need token
      const booksRes = await fetch(`${API_URL}/books`)

      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(booksData)
      } else {
        console.error('Failed to load books')
      }

      // If no token, stop here
      if (!token) {
        console.warn('No token found. Skipping protected library APIs.')
        return
      }

      const [usersRes, borrowsRes, reservationsRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: authHeaders }),
        fetch(`${API_URL}/borrows`, { headers: authHeaders }),
        fetch(`${API_URL}/reservations`, { headers: authHeaders }),
      ])

      if (usersRes.ok) {
        setUsers(await usersRes.json())
      } else {
        console.error('Failed to load users:', await usersRes.text())
      }

      if (borrowsRes.ok) {
        setBorrows(await borrowsRes.json())
      } else {
        console.error('Failed to load borrow records:', await borrowsRes.text())
      }

      if (reservationsRes.ok) {
        setOrders(await reservationsRes.json())
      } else {
        console.error('Failed to load reservations:', await reservationsRes.text())
      }

      // Load pending approvals and returns
      const [approvalsRes, returnsRes] = await Promise.all([
        fetch(`${API_URL}/borrows/pending-approvals`, { headers: authHeaders }),
        fetch(`${API_URL}/borrows/pending-returns`, { headers: authHeaders }),
      ])

      if (approvalsRes.ok) {
        setPendingApprovals(await approvalsRes.json())
      } else {
        console.error('Failed to load pending approvals:', await approvalsRes.text())
      }

      if (returnsRes.ok) {
        setPendingReturns(await returnsRes.json())
      } else {
        console.error('Failed to load pending returns:', await returnsRes.text())
      }
    } catch (error) {
      console.error('Load library data error:', error)
    }
  }, [])

  useEffect(() => {
    refreshLibraryData()
  }, [refreshLibraryData])

  const getUserBorrows = useCallback(
    (userId: string) => borrows.filter((b) => b.userId === String(userId)),
    [borrows],
  )

  const getUserOrders = useCallback(
    (userId: string) => orders.filter((o) => o.userId === String(userId)),
    [orders],
  )

  const getReminders = useCallback(
    (userId: string) => {
      const today = new Date().toISOString().slice(0, 10)
      const msgs: string[] = []

      borrows
        .filter((b) => b.userId === String(userId) && b.status === 'pending_approval')
        .forEach(() => {
          msgs.push('Bạn có yêu cầu mượn sách đang chờ phê duyệt')
        })

      borrows
        .filter((b) => b.userId === String(userId) && b.status === 'active')
        .forEach((b) => {
          const book = books.find((bk) => bk.id === b.bookId)

          if (today > b.dueDate) {
            const late = daysBetween(b.dueDate, today)

            msgs.push(
              `Quá hạn: "${book?.title}" — ${late} ngày (phạt ${(late * PENALTY_PER_DAY).toLocaleString('vi-VN')}đ)`,
            )
          } else if (daysBetween(today, b.dueDate) <= 3) {
            msgs.push(`Sắp hết hạn: "${book?.title}" — trả trước ${b.dueDate}`)
          }
        })

      borrows
        .filter((b) => b.userId === String(userId) && b.status === 'pending_return_approval')
        .forEach(() => {
          msgs.push('Bạn có yêu cầu trả sách đang chờ phê duyệt')
        })

      orders
        .filter((o) => o.userId === String(userId) && o.status === 'ready')
        .forEach((o) => {
          const book = books.find((bk) => bk.id === o.bookId)
          msgs.push(`Sách đã sẵn sàng nhận: "${book?.title}"`)
        })

      return msgs
    },
    [borrows, books, orders],
  )

  const borrowBook = useCallback(
    async (user: User, bookId: string) => {
      try {
        const res = await fetch(`${API_URL}/borrows`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            userId: user.id,
            bookId,
          }),
        })

        if (!res.ok) {
          return await getApiError(res, 'Không thể mượn sách.')
        }

        await refreshLibraryData()
        return null
      } catch (error) {
        console.error('Borrow book error:', error)
        return 'Không thể kết nối server.'
      }
    },
    [refreshLibraryData],
  )

  const returnBook = useCallback(
    async (_user: User, borrowId: string) => {
      try {
        const res = await fetch(`${API_URL}/borrows/${borrowId}/return`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
          return data?.message || 'Không thể trả sách.'
        }

        await refreshLibraryData()
        return data?.message || 'Yêu cầu trả sách đã được gửi, chờ phê duyệt.'
      } catch (error) {
        console.error('Return book error:', error)
        return 'Không thể kết nối server.'
      }
    },
    [refreshLibraryData],
  )

  const approveBorrowRequest = useCallback(
    async (borrowId: string) => {
      try {
        const res = await fetch(`${API_URL}/borrows/${borrowId}/approve`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        })

        if (!res.ok) {
          return await getApiError(res, 'Không thể phê duyệt yêu cầu mượn.')
        }

        await refreshLibraryData()
        return null
      } catch (error) {
        console.error('Approve borrow request error:', error)
        return 'Không thể kết nối server.'
      }
    },
    [refreshLibraryData],
  )

  const approveReturnRequest = useCallback(
    async (borrowId: string) => {
      try {
        const res = await fetch(`${API_URL}/borrows/${borrowId}/approve-return`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
          return data?.message || 'Không thể phê duyệt yêu cầu trả.'
        }

        await refreshLibraryData()
        return null
      } catch (error) {
        console.error('Approve return request error:', error)
        return 'Không thể kết nối server.'
      }
    },
    [refreshLibraryData],
  )

  const orderBook = useCallback(
    async (user: User, bookId: string) => {
      try {
        const res = await fetch(`${API_URL}/reservations`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            userId: user.id,
            bookId,
          }),
        })

        if (!res.ok) {
          return await getApiError(res, 'Không thể đặt trước sách.')
        }

        await refreshLibraryData()
        return null
      } catch (error) {
        console.error('Order book error:', error)
        return 'Không thể kết nối server.'
      }
    },
    [refreshLibraryData],
  )

  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        const res = await fetch(`${API_URL}/reservations/${orderId}/cancel`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        })

        if (!res.ok) {
          console.error(await getApiError(res, 'Không thể hủy đặt trước.'))
          return
        }

        await refreshLibraryData()
      } catch (error) {
        console.error('Cancel order error:', error)
      }
    },
    [refreshLibraryData],
  )

  const getPendingApprovals = useCallback(
    () => pendingApprovals,
    [pendingApprovals],
  )

  const getPendingReturns = useCallback(
    () => pendingReturns,
    [pendingReturns],
  )

  const value = useMemo(
    () => ({
      books,
      borrowRecords: borrows,
      orders,
      users,

      borrowBook,
      returnBook,
      approveBorrowRequest,
      approveReturnRequest,
      getPendingApprovals,
      getPendingReturns,
      orderBook,
      cancelOrder,

      refreshLibraryData,

      getUserBorrows,
      getUserOrders,
      getReminders,
    }),
    [
      books,
      borrows,
      orders,
      users,
      borrowBook,
      returnBook,
      approveBorrowRequest,
      approveReturnRequest,
      getPendingApprovals,
      getPendingReturns,
      orderBook,
      cancelOrder,
      refreshLibraryData,
      getUserBorrows,
      getUserOrders,
      getReminders,
    ],
  )

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}