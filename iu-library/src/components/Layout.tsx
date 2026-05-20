import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'
import './Layout.css'

const NAV_ITEMS = [
  { label: 'THƯ VIỆN', path: '/dashboard' },
  { label: 'MƯỢN / TRẢ', path: '/dashboard#borrow' },
  { label: 'ĐẶT TRƯỚC', path: '/dashboard#orders' },
  { label: 'LỊCH SỬ', path: '/dashboard#history' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="iu-app">
      <div className="iu-utility-bar">
        <div className="iu-utility-bar__inner">
          <Link to="/dashboard">IU Library Portal</Link>
          <span>|</span>
          <a href="https://hcmiu.edu.vn" target="_blank" rel="noreferrer">
            HCMIU
          </a>
          <span>|</span>
          <span>Student Email</span>
          {user && (
            <>
              <span className="iu-utility-bar__spacer" />
              <span className="iu-utility-bar__user">
                {user.name} ({user.studentId})
              </span>
              <button type="button" className="iu-utility-bar__logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>

      <header className="iu-header">
        <div className="iu-header__inner">
          <Link to="/dashboard">
            <Logo />
          </Link>
        </div>
      </header>

      <nav className="iu-nav">
        <div className="iu-nav__inner">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} className="iu-nav__link">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

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
