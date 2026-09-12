import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

// Wraps pages that require authentication.
// While the session is being restored, show a loading state instead of the page.
const ProtectedRoute = ({ children }) => {
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

  return children
}

export default ProtectedRoute