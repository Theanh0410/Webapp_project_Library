import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'
import './Layout.css'

const STUDENT_LECTURER_NAV = [
  { label: 'THƯ VIỆN', path: '/dashboard' },
  { label: 'MƯỢN / TRẢ', path: '/dashboard#borrow' },
  { label: 'ĐẶT TRƯỚC', path: '/dashboard#orders' },
  { label: 'LỊCH SỬ', path: '/dashboard#history' },
]

const STAFF_NAV = [
  { label: 'QUẢN LÝ SÁCH', path: '/dashboard#books' },
  { label: 'TẠO HỒ SƠ MƯỢN', path: '/dashboard#borrows' },
  { label: 'PHÊ DUYỆT MƯỢN', path: '/dashboard#approvals' },
  { label: 'XÁC NHẬN TRẢ', path: '/dashboard#returns' },
  { label: 'SÁCH QUÁ HẠN', path: '/dashboard#overdue' },
]

const MANAGER_NAV = [
  { label: 'QUẢN LÝ NHÂN VIÊN', path: '/dashboard#staff' },
  { label: 'PHÂN CÔNG CA', path: '/dashboard#shifts' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  let navItems = STUDENT_LECTURER_NAV
  if (user?.role === 'staff') navItems = STAFF_NAV
  else if (user?.role === 'manager') navItems = MANAGER_NAV

  return (
    <div className="iu-app">
      <div className="iu-top">
        <div className="iu-top__inner">
          <Link to="/dashboard" className="iu-top__logo">
            <Logo />
          </Link>

          <div className="iu-top__content">
            <div className="iu-utility-bar">
              <div className="iu-utility-bar__inner">
                <a href="#">IU Library Portal</a>
                <span>|</span>
                <a href="https://hcmiu.edu.vn" target="_blank" rel="noreferrer">
                  HCMIU
                </a>
                <span>|</span>
                <a href="#">Student Email</a>

                <span className="iu-utility-bar__spacer" />

                {user && (
                  <>
                    <span className="iu-utility-bar__user">
                      {user.full_name} ({user.username})
                    </span>
                    <button className="iu-utility-bar__logout" onClick={logout}>
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </div>

            <nav className="iu-nav">
              <div className="iu-nav__inner">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} className="iu-nav__link">
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      <main className="iu-main">
        <Outlet />
      </main>

      <footer className="iu-footer">
        <p>© International University — HCM City National University</p>
        <p>Office of Student Services · Library Management System</p>
      </footer>
    </div>
  )
}

