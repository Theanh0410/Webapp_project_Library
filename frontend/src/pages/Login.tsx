import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { DEMO_PASSWORD } from '../data/mockData'
import './Auth.css'

export function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showRoleInfo, setShowRoleInfo] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const err = login(studentId, password)
    if (err) {
      setError(err)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-page__utility">
        <Link to="/login">Đăng nhập</Link>
      </div>
      <header className="auth-page__header">
        <Logo />
      </header>
      <section className="auth-page__hero">
        <h1>THƯ VIỆN IU</h1>
        <p>Hệ thống quản lý mượn — trả sách</p>
      </section>
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            Mã sinh viên / Giảng viên
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="VD: IT12345"
              required
              autoComplete="username"
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="auth-btn">
            Đăng nhập
          </button>
        </form>
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
        <div className="auth-demo">
          <strong>Tài khoản demo:</strong>
          <br />
          Sinh viên: <code>IT12345</code> / <code>{DEMO_PASSWORD}</code>
          <br />
          Giảng viên: <code>LEC8901</code> / <code>{DEMO_PASSWORD}</code>
          <br />
          <button 
            type="button" 
            className="demo-toggle"
            onClick={() => setShowRoleInfo(!showRoleInfo)}
          >
            {showRoleInfo ? '▼' : '▶'} Tài khoản khác
          </button>
          {showRoleInfo && (
            <>
              <br />
              Nhân viên: <code>STAFF001</code> / <code>{DEMO_PASSWORD}</code>
              <br />
              Quản lý: <code>MGR001</code> / <code>{DEMO_PASSWORD}</code>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

