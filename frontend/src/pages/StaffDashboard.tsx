import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import type { Book, BorrowRecord} from '../types'
import './Dashboard.css'

export function StaffDashboard() {
  const location = useLocation()
  const { user } = useAuth()
  const {
    books,
    borrowRecords,
    users,
    borrowBook,
    returnBook,
    refreshLibraryData,
  } = useLibrary()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | 'All'>('All')
  const [categories, setCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'books' | 'borrows' | 'returns' | 'overdue'>('books')
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)

  // Book management state
  const [showAddBook, setShowAddBook] = useState(false)
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '',
    author: '',
    code: '',
    category: 'Programming',
    subject: 'General',
    shelf: '',
    available: true,
    copies: 1,
    description: '',
    publishedYear: undefined,
  })
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // Borrow management state
  const [borrowUserName, setBorrowUserName] = useState('')
  const [borrowBookId, setBorrowBookId] = useState('')

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const hash = location.hash.replace('#', '')

    if (
      hash === 'books' ||
      hash === 'borrows' ||
      hash === 'returns' ||
      hash === 'overdue'
    ) {
      setActiveTab(hash)
    } else {
      setActiveTab('books')
    }
  }, [location.hash])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/books/categories')
        const data: { id: string; name: string }[] = await res.json()
        setCategories(data.map((c) => c.name))
      } catch (error) {
        console.error('Load categories error:', error)
      }
    }

    loadCategories()
  }, [])

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
      const matchCategory = category === 'All' || b.category === category
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [books, search, category])

  const handleAddBook = async (e: FormEvent) => {
    e.preventDefault()

    if (!newBook.title || !newBook.author || !newBook.code || !newBook.category) {
      showToast('Vui lòng nhập đầy đủ thông tin sách', 'warn')
      return
    }

    try {
      const token = localStorage.getItem('iu-library-token')

      const res = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          code: newBook.code,
          category: newBook.category,
          subject: newBook.subject || 'General',
          publishedYear: newBook.publishedYear || null,
          description: newBook.description || '',
          copies: newBook.copies || 1,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể thêm sách', 'warn')
        return
      }

      await refreshLibraryData()

      setNewBook({
        title: '',
        author: '',
        code: '',
        category: 'Programming',
        subject: 'General',
        description: '',
        publishedYear: undefined,
        shelf: '',
        available: true,
        copies: 1,
      })

      showToast('Đã thêm sách mới vào thư viện', 'info')
    } catch (error) {
      console.error('Add book error:', error)
      showToast('Không thể kết nối server', 'warn')
    }
  }

  const handleCreateBorrowRecord = async (e: FormEvent) => {
    e.preventDefault()

    if (!borrowUserName || !borrowBookId) {
      showToast('Vui lòng chọn sinh viên/giảng viên và sách', 'warn')
      return
    }

    const borrower = users.find((u) => u.id === borrowUserName)

    if (!borrower) {
      showToast('Không tìm thấy người mượn', 'warn')
      return
    }

    const err = await borrowBook(borrower, borrowBookId)

    if (err) {
      showToast(err, 'warn')
      return
    }

    showToast('Hồ sơ mượn sách đã được tạo', 'info')
    setBorrowUserName('')
    setBorrowBookId('')
  }

  const handleConfirmReturn = async (recordId: string) => {
    const record = borrowRecords.find((b) => b.id === recordId)

    if (!record) {
      showToast('Không tìm thấy hồ sơ mượn', 'warn')
      return
    }

    const borrower = users.find((u) => u.id === record.userId)

    if (!borrower) {
      showToast('Không tìm thấy người mượn', 'warn')
      return
    }

    const msg = await returnBook(borrower, recordId)

    if (msg) showToast(msg, msg.includes('Phạt') ? 'warn' : 'info')
    else showToast('Xác nhận trả sách thành công', 'info')
  }
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.full_name ?? 'Unknown'
  }

  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title ?? 'Unknown'
  }

  if (!user) return null

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

        {/* Books Management */}
        {activeTab === 'books' && (
          <div id="books" className="staff-section">
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
                    Năm xuất bản
                    <input
                      type="number"
                      value={newBook.publishedYear || ''}
                      onChange={(e) =>
                        setNewBook((prev) => ({
                          ...prev,
                          publishedYear: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      placeholder="VD: 2020"
                    />
                  </label>
                  <label>
                    Danh mục
                    <select
                      value={newBook.category || 'Programming'}
                      onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Chủ đề
                    <input
                      value={newBook.subject || ''}
                      onChange={(e) =>
                        setNewBook((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      placeholder="VD: Software Engineering"
                    />
                  </label>
                  <label>
                    Mô tả
                    <textarea
                      value={newBook.description || ''}
                      onChange={(e) =>
                        setNewBook((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Nhập mô tả ngắn về sách"
                    />
                  </label>
                  <label>
                    Số lượng bản sao
                    <input
                      type="number"
                      min="1"
                      value={newBook.copies || 1}
                      onChange={(e) =>
                        setNewBook((prev) => ({
                          ...prev,
                          copies: Number(e.target.value),
                        }))
                      }
                    />
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
                  Danh mục:
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as string | 'All')}
                  >
                    <option value="All">Tất cả</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
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
                      <th>Danh mục</th>
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
                        <td>{book.category}</td>
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
          <div id="borrows" className="staff-section">
            <h2>Tạo hồ sơ mượn sách</h2>
            <form className="borrow-form" onSubmit={handleCreateBorrowRecord}>
              <label>
                Mã sinh viên / Giảng viên
                <select
                  value={borrowUserName}
                  onChange={(e) => setBorrowUserName(e.target.value)}
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
          <div id="returns" className="staff-section">
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
          <div id="overdue" className="staff-section">
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
