import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  Compass,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Shield,
  Star,
  User,
  Users,
  Wrench,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { getRequests } from '../../services/requests'
import UserAvatar from '../ui/UserAvatar'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/skills', label: 'My Skills', icon: BookOpen },
  { to: '/discover', label: 'Discover Skills', icon: Compass },
  { to: '/requests', label: 'Exchange Requests', icon: ArrowLeftRight, badge: 'requests' },
  { to: '/messages', label: 'Messages', icon: MessageSquareText },
  { to: '/sessions', label: 'Sessions', icon: CalendarClock },
]

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Admin Overview', icon: Shield, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/skills', label: 'Skills', icon: Wrench },
  { to: '/admin/exchanges', label: 'Exchanges', icon: ArrowLeftRight },
  { to: '/admin/sessions', label: 'Sessions', icon: CalendarClock },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // When the user picks a destination on mobile, close the drawer.
  const handleNavigate = () => onClose?.()

  const renderNavItems = (items) =>
    items.map(({ to, label, icon: Icon, end, badge }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        onClick={handleNavigate}
        className={({ isActive }) =>
          `group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium leading-[22px] transition duration-150 ${
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`
        }
      >
        <span className="flex items-center gap-3">
          <Icon
            className="h-4.5 w-4.5 text-gray-400 transition group-hover:text-gray-600"
            strokeWidth={2}
          />
          {label}
        </span>
        {badge === 'requests' && pendingCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-bold text-white">
            {pendingCount}
          </span>
        )}
      </NavLink>
    ))

  const navContent = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {renderNavItems(NAV_ITEMS)}

        {user?.role === 'admin' && (
          <>
            <p className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Admin
            </p>
            {renderNavItems(ADMIN_NAV_ITEMS)}
          </>
        )}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <UserAvatar name={user?.name} profileImage={user?.profileImage} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center border-b border-gray-100 px-5">
              <span className="text-lg font-semibold text-ink">Skill Exchange</span>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar