import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import type { BorrowRecord } from '../types'
import './Dashboard.css'

export function ApprovalDashboard() {
  const { user } = useAuth()
  const {
    books,
    users,
    getPendingApprovals,
    getPendingReturns,
    approveBorrowRequest,
    approveReturnRequest,
    refreshLibraryData,
  } = useLibrary()

  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    refreshLibraryData()
  }, [refreshLibraryData])

  const pendingBorrows = getPendingApprovals()
  const pendingReturns = getPendingReturns()

  const handleApproveBorrow = async (borrowId: string) => {
    setLoadingId(borrowId)
    const err = await approveBorrowRequest(borrowId)
    setLoadingId(null)
    if (err) {
      showToast(err, 'warn')
    } else {
      showToast('Phê duyệt yêu cầu mượn thành công')
    }
  }

  const handleApproveReturn = async (borrowId: string) => {
    setLoadingId(borrowId)
    const err = await approveReturnRequest(borrowId)
    setLoadingId(null)
    if (err) {
      showToast(err, 'warn')
    } else {
      showToast('Phê duyệt yêu cầu trả thành công')
    }
  }

  const getBorrowerInfo = (record: BorrowRecord) => {
    const borrower = users.find((u) => u.id === record.userId)
    return borrower?.full_name || borrower?.username || 'Unknown'
  }

  const getBookTitle = (record: BorrowRecord) => {
    const book = books.find((b) => b.id === record.bookId)
    return book?.title || 'Unknown'
  }

  if (!user) return null

  return (
    <div className="dashboard-container">
      <h1>Phê duyệt Mượn/Trả Sách</h1>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'borrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          Chờ phê duyệt mượn ({pendingBorrows.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'return' ? 'active' : ''}`}
          onClick={() => setActiveTab('return')}
        >
          Chờ phê duyệt trả ({pendingReturns.length})
        </button>
      </div>

      {activeTab === 'borrow' && (
        <div className="tab-content">
          {pendingBorrows.length === 0 ? (
            <p className="empty-state">Không có yêu cầu mượn sách đang chờ phê duyệt</p>
          ) : (
            <div className="borrow-list">
              {pendingBorrows.map((record) => (
                <div key={record.id} className="borrow-card">
                  <div className="borrow-info">
                    <h3>{getBookTitle(record)}</h3>
                    <p className="borrow-details">
                      <strong>Người mượn:</strong> {getBorrowerInfo(record)}
                    </p>
                    <p className="borrow-details">
                      <strong>Ngày mượn:</strong> {record.borrowDate}
                    </p>
                    <p className="borrow-details">
                      <strong>Hạn trả:</strong> {record.dueDate}
                    </p>
                    <p className={`status status-${record.status}`}>
                      {record.status === 'pending_approval' ? 'Chờ phê duyệt mượn' : record.status}
                    </p>
                  </div>
                  <div className="borrow-actions">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApproveBorrow(record.id)}
                      disabled={loadingId === record.id}
                    >
                      {loadingId === record.id ? 'Đang xử lý...' : 'Phê duyệt'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'return' && (
        <div className="tab-content">
          {pendingReturns.length === 0 ? (
            <p className="empty-state">Không có yêu cầu trả sách đang chờ phê duyệt</p>
          ) : (
            <div className="borrow-list">
              {pendingReturns.map((record) => (
                <div key={record.id} className="borrow-card">
                  <div className="borrow-info">
                    <h3>{getBookTitle(record)}</h3>
                    <p className="borrow-details">
                      <strong>Người mượn:</strong> {getBorrowerInfo(record)}
                    </p>
                    <p className="borrow-details">
                      <strong>Ngày mượn:</strong> {record.borrowDate}
                    </p>
                    <p className="borrow-details">
                      <strong>Hạn trả:</strong> {record.dueDate}
                    </p>
                    {record.returnDate && (
                      <p className="borrow-details">
                        <strong>Ngày trả:</strong> {record.returnDate}
                      </p>
                    )}
                    {record.penalty && (
                      <p className="borrow-details penalty">
                        <strong>Phạt trễ hạn:</strong> {record.penalty.toLocaleString('vi-VN')}đ
                      </p>
                    )}
                    <p className={`status status-${record.status}`}>
                      {record.status === 'pending_return_approval' ? 'Chờ phê duyệt trả' : record.status}
                    </p>
                  </div>
                  <div className="borrow-actions">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApproveReturn(record.id)}
                      disabled={loadingId === record.id}
                    >
                      {loadingId === record.id ? 'Đang xử lý...' : 'Phê duyệt'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
