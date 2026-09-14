import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile/Profile'
import Skills from './pages/Skills'
import AddSkill from './pages/Skills/AddSkill'
import SkillDetails from './pages/Skills/SkillDetails'
import EditSkill from './pages/Skills/EditSkill'
import Discover from './pages/Discover'
import Requests from './pages/Requests'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
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

      {/* Skill management (Module 3) */}
      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <Skills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills/add"
        element={
          <ProtectedRoute>
            <AddSkill />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills/:id"
        element={
          <ProtectedRoute>
            <SkillDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills/:id/edit"
        element={
          <ProtectedRoute>
            <EditSkill />
          </ProtectedRoute>
        }
      />

      {/* Skill discovery & matching (Module 4) */}
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        }
      />

      {/* Skill exchange requests (Module 4) */}
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />

      {/* Conversations list (Module 5) */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      {/* Chat thread with an accepted exchange partner (Module 5) */}
      <Route
        path="/messages/:userId"
        element={
          <ProtectedRoute>
            <Chat />
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