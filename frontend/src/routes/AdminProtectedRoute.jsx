import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

// Wraps pages that require the admin role.
const AdminProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminProtectedRoute