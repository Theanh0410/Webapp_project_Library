import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import './Dashboard.css'

const API_URL = 'http://localhost:5000/api'

const ROLE_LABELS: Record<string, string> = {
  student: 'Sinh viên',
  lecturer: 'Giảng viên',
}

export function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()

  const {
    books,
    borrowBook,
    returnBook,
    orderBook,
    cancelOrder,
    getUserBorrows,
    getUserOrders,
    getReminders,
  } = useLibrary()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | 'All'>('All')
  const [activeTab, setActiveTab] = useState<'library' | 'borrow' | 'orders' | 'history'>('library',)
  const [categories, setCategories] = useState<string[]>(['All'])
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const hash = location.hash.replace('#', '')

    if (hash === 'borrow' || hash === 'orders' || hash === 'history') {
      setActiveTab(hash)
    } else {
      setActiveTab('library')
    }
  }, [location.hash])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/books/categories`)

        if (!res.ok) {
          throw new Error('Failed to load categories')
        }

        const data: { id: string; name: string }[] = await res.json()
        setCategories(['All', ...data.map((c) => c.name)])
      } catch (error) {
        console.error('Load categories error:', error)
      }
    }

    loadCategories()
  }, [])

  const reminders = user ? getReminders(user.id) : []
  const myPendingApprovals = user
    ? getUserBorrows(user.id).filter((b) => b.status === 'pending_approval')
    : []
  const myPendingReturns = user
    ? getUserBorrows(user.id).filter((b) => b.status === 'pending_return_approval')
    : []
  const myBorrows = user
    ? getUserBorrows(user.id).filter((b) => b.status === 'active' || b.status === 'approved')
    : []
  const myHistory = user
    ? getUserBorrows(user.id).filter((b) => b.status !== 'active' && b.status !== 'pending_approval' && b.status !== 'pending_return_approval' && b.status !== 'approved')
    : []
  const myOrders = user
    ? getUserOrders(user.id).filter((o) => o.status === 'pending')
    : []

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()

    return books.filter((b) => {
      const matchCategory = category === 'All' || b.category === category
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.subject || '').toLowerCase().includes(q)

      return matchCategory && matchSearch
    })
  }, [books, search, category])

  if (!user) return null

  const handleBorrow = async (bookId: string) => {
    const err = await borrowBook(user, bookId)
    if (err) showToast(err, 'warn')
    else showToast('Yêu cầu mượn sách đã được gửi. Chờ nhân viên phê duyệt.')
  }

  const handleReturn = async (borrowId: string) => {
    const msg = await returnBook(user, borrowId)
    if (msg) showToast(msg, msg.includes('Phạt') ? 'warn' : 'info')
    else showToast('Đã trả sách. Cảm ơn bạn!')
  }

  const handleOrder = async (bookId: string) => {
    const err = await orderBook(user, bookId)
    if (err) showToast(err, 'warn')
    else showToast('Đã đặt trước. Bạn sẽ nhận thông báo khi sách sẵn sàng.')
  }

  return (
    <>
      <section className="dashboard-hero">
        <span className="user-badge">
          {ROLE_LABELS[user.role] ?? user.role} · {user.full_name}
        </span>
        <h1>THƯ VIỆN THÔNG TIN</h1>
        <p>GIẢI ĐÁP &amp; MƯỢN SÁCH — Tìm sách theo mã, tên, chuyên ngành hoặc chủ đề</p>
        <div className="search-bar">
          <input
            type="search"
            placeholder="Bạn cần tìm thông tin nào..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-bar__icon" aria-hidden>
            🔍
          </span>
        </div>
      </section>

      {reminders.length > 0 && (
        <aside className="reminders">
          <h3>Thông báo hệ thống</h3>
          <ul>
            {reminders.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </aside>
      )}

      {activeTab === 'borrow' && (
        <>
          {myPendingApprovals.length > 0 && (
            <section id="pending-approvals">
              <h2 className="section-title">Yêu cầu mượn chờ phê duyệt</h2>

              <div className="borrow-list">
                {myPendingApprovals.map((br) => {
                  const book = books.find((b) => b.id === br.bookId)

                  return (
                    <article key={br.id} className="borrow-item">
                      <div className="borrow-item__info">
                        <strong>{book?.title ?? '—'}</strong>
                        <span className="borrow-item__dates">
                          Mã: {book?.code} · Ngày yêu cầu: {br.borrowDate} · Hạn trả:{' '}
                          {br.dueDate}
                        </span>
                      </div>

                      <span className="status-badge status-badge--pending">
                        ⏳ Chờ phê duyệt
                      </span>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {myPendingReturns.length > 0 && (
            <section id="pending-returns">
              <h2 className="section-title">Yêu cầu trả sách chờ phê duyệt</h2>

              <div className="borrow-list">
                {myPendingReturns.map((br) => {
                  const book = books.find((b) => b.id === br.bookId)

                  return (
                    <article key={br.id} className="borrow-item">
                      <div className="borrow-item__info">
                        <strong>{book?.title ?? '—'}</strong>
                        <span className="borrow-item__dates">
                          Mã: {book?.code} · Hạn trả: {br.dueDate}
                        </span>
                      </div>

                      <span className="status-badge status-badge--pending">
                        ⏳ Chờ phê duyệt
                      </span>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          <section id="borrow">
            <h2 className="section-title">Sách đang mượn</h2>

            {myBorrows.length === 0 ? (
              <p className="empty-state">Không có sách đang mượn</p>
            ) : (
              <div className="borrow-list">
                {myBorrows.map((br) => {
                  const book = books.find((b) => b.id === br.bookId)

                  return (
                    <article key={br.id} className="borrow-item">
                      <div className="borrow-item__info">
                        <strong>{book?.title ?? '—'}</strong>
                        <span className="borrow-item__dates">
                          Mã: {book?.code} · Mượn: {br.borrowDate} · Hạn trả:{' '}
                          {br.dueDate}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => handleReturn(br.id)}
                      >
                        Trả sách
                      </button>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'orders' && (
        <section id="orders">
          <h2 className="section-title">Đặt trước</h2>

          {myOrders.length === 0 ? (
            <p className="empty-state">Không có sách đang đặt trước</p>
          ) : (
            <div className="borrow-list">
              {myOrders.map((ord) => {
                const book = books.find((b) => b.id === ord.bookId)

                return (
                  <article key={ord.id} className="borrow-item">
                    <div className="borrow-item__info">
                      <strong>{book?.title ?? '—'}</strong>
                      <span className="borrow-item__dates">
                        Ngày đặt: {ord.orderDate} ·{' '} Đang chờ
                      </span>
                    </div>

                    {ord.status === 'pending' && (
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={async () => {
                          await cancelOrder(ord.id)
                          showToast('Đã hủy đặt trước.', 'info')
                        }}
                      >
                        Hủy
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'library' && (
        <section>
          <h2 className="section-title">Danh mục sách</h2>

          <div className="discipline-filters">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-chip ${category === c ? 'filter-chip--active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c === 'All' ? 'Tất cả' : c}
              </button>
            ))}
          </div>

          <div className="book-grid">
            {filteredBooks.map((book) => (
              <article key={book.id} className="book-card">
                <span className="book-card__code">{book.code}</span>

                <h3 className="book-card__title">{book.title}</h3>

                <p className="book-card__meta">
                  {book.author} · {book.category} · {book.subject} · Kệ {book.shelf}
                </p>

                <span
                  className={`book-card__badge ${
                    book.available ? 'book-card__badge--ok' : 'book-card__badge--busy'
                  }`}
                >
                  {book.available ? 'Còn sách' : 'Đã mượn'}
                </span>

                <div className="book-card__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={!book.available}
                    onClick={() => handleBorrow(book.id)}
                  >
                    Mượn
                  </button>

                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={book.available}
                    onClick={() => handleOrder(book.id)}
                  >
                    Đặt trước
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'history' && (
        <section id="history">
          <h2 className="section-title">Lịch sử mượn</h2>

          {myHistory.length === 0 ? (
            <p className="empty-state">Không có lịch sử mượn sách</p>
          ) : (
            <div className="borrow-list">
              {myHistory.map((br) => {
                const book = books.find((b) => b.id === br.bookId)

                return (
                  <article key={br.id} className="borrow-item">
                    <div className="borrow-item__info">
                      <strong>{book?.title ?? '—'}</strong>
                      <span className="borrow-item__dates">
                        {br.borrowDate} → {br.returnDate ?? '—'}
                        {br.penalty ? ` · Phạt: ${br.penalty.toLocaleString('vi-VN')}đ` : ''}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {toast && (
        <div className={`toast toast--${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}
    </>
  )
}
