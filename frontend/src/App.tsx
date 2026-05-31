import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'
import { LibraryProvider } from './context/LibraryContext'
import { Dashboard } from './pages/Dashboard'
import { StaffDashboard } from './pages/StaffDashboard'
import { ManagerDashboard } from './pages/ManagerDashboard'
import { ApprovalDashboard } from './pages/ApprovalDashboard'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <LibraryProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardRouter />} />
        </Route>
        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ApprovalDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </LibraryProvider>
  )
}

function DashboardRouter() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case 'staff':
      return <StaffDashboard />
    case 'manager':
      return <ManagerDashboard />
    default:
      return <Dashboard />
  }
}

