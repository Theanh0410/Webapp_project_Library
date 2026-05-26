import { FormEvent, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import type { Book, BorrowRecord, Discipline } from '../types'
import './Dashboard.css'

const DISCIPLINES: Discipline[] = [
  'IT',
  'Maths',
  'Biology',
  'Physics',
  'Economics',
  'Literature',
  'Other',
]

export function StaffDashboard() {
  const { user } = useAuth()
  const { books, borrowRecords, users } = useLibrary()

  const [search, setSearch] = useState('')
  const [discipline, setDiscipline] = useState<Discipline | 'All'>('All')
  const [activeTab, setActiveTab] = useState<'books' | 'borrows' | 'returns' | 'overdue'>('books')
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)

  // Book management state
  const [showAddBook, setShowAddBook] = useState(false)
  const [newBook, setNewBook] = useState<Partial<Book>>({ discipline: 'IT' })
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // Borrow management state
  const [borrowStudentId, setBorrowStudentId] = useState('')
  const [borrowBookId, setBorrowBookId] = useState('')

  if (!user) return null

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Get overdue books
  const overdueRecords = borrowRecords.filter((b) => {
    if (b.status !== 'active') return false
    const dueDate = new Date(b.dueDate)
    return dueDate < new Date()
  })

  // Get pending returns (books that are marked as returned but not yet processed)
  const pendingReturns = borrowRecords.filter(
    (b) => b.status === 'active' && b.returnDate === undefined,
  )

  // Filter books
  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return books.filter((b) => {
      const matchDisc = discipline === 'All' || b.discipline === discipline
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      return matchDisc && matchSearch
    })
  }, [books, search, discipline])

  const handleAddBook = (e: FormEvent) => {
    e.preventDefault()
    if (!newBook.title || !newBook.code || !newBook.author) {
      showToast('Vui lòng điền đầy đủ thông tin sách', 'warn')
      return
    }
    // In a real app, you'd call an API here
    showToast('Sách mới đã được thêm thành công', 'info')
    setNewBook({ discipline: 'IT' })
    setShowAddBook(false)
  }

  const handleCreateBorrowRecord = (e: FormEvent) => {
    e.preventDefault()
    if (!borrowStudentId || !borrowBookId) {
      showToast('Vui lòng chọn sinh viên và sách', 'warn')
      return
    }
    // In a real app, you'd call an API here
    showToast('Hồ sơ mượn sách đã được tạo', 'info')
    setBorrowStudentId('')
    setBorrowBookId('')
  }

  const handleConfirmReturn = (recordId: string) => {
    // In a real app, you'd call an API here
    showToast('Xác nhận trả sách thành công', 'info')
  }

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.full_name ?? 'Unknown'
  }

  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title ?? 'Unknown'
  }

  return (
    <>
      <section className="dashboard-hero">
        <span className="user-badge">Nhân viên · {user.full_name}</span>
        <h1>THƯ VIỆN - QUẢN LÝ NHÂN VIÊN</h1>
        <p>Quản lý sách, hồ sơ mượn, xác nhận trả sách và kiểm tra sách quá hạn</p>
      </section>

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="staff-dashboard">
        <div className="staff-tabs">
          <button
            className={`staff-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            📚 Quản lý sách
          </button>
          <button
            className={`staff-tab ${activeTab === 'borrows' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrows')}
          >
            ➕ Tạo hồ sơ mượn
          </button>
          <button
            className={`staff-tab ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            ✓ Xác nhận trả sách
          </button>
          <button
            className={`staff-tab ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            ⚠️ Sách quá hạn ({overdueRecords.length})
          </button>
        </div>

        {/* Books Management */}
        {activeTab === 'books' && (
          <div className="staff-section">
            <h2>Quản lý sách</h2>
            <button
              className="btn-primary"
              onClick={() => setShowAddBook(!showAddBook)}
            >
              {showAddBook ? '✕ Hủy' : '✚ Thêm sách mới'}
            </button>

            {showAddBook && (
              <form className="book-form" onSubmit={handleAddBook}>
                <div className="form-row">
                  <label>
                    Mã sách
                    <input
                      value={newBook.code || ''}
                      onChange={(e) => setNewBook({ ...newBook, code: e.target.value })}
                      placeholder="VD: IT-001"
                      required
                    />
                  </label>
                  <label>
                    Tên sách
                    <input
                      value={newBook.title || ''}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      placeholder="Tên sách"
                      required
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Tác giả
                    <input
                      value={newBook.author || ''}
                      onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      placeholder="Tác giả"
                      required
                    />
                  </label>
                  <label>
                    Chuyên ngành
                    <select
                      value={newBook.discipline || 'IT'}
                      onChange={(e) => setNewBook({ ...newBook, discipline: e.target.value as Discipline })}
                    >
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Vị trí kệ
                    <input
                      value={newBook.shelf || ''}
                      onChange={(e) => setNewBook({ ...newBook, shelf: e.target.value })}
                      placeholder="VD: A-12"
                      required
                    />
                  </label>
                  <label>
                    Có sẵn
                    <input
                      type="checkbox"
                      checked={newBook.available !== false}
                      onChange={(e) => setNewBook({ ...newBook, available: e.target.checked })}
                    />
                  </label>
                </div>
                <button type="submit" className="btn-primary">
                  Thêm sách
                </button>
              </form>
            )}

            <div className="books-list">
              <div className="search-bar">
                <input
                  type="search"
                  placeholder="Tìm sách..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>
                  Chuyên ngành:
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as Discipline | 'All')}
                  >
                    <option value="All">Tất cả</option>
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {filteredBooks.length === 0 ? (
                <p className="empty-state">Không tìm thấy sách nào</p>
              ) : (
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Mã sách</th>
                      <th>Tên sách</th>
                      <th>Tác giả</th>
                      <th>Chuyên ngành</th>
                      <th>Vị trí</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book.id}>
                        <td>{book.code}</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.discipline}</td>
                        <td>{book.shelf}</td>
                        <td>
                          <span className={`status ${book.available ? 'available' : 'unavailable'}`}>
                            {book.available ? '✓ Có sẵn' : '✕ Không sẵn'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-small"
                            onClick={() => setEditingBook(book)}
                          >
                            Sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Create Borrow Record */}
        {activeTab === 'borrows' && (
          <div className="staff-section">
            <h2>Tạo hồ sơ mượn sách</h2>
            <form className="borrow-form" onSubmit={handleCreateBorrowRecord}>
              <label>
                Mã sinh viên / Giảng viên
                <select
                  value={borrowStudentId}
                  onChange={(e) => setBorrowStudentId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn người mượn --</option>
                  {users
                    .filter((u) => u.role === 'student' || u.role === 'lecturer')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} - {u.full_name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Sách
                <select value={borrowBookId} onChange={(e) => setBorrowBookId(e.target.value)} required>
                  <option value="">-- Chọn sách --</option>
                  {books.filter((b) => b.available).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.title}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn-primary">
                Tạo hồ sơ
              </button>
            </form>
          </div>
        )}

        {/* Confirm Returns */}
        {activeTab === 'returns' && (
          <div className="staff-section">
            <h2>Xác nhận trả sách</h2>
            {pendingReturns.length === 0 ? (
              <p className="empty-state">Không có hồ sơ chờ xác nhận trả sách</p>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Người mượn</th>
                    <th>Tên sách</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReturns.map((record) => (
                    <tr key={record.id}>
                      <td>{getUserName(record.userId)}</td>
                      <td>{getBookTitle(record.bookId)}</td>
                      <td>{record.borrowDate}</td>
                      <td>{record.dueDate}</td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => handleConfirmReturn(record.id)}
                        >
                          Xác nhận
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Overdue Books */}
        {activeTab === 'overdue' && (
          <div className="staff-section">
            <h2>Sách quá hạn</h2>
            {overdueRecords.length === 0 ? (
              <p className="empty-state">Không có sách nào quá hạn</p>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Người mượn</th>
                    <th>Tên sách</th>
                    <th>Hạn trả</th>
                    <th>Số ngày quá hạn</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRecords.map((record) => {
                    const daysOverdue = Math.floor(
                      (new Date().getTime() - new Date(record.dueDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                    )
                    return (
                      <tr key={record.id}>
                        <td>{getUserName(record.userId)}</td>
                        <td>{getBookTitle(record.bookId)}</td>
                        <td>{record.dueDate}</td>
                        <td className="overdue-days">{daysOverdue} ngày</td>
                        <td>
                          <button className="btn-warn">Gửi nhắc nhở</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}
