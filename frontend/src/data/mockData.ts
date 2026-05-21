import type { Book, BorrowRecord, BookOrder, User } from '../types'

export const DEMO_PASSWORD = '123456'

export const initialUsers: User[] = [
  {
    id: 'u1',
    studentId: 'IT12345',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@student.hcmiu.edu.vn',
    role: 'student',
    password: DEMO_PASSWORD,
  },
  {
    id: 'u2',
    studentId: 'LEC8901',
    name: 'Dr. Trần Minh Tuấn',
    email: 'tuan.tran@hcmiu.edu.vn',
    role: 'lecturer',
    password: DEMO_PASSWORD,
  },
]

export const initialBooks: Book[] = [
  { id: 'b1', code: 'IT-001', title: 'Introduction to Algorithms', author: 'Cormen et al.', discipline: 'IT', available: true, shelf: 'A-12' },
  { id: 'b2', code: 'MATH-042', title: 'Calculus Vol. 1', author: 'Stewart', discipline: 'Maths', available: true, shelf: 'B-03' },
  { id: 'b3', code: 'BIO-018', title: 'Campbell Biology', author: 'Reece', discipline: 'Biology', available: false, shelf: 'C-07' },
  { id: 'b4', code: 'IT-088', title: 'Clean Code', author: 'Robert Martin', discipline: 'IT', available: true, shelf: 'A-15' },
  { id: 'b5', code: 'PHY-021', title: 'University Physics', author: 'Young', discipline: 'Physics', available: true, shelf: 'D-02' },
  { id: 'b6', code: 'ECO-009', title: 'Principles of Economics', author: 'Mankiw', discipline: 'Economics', available: true, shelf: 'E-11' },
]

export const initialBorrows: BorrowRecord[] = [
  {
    id: 'br1',
    userId: 'u1',
    bookId: 'b3',
    borrowDate: '2026-04-20',
    dueDate: '2026-05-04',
    status: 'active',
  },
]

export const initialOrders: BookOrder[] = []

export const BORROW_DAYS: Record<string, number> = {
  student: 14,
  lecturer: 30,
}

export const MAX_BOOKS: Record<string, number> = {
  student: 3,
  lecturer: 8,
}

export const PENALTY_PER_DAY = 5000
