export type UserRole = 'student' | 'lecturer' | 'staff' | 'manager'

export interface User {
  id: string
  username: string
  full_name: string
  email: string
  role: UserRole
  position?: string | null
}

export interface Book {
  id: string
  code: string
  title: string
  author: string
  category: string
  subject: string
  available: boolean
  shelf: string

  publishedYear?: number | null
  description?: string
  copies?: number
}

export type BorrowStatus = 'active' | 'returned' | 'overdue' | 'pending_approval' | 'pending_return_approval' | 'approved'

export interface BorrowRecord {
  id: string
  userId: string
  bookId: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: BorrowStatus
  penalty?: number
}

export interface BookOrder {
  id: string
  userId: string
  bookId: string
  orderDate: string
  status: 'pending' | 'ready' | 'cancelled'
}