import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'

import UserAvatar from '../ui/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { getRequests } from '../../services/requests'

// Top header: mobile menu, logo, global search, notifications and profile.
const Header = ({ onOpenMenu }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    let active = true
    getRequests()
      .then((res) => {
        if (active) {
          const count = (res.data.received || []).filter(
            (r) => r.status === 'pending'
          ).length
          setPendingCount(count)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const value = query.trim()
    navigate(value ? `/discover?search=${encodeURIComponent(value)}` : '/discover')
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center lg:flex">
          <span className="text-lg font-semibold tracking-tight text-ink">Skill Exchange</span>
          <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
            Platform
          </span>
        </div>

        {/* Global search */}
        <form onSubmit={handleSearch} className="ml-auto flex max-w-sm flex-1 lg:mx-auto">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills or users..."
              aria-label="Search skills or users"
              className="w-full rounded-full border border-gray-200 bg-canvas py-2 pl-9 pr-4 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/requests')}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-gray-100"
          >
            <UserAvatar name={user?.name} profileImage={user?.profileImage} size="sm" />
            <span className="hidden max-w-28 truncate text-sm font-semibold text-ink md:block">
              {user?.name?.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header