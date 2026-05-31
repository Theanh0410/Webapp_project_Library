import { FormEvent, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import './Dashboard.css'

const API_URL = 'http://localhost:5000/api'
const TOKEN_STORAGE_KEY = 'iu-library-token'

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

interface StaffMember {
  id: string
  full_name: string
  email: string
  username: string
  shifts: string[]
  status: 'active' | 'inactive'
}

export function ManagerDashboard() {
  const { user } = useAuth()
  const { users } = useLibrary()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<'staff' | 'shifts'>('staff')
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [staffList, setStaffList] = useState<StaffMember[]>([])

  const loadStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/staff`, {
        headers: getAuthHeaders(),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể tải danh sách nhân viên', 'warn')
        return
      }

      setStaffList(data)
    } catch (error) {
      console.error('Load staff error:', error)
      showToast('Không thể kết nối server', 'warn')
    }
  }

  useEffect(() => {
    const hash = location.hash.replace('#', '')

    if (hash === 'staff' || hash === 'shifts') {
      setActiveTab(hash)
    } else {
      setActiveTab('staff')
    }
  }, [location.hash])

    useEffect(() => {
      loadStaff()
    }, [])

    const [newStaff, setNewStaff] = useState({
      full_name: '',
      email: '',
      username: '',
    })

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const AVAILABLE_SHIFTS = [
    'Monday Morning',
    'Monday Afternoon',
    'Tuesday Morning',
    'Tuesday Afternoon',
    'Wednesday Morning',
    'Wednesday Afternoon',
    'Thursday Morning',
    'Thursday Afternoon',
    'Friday Morning',
    'Friday Afternoon',
    'Saturday Morning',
    'Saturday Afternoon',
    'Sunday Morning',
    'Sunday Afternoon',
  ]

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault()

    if (!newStaff.full_name || !newStaff.email || !newStaff.username) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warn')
      return
    }

    try {
      const res = await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          full_name: newStaff.full_name,
          email: newStaff.email,
          username: newStaff.username,
          position: 'Library Staff',
          password: '123456',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể thêm nhân viên', 'warn')
        return
      }

      await loadStaff()

      showToast('Nhân viên mới đã được thêm thành công', 'info')
      setNewStaff({ full_name: '', email: '', username: '' })
      setShowAddStaff(false)
    } catch (error) {
      console.error('Add staff error:', error)
      showToast('Không thể kết nối server', 'warn')
    }
  }

  const handleRemoveStaff = async (staffId: string) => {
    try {
      const res = await fetch(`${API_URL}/staff/${staffId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể xóa nhân viên', 'warn')
        return
      }

      await loadStaff()
      showToast('Nhân viên đã bị xóa', 'info')
    } catch (error) {
      console.error('Remove staff error:', error)
      showToast('Không thể kết nối server', 'warn')
    }
  }

  const handleToggleStaffStatus = async (staffId: string) => {
    const staff = staffList.find((s) => s.id === staffId)

    if (!staff) {
      showToast('Không tìm thấy nhân viên', 'warn')
      return
    }

    try {
      const res = await fetch(`${API_URL}/staff/${staffId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_active: staff.status !== 'active',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể cập nhật trạng thái', 'warn')
        return
      }

      await loadStaff()
      showToast('Cập nhật trạng thái nhân viên thành công', 'info')
    } catch (error) {
      console.error('Toggle staff status error:', error)
      showToast('Không thể kết nối server', 'warn')
    }
  }

  const handleAssignShifts = async (e: FormEvent) => {
    e.preventDefault()

    if (!selectedStaffId) {
      showToast('Vui lòng chọn nhân viên', 'warn')
      return
    }

    try {
      const res = await fetch(`${API_URL}/staff/${selectedStaffId}/shifts`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          shifts: selectedShifts,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.message || 'Không thể cập nhật ca làm việc', 'warn')
        return
      }

      await loadStaff()

      showToast('Lịch ca làm việc đã được cập nhật', 'info')
      setSelectedStaffId(null)
      setSelectedShifts([])
    } catch (error) {
      console.error('Assign shifts error:', error)
      showToast('Không thể kết nối server', 'warn')
    }
  }

  const handleShiftToggle = (shift: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    )
  }

  const activeStaffCount = staffList.filter((s) => s.status === 'active').length
  const staffWithShifts = staffList.filter((s) => s.shifts.length > 0).length

  if (!user) return null

  return (
    <>
      <section className="dashboard-hero">
        <span className="user-badge">Quản lý · {user.full_name}</span>
        <h1>THƯ VIỆN - QUẢN LÝ NHÂN SỰ</h1>
        <p>Quản lý nhân viên và phân công ca làm việc</p>
      </section>

      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="manager-dashboard">
        <div className="manager-stats">
          <div className="stat-card">
            <span className="stat-value">{activeStaffCount}</span>
            <span className="stat-label">Nhân viên hoạt động</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{staffWithShifts}</span>
            <span className="stat-label">Nhân viên có lịch ca</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{staffList.length}</span>
            <span className="stat-label">Tổng nhân viên</span>
          </div>
        </div>

        {/* Staff Management */}
        {activeTab === 'staff' && (
          <div id="staff" className="manager-section">
            <h2>Quản lý nhân viên</h2>
            <button
              className="btn-primary"
              onClick={() => setShowAddStaff(!showAddStaff)}
            >
              {showAddStaff ? '✕ Hủy' : '✚ Thêm nhân viên'}
            </button>

            {showAddStaff && (
              <form className="staff-form" onSubmit={handleAddStaff}>
                <label>
                  Họ và tên
                  <input
                    value={newStaff.full_name}
                    onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                    placeholder="Nhập tên nhân viên"
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="example@hcmiu.edu.vn"
                    required
                  />
                </label>
                <label>
                  Mã nhân viên
                  <input
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    placeholder="VD: STAFF002"
                    required
                  />
                </label>
                <button type="submit" className="btn-primary">
                  Thêm nhân viên
                </button>
              </form>
            )}

            {staffList.length === 0 ? (
              <p className="empty-state">Chưa có nhân viên nào</p>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Mã nhân viên</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Lịch ca</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.username}</td>
                      <td>{staff.full_name}</td>
                      <td>{staff.email}</td>
                      <td>
                        <span className="shifts-badge">
                          {staff.shifts.length > 0 ? `${staff.shifts.length} ca` : 'Chưa phân công'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${staff.status}`}>
                          {staff.status === 'active' ? '✓ Hoạt động' : '✕ Không hoạt động'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-small"
                          onClick={() => handleToggleStaffStatus(staff.id)}
                        >
                          {staff.status === 'active' ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleRemoveStaff(staff.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Shift Assignment */}
        {activeTab === 'shifts' && (
          <div id="shifts" className="manager-section">
            <h2>Phân công ca làm việc</h2>
            <form className="shift-form" onSubmit={handleAssignShifts}>
              <label>
                Chọn nhân viên
                <select
                  value={selectedStaffId || ''}
                  onChange={(e) => {
                    const staffId = e.target.value
                    setSelectedStaffId(staffId)
                    const staff = staffList.find((s) => s.id === staffId)
                    setSelectedShifts(staff?.shifts || [])
                  }}
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList
                    .filter((s) => s.status === 'active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name}
                      </option>
                    ))}
                </select>
              </label>

              <fieldset>
                <legend>Chọn ca làm việc</legend>
                {AVAILABLE_SHIFTS.map((shift) => (
                  <label key={shift} className="shift-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedShifts.includes(shift)}
                      onChange={() => handleShiftToggle(shift)}
                    />
                    {shift}
                  </label>
                ))}
              </fieldset>

              <button type="submit" className="btn-primary">
                Cập nhật lịch ca
              </button>
            </form>

            <h3>Lịch ca hiện tại</h3>
            {staffList.filter((s) => s.shifts.length > 0).length === 0 ? (
              <p className="empty-state">Chưa có ca làm việc nào được phân công</p>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Lịch ca</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList
                    .filter((s) => s.shifts.length > 0)
                    .map((staff) => (
                      <tr key={staff.id}>
                        <td>{staff.full_name}</td>
                        <td>
                          <div className="shifts-list">
                            {staff.shifts.map((shift) => (
                              <span key={shift} className="shift-tag">
                                {shift}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}
