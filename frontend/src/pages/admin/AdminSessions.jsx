import { useCallback, useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import SkillTag from '../../components/ui/SkillTag'
import UserAvatar from '../../components/ui/UserAvatar'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import Toast from '../../components/ui/Toast'
import { SESSION_STATUSES } from '../../constants'
import { getAdminSessions } from '../../services/admin'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const AdminSessions = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = status ? { status } : {}
      const res = await getAdminSessions(params)
      setItems(res.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load sessions.')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  return (
    <AppLayout>
      <PageHeader
        title="Admin · Sessions"
        subtitle="All scheduled sessions across the platform."
      />

      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Filter */}
      <div className="mt-6 flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">All statuses</option>
          {SESSION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={5} />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={CalendarClock}
            title="No sessions found"
            message="No sessions match this filter."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">Skill</th>
                <th className="px-5 py-3 font-semibold">Mentor</th>
                <th className="px-5 py-3 font-semibold">Learner</th>
                <th className="px-5 py-3 font-semibold">Mode</th>
                <th className="px-5 py-3 font-semibold">When</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <span className="font-semibold text-ink">{item.skill?.skillName || '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={item.mentor?.name}
                        profileImage={item.mentor?.profileImage}
                        size="xs"
                      />
                      <span className="text-gray-600">{item.mentor?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={item.learner?.name}
                        profileImage={item.learner?.profileImage}
                        size="xs"
                      />
                      <span className="text-gray-600">{item.learner?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <SkillTag tone={item.meetingMode}>{item.meetingMode}</SkillTag>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {formatDate(item.scheduledDate)} · {item.startTime}
                    <span className="ml-1 text-xs text-gray-400">({item.duration} min)</span>
                  </td>
                  <td className="px-5 py-3">
                    <SkillTag tone={item.status}>{item.status}</SkillTag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}

export default AdminSessions