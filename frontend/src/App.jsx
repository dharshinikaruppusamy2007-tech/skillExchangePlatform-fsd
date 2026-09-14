import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Skills from './pages/Skills'
import AddSkill from './pages/Skills/AddSkill'
import SkillDetails from './pages/Skills/SkillDetails'
import EditSkill from './pages/Skills/EditSkill'
import Discover from './pages/Discover'
import Requests from './pages/Requests'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import Sessions from './pages/Sessions'
import SessionDetails from './pages/Sessions/SessionDetails'
import Admin from './pages/admin/Admin'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSkills from './pages/admin/AdminSkills'
import AdminExchanges from './pages/admin/AdminExchanges'
import AdminSessions from './pages/admin/AdminSessions'
import AdminReviews from './pages/admin/AdminReviews'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminProtectedRoute from './routes/AdminProtectedRoute'

const App = () => {
  return (
    <Routes>
      {/* Public auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Dashboard (Module 2/redesign) - landing page after login */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* User profile (Module 2) */}
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

      {/* Conversations (Module 5) */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:userId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Sessions */}
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute>
            <SessionDetails />
          </ProtectedRoute>
        }
      />

      {/* Admin (Module 6) */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminUsers />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <AdminProtectedRoute>
            <AdminSkills />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/exchanges"
        element={
          <AdminProtectedRoute>
            <AdminExchanges />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <AdminProtectedRoute>
            <AdminSessions />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AdminProtectedRoute>
            <AdminReviews />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminProtectedRoute>
            <AdminAnalytics />
          </AdminProtectedRoute>
        }
      />

      {/* Fallback: unauthenticated users go to login, otherwise to dashboard. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App