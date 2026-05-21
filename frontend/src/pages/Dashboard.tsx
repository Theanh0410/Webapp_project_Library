import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import type { Discipline } from '../types'
import './Dashboard.css'

const DISCIPLINES: (Discipline | 'All')[] = [
  'All',
  'IT',
  'Maths',
  'Biology',
  'Physics',
  'Economics',
  'Literature',
  'Other',
]

const ROLE_LABELS: Record<string, string> = {
  student: 'Sinh viên',
  lecturer: 'Giảng viên',
}

export function Dashboard() {
  const { user } = useAuth()
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
  const [discipline, setDiscipline] = useState<Discipline | 'All'>('All')
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)

  if (!user) return null

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const reminders = getReminders(user.id)
  const myBorrows = getUserBorrows(user.id).filter((b) => b.status === 'active')
  const myHistory = getUserBorrows(user.id).filter((b) => b.status !== 'active')
  const myOrders = getUserOrders(user.id).filter((o) => o.status !== 'cancelled')

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

  const handleBorrow = (bookId: string) => {
    const err = borrowBook(user, bookId)
    if (err) showToast(err, 'warn')
    else showToast('Mượn sách thành công! Vui lòng trả đúng hạn.')
  }

  const handleReturn = (borrowId: string) => {
    const msg = returnBook(user, borrowId)
    if (msg) showToast(msg, msg.includes('Phạt') ? 'warn' : 'info')
    else showToast('Đã trả sách. Cảm ơn bạn!')
  }

  const handleOrder = (bookId: string) => {
    const err = orderBook(user, bookId)
    if (err) showToast(err, 'warn')
    else showToast('Đã đặt trước. Bạn sẽ nhận thông báo khi sách sẵn sàng.')
  }

  return (
    <>
      <section className="dashboard-hero">
        <span className="user-badge">
          {ROLE_LABELS[user.role] ?? user.role} · {user.name}
        </span>
        <h1>THƯ VIỆN THÔNG TIN</h1>
        <p>GIẢI ĐÁP &amp; MƯỢN SÁCH — Tìm sách theo mã, tên hoặc chuyên ngành</p>
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

      {myBorrows.length > 0 && (
        <section id="borrow">
          <h2 className="section-title">Sách đang mượn</h2>
          <div className="borrow-list">
            {myBorrows.map((br) => {
              const book = books.find((b) => b.id === br.bookId)
              return (
                <article key={br.id} className="borrow-item">
                  <div className="borrow-item__info">
                    <strong>{book?.title ?? '—'}</strong>
                    <span className="borrow-item__dates">
                      Mã: {book?.code} · Mượn: {br.borrowDate} · Hạn trả: {br.dueDate}
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
        </section>
      )}

      {myOrders.length > 0 && (
        <section id="orders">
          <h2 className="section-title">Đặt trước</h2>
          <div className="borrow-list">
            {myOrders.map((ord) => {
              const book = books.find((b) => b.id === ord.bookId)
              return (
                <article key={ord.id} className="borrow-item">
                  <div className="borrow-item__info">
                    <strong>{book?.title ?? '—'}</strong>
                    <span className="borrow-item__dates">
                      Ngày đặt: {ord.orderDate} ·{' '}
                      {ord.status === 'ready' ? 'Sẵn sàng nhận' : 'Đang chờ'}
                    </span>
                  </div>
                  {ord.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => cancelOrder(ord.id)}
                    >
                      Hủy
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Danh mục sách</h2>
        <div className="discipline-filters">
          {DISCIPLINES.map((d) => (
            <button
              key={d}
              type="button"
              className={`filter-chip ${discipline === d ? 'filter-chip--active' : ''}`}
              onClick={() => setDiscipline(d)}
            >
              {d === 'All' ? 'Tất cả' : d}
            </button>
          ))}
        </div>
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <article key={book.id} className="book-card">
              <span className="book-card__code">{book.code}</span>
              <h3 className="book-card__title">{book.title}</h3>
              <p className="book-card__meta">
                {book.author} · {book.discipline} · Kệ {book.shelf}
              </p>
              <span
                className={`book-card__badge ${book.available ? 'book-card__badge--ok' : 'book-card__badge--busy'}`}
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

      {myHistory.length > 0 && (
        <section id="history">
          <h2 className="section-title">Lịch sử mượn</h2>
          <div className="borrow-list">
            {myHistory.map((br) => {
              const book = books.find((b) => b.id === br.bookId)
              return (
                <article key={br.id} className="borrow-item">
                  <div className="borrow-item__info">
                    <strong>{book?.title ?? '—'}</strong>
                    <span className="borrow-item__dates">
                      {br.borrowDate} → {br.returnDate ?? '—'}
                      {br.penalty
                        ? ` · Phạt: ${br.penalty.toLocaleString('vi-VN')}đ`
                        : ''}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
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
