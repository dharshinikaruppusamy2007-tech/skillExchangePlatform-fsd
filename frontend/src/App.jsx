import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile/Profile'
import ProtectedRoute from './routes/ProtectedRoute'

const App = () => {
  return (
    <Routes>
      {/* Public auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* User profile (Module 2) - replaces the temporary placeholder page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Fallback: after login users land on /profile; unknown routes also go
          there, which redirects to /login when not authenticated */}
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  )
}

export default App