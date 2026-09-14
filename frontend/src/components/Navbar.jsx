import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`

// Shared header for the authenticated areas of the app.
const Navbar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/skills" className="text-lg font-bold text-gray-900">
          Skill Exchange
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          <NavLink to="/skills" className={navLinkClass}>
            Skills
          </NavLink>
          <NavLink to="/discover" className={navLinkClass}>
            Discover
          </NavLink>
          <NavLink to="/requests" className={navLinkClass}>
            Exchange Requests
          </NavLink>
          <NavLink to="/messages" className={navLinkClass}>
            Messages
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            Profile
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar