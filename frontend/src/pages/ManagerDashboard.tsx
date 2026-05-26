import { FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import './Dashboard.css'

interface StaffMember {
  id: string
  name: string
  email: string
  studentId: string
  shifts: string[]
  status: 'active' | 'inactive'
}

export function ManagerDashboard() {
  const { user } = useAuth()
  const { users } = useLibrary()

  const [activeTab, setActiveTab] = useState<'staff' | 'shifts'>('staff')
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warn' } | null>(null)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'u3',
      name: 'Lê Thu Hương',
      email: 'huong.le@hcmiu.edu.vn',
      studentId: 'STAFF001',
      shifts: ['Morning (8AM-12PM)', 'Afternoon (1PM-5PM)'],
      status: 'active',
    },
  ])

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    studentId: '',
  })

  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])

  if (!user) return null

  const showToast = (msg: string, type: 'info' | 'warn' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const AVAILABLE_SHIFTS = [
    'Morning (8AM-12PM)',
    'Afternoon (1PM-5PM)',
    'Evening (5PM-8PM)',
  ]

  const handleAddStaff = (e: FormEvent) => {
    e.preventDefault()
    if (!newStaff.name || !newStaff.email || !newStaff.studentId) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warn')
      return
    }

    const staff: StaffMember = {
      id: `staff_${Date.now()}`,
      ...newStaff,
      shifts: [],
      status: 'active',
    }

    setStaffList((prev) => [...prev, staff])
    showToast('Nhân viên mới đã được thêm thành công', 'info')
    setNewStaff({ name: '', email: '', studentId: '' })
    setShowAddStaff(false)
  }

  const handleRemoveStaff = (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId))
    showToast('Nhân viên đã bị xóa', 'info')
  }

  const handleToggleStaffStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s,
      ),
    )
    showToast('Cập nhật trạng thái nhân viên thành công', 'info')
  }

  const handleAssignShifts = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedStaffId) {
      showToast('Vui lòng chọn nhân viên', 'warn')
      return
    }

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaffId
          ? { ...s, shifts: selectedShifts }
          : s,
      ),
    )
    showToast('Lịch ca làm việc đã được cập nhật', 'info')
    setSelectedStaffId(null)
    setSelectedShifts([])
  }

  const handleShiftToggle = (shift: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    )
  }

  const activeStaffCount = staffList.filter((s) => s.status === 'active').length
  const staffWithShifts = staffList.filter((s) => s.shifts.length > 0).length

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

        <div className="manager-tabs">
          <button
            className={`manager-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            👥 Quản lý nhân viên
          </button>
          <button
            className={`manager-tab ${activeTab === 'shifts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shifts')}
          >
            📅 Phân công ca làm việc
          </button>
        </div>

        {/* Staff Management */}
        {activeTab === 'staff' && (
          <div className="manager-section">
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
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
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
                    value={newStaff.studentId}
                    onChange={(e) => setNewStaff({ ...newStaff, studentId: e.target.value })}
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
                      <td>{staff.studentId}</td>
                      <td>{staff.name}</td>
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
          <div className="manager-section">
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
                        {s.name}
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
                        <td>{staff.name}</td>
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
