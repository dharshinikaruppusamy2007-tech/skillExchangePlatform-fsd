import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import Toast from '../../components/ui/Toast'
import { getAdminAnalytics } from '../../services/admin'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const formatMonth = (value) => {
  const [y, m] = String(value).split('-')
  const month = MONTHS[Number(m) - 1] || m
  return `${month} '${String(y).slice(2)}`
}

const STATUS_COLORS = {
  pending: 'bg-amber-400',
  accepted: 'bg-emerald-400',
  rejected: 'bg-red-400',
  cancelled: 'bg-slate-400',
  Upcoming: 'bg-sky-400',
  Completed: 'bg-emerald-400',
  Cancelled: 'bg-slate-400',
}

const BarList = ({ data, colorFor }) => {
  if (!data || data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-400">
        Not enough data available
      </p>
    )
  }
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="space-y-2.5">
      {data.map((row, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-600">{row._id || row.label || '—'}</span>
            <span className="font-semibold text-ink">{row.count}</span>
          </div>
          <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${colorFor ? colorFor(row) : 'bg-primary-500'}`}
              style={{ width: `${Math.max((row.count / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const AdminAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminAnalytics()
      .then((res) => {
        if (active) setData(res.data)
      })
      .catch(() => {
        if (active) setError('Could not load analytics.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const usersByMonth = (data?.usersByMonth || []).map((row) => ({
    ...row,
    label: formatMonth(row._id),
  }))

  const requestsByStatus = (data?.requestsByStatus || []).map((row) => ({
    ...row,
    label: row._id,
  }))

  const sessionsByStatus = (data?.sessionsByStatus || []).map((row) => ({
    ...row,
    label: row._id,
  }))

  const ratingDistribution = (data?.ratingDistribution || []).map((row) => ({
    ...row,
    label: `${row._id} star${row._id > 1 ? 's' : ''}`,
  }))

  return (
    <AppLayout>
      <PageHeader
        title="Admin · Analytics"
        subtitle="Real usage trends from the live database."
      />

      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={4} />
        </div>
      ) : data && !error ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Users by month */}
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">New Members per Month</h2>
            <p className="mt-0.5 text-xs text-gray-400">User registrations over time</p>
            <div className="mt-4">
              <BarList data={usersByMonth} colorFor={() => 'bg-primary-500'} />
            </div>
          </section>

          {/* Skills by category */}
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Skills by Category</h2>
            <p className="mt-0.5 text-xs text-gray-400">Where members offer and seek skills</p>
            <div className="mt-4">
              <BarList data={data.skillsByCategory || []} colorFor={() => 'bg-sky-500'} />
            </div>
          </section>

          {/* Rating distribution */}
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Ratings Distribution</h2>
            <p className="mt-0.5 text-xs text-gray-400">Reviews grouped by star rating</p>
            <div className="mt-4">
              <BarList data={ratingDistribution} colorFor={() => 'bg-amber-400'} />
            </div>
          </section>

          {/* Requests & sessions by status */}
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Exchanges & Sessions</h2>
            <p className="mt-0.5 text-xs text-gray-400">Requests and sessions grouped by status</p>
            <div className="mt-4 space-y-5">
              <BarList data={requestsByStatus} colorFor={(r) => STATUS_COLORS[r._id]} />
              <BarList data={sessionsByStatus} colorFor={(r) => STATUS_COLORS[r._id]} />
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={BarChart3}
            title="No analytics data"
            message="Data will appear here as members join and use the platform."
          />
        </div>
      )}
    </AppLayout>
  )
}

export default AdminAnalytics