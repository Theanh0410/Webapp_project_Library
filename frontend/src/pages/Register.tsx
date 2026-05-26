import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'lecturer'>('student')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự.')
      return
    }

    const result = await register({ studentId, name, email, password, role })

    if (result.error) {
      setError(result.error)
      return
    }

    navigate(result.redirectTo || '/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-page__utility">
        <Link to="/register">Đăng ký</Link>
      </div>
      <header className="auth-page__header">
        <Logo />
      </header>
      <section className="auth-page__hero">
        <h1>ĐĂNG KÝ THÀNH VIÊN</h1>
        <p>Sinh viên &amp; Giảng viên International University</p>
      </section>
      <div className="auth-card">
        <h2>Tạo tài khoản</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <label>
            Loại tài khoản
            <select value={role} onChange={(e) => setRole(e.target.value as 'student' | 'lecturer')}>
              <option value="student">Sinh viên</option>
              <option value="lecturer">Giảng viên</option>
            </select>
          </label>
          <label>
            Mã sinh viên / Mã giảng viên
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="VD: IT12345"
              required
            />
          </label>
          <label>
            Họ và tên
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.hcmiu.edu.vn"
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button type="submit" className="auth-btn">
            Đăng ký
          </button>
        </form>
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
