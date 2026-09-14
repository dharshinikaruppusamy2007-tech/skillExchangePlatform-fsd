import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  Clock,
  Shield,
  Star,
  Users,
  Wrench,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import LoadingState from '../../components/ui/LoadingState'
import Toast from '../../components/ui/Toast'
import { getAdminStats } from '../../services/admin'

const QUICK_LINKS = [
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/skills', label: 'Manage Skills', icon: Wrench },
  { to: '/admin/exchanges', label: 'Exchanges', icon: ArrowLeftRight },
  { to: '/admin/sessions', label: 'Sessions', icon: CalendarClock },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const Admin = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminStats()
      .then((res) => {
        if (active) setStats(res.data)
      })
      .catch(() => {
        if (active) setError('Could not load admin statistics.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <AppLayout>
      <PageHeader
        title="Admin Overview"
        subtitle="Platform-wide statistics for the Skill Exchange community."
      />

      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={3} />
        </div>
      ) : stats ? (
        <>
          <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} accent="primary" />
            <StatCard icon={BookOpen} label="Total Skills" value={stats.totalSkills} accent="sky" />
            <StatCard
              icon={ArrowLeftRight}
              label="Exchange Requests"
              value={stats.totalRequests}
              accent="emerald"
            />
            <StatCard
              icon={Shield}
              label="Total Sessions"
              value={stats.totalSessions}
              accent="amber"
            />
            <StatCard
              icon={Clock}
              label="Completed Sessions"
              value={stats.completedSessions}
              accent="emerald"
            />
            <StatCard
              icon={Star}
              label="Total Reviews"
              value={stats.totalReviews}
              accent="amber"
            />
            <StatCard
              icon={ArrowLeftRight}
              label="Pending Requests"
              value={stats.pendingRequests}
              accent="primary"
            />
            <StatCard
              icon={Star}
              label="Average Rating"
              value={stats.averageRating ? Number(stats.averageRating).toFixed(1) : '—'}
              accent="sky"
            />
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-ink">Manage Platform</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-semibold text-ink">{label}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:text-primary-500" />
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </AppLayout>
  )
}

export default Admin