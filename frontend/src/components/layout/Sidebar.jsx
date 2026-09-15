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
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/skills', label: 'My Skills', icon: BookOpen },
  { to: '/discover', label: 'Discover Skills', icon: Compass },
  { to: '/requests', label: 'Exchange Requests', icon: ArrowLeftRight, badge: 'requests' },
  { to: '/messages', label: 'Messages', icon: MessageSquareText },
  { to: '/sessions', label: 'Sessions', icon: CalendarClock },
  { to: '/profile', label: 'Profile', icon: User },
]

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: Shield, end: true },
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

  const isAdmin = (user?.role || '').toString().trim().toLowerCase() === 'admin'

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
              ? 'bg-sidebar-active text-white'
              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="flex min-w-0 items-center gap-3">
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition ${
                  isActive
                    ? 'text-indigo-200'
                    : 'text-sidebar-text group-hover:text-white'
                }`}
                strokeWidth={2}
              />
              <span className="truncate">{label}</span>
            </span>
            {badge === 'requests' && pendingCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </>
        )}
      </NavLink>
    ))

  const navContent = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {renderNavItems(NAV_ITEMS)}

        {isAdmin && (
          <>
            <p className="px-3 pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wider text-sidebar-label">
              Admin
            </p>
            {renderNavItems(ADMIN_NAV_ITEMS)}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-soft p-3">
          <UserAvatar name={user?.name} profileImage={user?.profileImage} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-text">{user?.name}</p>
            <p className="truncate text-xs text-sidebar-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-muted transition hover:bg-red-500/15 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  const brand = (
    <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
      <span className="truncate text-lg font-semibold tracking-tight text-white">
        Skill Exchange
      </span>
      <span className="ml-2 shrink-0 rounded-full bg-primary-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-300">
        Platform
      </span>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        {brand}
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-2xl">
            {brand}
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar