export type UserRole = 'student' | 'lecturer' | 'staff' | 'manager'

export interface User {
  id: string
  studentId: string
  name: string
  email: string
  role: UserRole
  password: string
}

export type Discipline =
  | 'Maths'
  | 'IT'
  | 'Biology'
  | 'Physics'
  | 'Economics'
  | 'Literature'
  | 'Other'

export interface Book {
  id: string
  code: string
  title: string
  author: string
  discipline: Discipline
  available: boolean
  shelf: string
}

export type BorrowStatus = 'active' | 'returned' | 'overdue'

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
