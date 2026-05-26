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

const STUDENT_BORROW_DAYS = 14
const LECTURER_BORROW_DAYS = 28
const STUDENT_MAX_BOOKS = 3
const LECTURER_MAX_BOOKS = 5
const PENALTY_PER_DAY = 5000
const API_URL = 'http://localhost:5000/api'

interface LibraryContextValue {
  books: Book[]
  borrowRecords: BorrowRecord[]
  orders: BookOrder[]
  users: User[]
  borrowBook: (user: User, bookId: string) => string | null
  returnBook: (user: User, borrowId: string) => string | null
  orderBook: (user: User, bookId: string) => string | null
  cancelOrder: (orderId: string) => void
  getUserBorrows: (userId: string) => BorrowRecord[]
  getUserOrders: (userId: string) => BookOrder[]
  getReminders: (userId: string) => string[]
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function getBorrowDaysByRole(role: User['role']) {
  if (role === 'lecturer') return LECTURER_BORROW_DAYS
  return STUDENT_BORROW_DAYS
}

function getMaxBooksByRole(role: User['role']) {
  if (role === 'lecturer') return LECTURER_MAX_BOOKS
  return STUDENT_MAX_BOOKS
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [borrows, setBorrows] = useState<BorrowRecord[]>([])
  const [orders, setOrders] = useState<BookOrder[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/books`)

        if (!res.ok) {
          throw new Error('Failed to load books')
        }

        const data = await res.json()
        setBooks(data)
      } catch (error) {
        console.error('Load books error:', error)
      }
    }

    loadBooks()
  }, [])

  const getUserBorrows = useCallback(
    (userId: string) => borrows.filter((b) => b.userId === userId),
    [borrows],
  )

  const getUserOrders = useCallback(
    (userId: string) => orders.filter((o) => o.userId === userId),
    [orders],
  )

  const getReminders = useCallback(
    (userId: string) => {
      const today = new Date().toISOString().slice(0, 10)
      const msgs: string[] = []
      borrows
        .filter((b) => b.userId === userId && b.status === 'active')
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
        .filter((o) => o.userId === userId && o.status === 'ready')
        .forEach((o) => {
          const book = books.find((bk) => bk.id === o.bookId)
          msgs.push(`Sách đã sẵn sàng nhận: "${book?.title}"`)
        })
      return msgs
    },
    [borrows, books, orders],
  )

  const borrowBook = useCallback(
    (user: User, bookId: string) => {
      if (user.role !== 'student' && user.role !== 'lecturer') {
        return 'Chỉ sinh viên và giảng viên được mượn sách.'
      }
      const active = borrows.filter(
        (b) => b.userId === user.id && b.status === 'active',
      )
      const max = getMaxBooksByRole(user.role)
      if (active.length >= max) {
        return `Bạn đã mượn tối đa ${max} cuốn.`
      }
      const book = books.find((b) => b.id === bookId)
      if (!book) return 'Không tìm thấy sách.'
      if (!book.available) return 'Sách đang được mượn hoặc đã đặt trước.'
      const today = new Date().toISOString().slice(0, 10)
      const days = getBorrowDaysByRole(user.role)

      const record: BorrowRecord = {
        id: `br${Date.now()}`,
        userId: String(user.id),
        bookId,
        borrowDate: today,
        dueDate: addDays(today, days),
        status: 'active',
      }
      setBorrows((prev) => [...prev, record])
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, available: false } : b)),
      )
      return null
    },
    [books, borrows],
  )

  const returnBook = useCallback(
    (user: User, borrowId: string) => {
      const record = borrows.find((b) => b.id === borrowId)
      if (!record || record.userId !== user.id) return 'Không tìm thấy phiếu mượn.'
      if (record.status !== 'active') return 'Sách đã được trả.'
      const today = new Date().toISOString().slice(0, 10)
      let penalty = 0
      if (today > record.dueDate) {
        penalty = daysBetween(record.dueDate, today) * PENALTY_PER_DAY
      }
      setBorrows((prev) =>
        prev.map((b) =>
          b.id === borrowId
            ? {
                ...b,
                status: penalty > 0 ? 'overdue' : 'returned',
                returnDate: today,
                penalty: penalty || undefined,
              }
            : b,
        ),
      )
      setBooks((prev) =>
        prev.map((bk) =>
          bk.id === record.bookId ? { ...bk, available: true } : bk,
        ),
      )
      const readyOrder = orders.find(
        (o) => o.bookId === record.bookId && o.status === 'pending',
      )
      if (readyOrder) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === readyOrder.id ? { ...o, status: 'ready' as const } : o,
          ),
        )
      }
      return penalty > 0
        ? `Đã trả sách. Phạt trễ hạn: ${penalty.toLocaleString('vi-VN')}đ`
        : null
    },
    [borrows, orders],
  )

  const orderBook = useCallback(
    (user: User, bookId: string) => {
      const book = books.find((b) => b.id === bookId)
      if (!book) return 'Không tìm thấy sách.'
      if (book.available) return 'Sách còn trên kệ — bạn có thể mượn trực tiếp.'
      const dup = orders.some(
        (o) =>
          o.userId === user.id &&
          o.bookId === bookId &&
          o.status === 'pending',
      )
      if (dup) return 'Bạn đã đặt trước cuốn này.'
      const order: BookOrder = {
        id: `ord${Date.now()}`,
        userId: user.id,
        bookId,
        orderDate: new Date().toISOString().slice(0, 10),
        status: 'pending',
      }
      setOrders((prev) => [...prev, order])
      return null
    },
    [books, orders],
  )

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled' as const } : o,
      ),
    )
  }, [])

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
