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
  const [orders, setOrders] = useState<BookOrder[]>([])
  const [users, setUsers] = useState<User[]>([])

  const refreshLibraryData = useCallback(async () => {
    try {
      const headers = getAuthHeaders()

      const [booksRes, usersRes, borrowsRes, reservationsRes] =
        await Promise.all([
          fetch(`${API_URL}/books`),
          fetch(`${API_URL}/users`, { headers }),
          fetch(`${API_URL}/borrows`, { headers }),
          fetch(`${API_URL}/reservations`, { headers }),
        ])

      if (!booksRes.ok) throw new Error('Failed to load books')
      if (!usersRes.ok) throw new Error('Failed to load users')
      if (!borrowsRes.ok) throw new Error('Failed to load borrow records')
      if (!reservationsRes.ok) throw new Error('Failed to load reservations')

      const booksData = await booksRes.json()
      const usersData = await usersRes.json()
      const borrowsData = await borrowsRes.json()
      const reservationsData = await reservationsRes.json()

      setBooks(booksData)
      setUsers(usersData)
      setBorrows(borrowsData)
      setOrders(reservationsData)
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

        if (data?.borrowRecord?.penalty) {
          return `Đã trả sách. Phạt trễ hạn: ${data.borrowRecord.penalty.toLocaleString('vi-VN')}đ`
        }

        return null
      } catch (error) {
        console.error('Return book error:', error)
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

  const value = useMemo(
    () => ({
      books,
      borrowRecords: borrows,
      orders,
      users,

      borrowBook,
      returnBook,
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