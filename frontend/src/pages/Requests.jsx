import { useEffect, useState } from 'react'

import Avatar from '../components/Avatar'
import Navbar from '../components/Navbar'
import { getRequests, updateRequest } from '../services/requests'

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

const STATUS_BADGES = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const formatDateTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const SkillChips = ({ skill }) => (
  <div className="mt-2 flex flex-wrap items-center gap-2">
    <span className="text-sm font-medium text-gray-800">
      {skill?.skillName || 'a skill'}
    </span>
    {skill?.category && (
      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        {skill.category}
      </span>
    )}
    {skill?.proficiency && (
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {skill.proficiency}
      </span>
    )}
  </div>
)

const ReceivedCard = ({ request, onUpdate }) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleUpdate = async (status) => {
    setUpdating(true)
    setError('')
    setSuccess('')
    try {
      await updateRequest(request._id, { status })
      onUpdate(request._id, status)
      setSuccess(status === 'accepted' ? 'Request accepted.' : 'Request rejected.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the request.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <Avatar name={request.sender?.name} profileImage={request.sender?.profileImage} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {request.sender?.name || 'Unknown user'}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  STATUS_BADGES[request.status] || STATUS_BADGES.pending
                }`}
              >
                {STATUS_LABELS[request.status] || request.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">wants you to teach</p>
            <SkillChips skill={request.skill} />
            {request.message && (
              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {request.message}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Sent {formatDateTime(request.createdAt)}
            </p>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => handleUpdate('accepted')}
              disabled={updating}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => handleUpdate('rejected')}
              disabled={updating}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        )}
      </div>
      {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}

const SentCard = ({ request }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <Avatar name={request.receiver?.name} profileImage={request.receiver?.profileImage} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            {request.receiver?.name || 'Unknown user'}
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              STATUS_BADGES[request.status] || STATUS_BADGES.pending
            }`}
          >
            {STATUS_LABELS[request.status] || request.status}
          </span>
        </div>
        <SkillChips skill={request.skill} />
        {request.message && (
          <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {request.message}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          Sent {formatDateTime(request.createdAt)}
        </p>
      </div>
    </div>
  </div>
)

const ListSection = ({ title, subtitle, children, empty }) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    <div className="mt-4 space-y-4">
      {children.length ? (
        children
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">{empty}</p>
        </div>
      )}
    </div>
  </section>
)

const Requests = () => {
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await getRequests()
        if (active) {
          setReceived(res.data.received || [])
          setSent(res.data.sent || [])
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || 'Failed to load requests. Please try again.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const handleUpdate = (requestId, status) => {
    setReceived((prev) =>
      prev.map((request) =>
        request._id === requestId ? { ...request, status } : request
      )
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900">Exchange Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Accept or reject requests from people who want to learn from you. Accepted
          exchanges unlock chat in Messages.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <ListSection
          title="Received Requests"
          subtitle={`${received.length} request${received.length === 1 ? '' : 's'}`}
          empty="You have no received requests yet. People will appear here when they send you an exchange request."
        >
          {received.map((request) => (
            <ReceivedCard key={request._id} request={request} onUpdate={handleUpdate} />
          ))}
        </ListSection>

        <ListSection
          title="Requests I Sent"
          subtitle={`${sent.length} request${sent.length === 1 ? '' : 's'}`}
          empty="You have not sent any exchange requests yet. Find skills to request on the Discover page."
        >
          {sent.map((request) => (
            <SentCard key={request._id} request={request} />
          ))}
        </ListSection>
      </main>
    </div>
  )
}

export default Requests