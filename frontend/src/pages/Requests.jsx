import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, CalendarClock, Check, Eye, XCircle } from 'lucide-react'

import { cancelRequest, getRequests, updateRequest } from '../services/requests'
import { createSession, getUpcomingSessions } from '../services/sessions'
import AppLayout from '../components/layout/AppLayout'
import PageHeader from '../components/ui/PageHeader'
import UserAvatar from '../components/ui/UserAvatar'
import SkillTag from '../components/ui/SkillTag'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Toast from '../components/ui/Toast'
import ScheduleSessionModal from '../components/sessions/ScheduleSessionModal'
import { useAuth } from '../context/AuthContext'

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const statusLabel = (status) => (status === 'pending' ? 'pending' : status)

const Requests = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('received')
  const [sent, setSent] = useState([])
  const [received, setReceived] = useState([])
  const [scheduledRequestIds, setScheduledRequestIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const [scheduleTarget, setScheduleTarget] = useState(null)
  const [scheduling, setScheduling] = useState(false)

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await getRequests()
      setSent(res.data.sent || [])
      setReceived(res.data.received || [])
      setError('')
      try {
        const sessRes = await getUpcomingSessions()
        const ids = (sessRes.data || []).map((s) => String(s.exchangeRequest?._id || s.exchangeRequest))
        setScheduledRequestIds(ids)
      } catch {
        setScheduledRequestIds([])
      }
    } catch {
      setError('Could not load your requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleDecision = async (request, status) => {
    setBusyId(request._id)
    try {
      await updateRequest(request._id, { status })
      if (status === 'rejected') setRejectTarget(null)
      setReceived((prev) =>
        prev.map((r) =>
          r._id === request._id ? { ...r, status } : r
        )
      )
      setToast({
        type: 'success',
        message:
          status === 'accepted'
            ? `You accepted ${request.sender?.name}'s request. You can now schedule a session.`
            : 'The request was rejected.',
      })
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not update the request.',
      })
    } finally {
      setBusyId('')
    }
  }

  const handleCancelRequest = async () => {
    if (!cancelTarget) return
    setBusyId(cancelTarget._id)
    try {
      await cancelRequest(cancelTarget._id)
      setSent((prev) => prev.map((r) => (r._id === cancelTarget._id ? { ...r, status: 'cancelled' } : r)))
      setToast({ type: 'success', message: 'Your request was cancelled.' })
      setCancelTarget(null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not cancel the request.',
      })
      setCancelTarget(null)
    } finally {
      setBusyId('')
    }
  }

  const handleSchedule = async (data) => {
    setScheduling(true)
    try {
      await createSession(data)
      setScheduleTarget(null)
      setToast({ type: 'success', message: 'Session scheduled successfully.' })
      loadRequests()
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not schedule the session.',
      })
    } finally {
      setScheduling(false)
    }
  }

  const renderRequest = (request, direction) => {
    const isReceived = direction === 'received'
    const other = isReceived ? request.sender : request.receiver
    const pendingActions = isReceived && request.status === 'pending'
    const canCancel = !isReceived && request.status === 'pending'
    const isAccepted = request.status === 'accepted'
    const hasSession = scheduledRequestIds.includes(String(request._id))

    return (
      <div
        key={request._id}
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <UserAvatar name={other?.name} profileImage={other?.profileImage} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-700">
                {isReceived ? (
                  <>
                    <span className="font-semibold text-ink">{other?.name}</span> wants to learn
                  </>
                ) : (
                  <>
                    You requested to learn from{' '}
                    <span className="font-semibold text-ink">{other?.name}</span>
                  </>
                )}{' '}
                <span className="font-semibold text-ink">{request.skill?.skillName}</span>
              </p>
              <SkillTag tone={statusLabel(request.status)}>{request.status}</SkillTag>
            </div>

            {request.skill?.category && (
              <div className="mt-1.5 flex gap-1.5">
                <SkillTag tone="category">{request.skill.category}</SkillTag>
                {request.skill.proficiency && (
                  <SkillTag tone="level">{request.skill.proficiency}</SkillTag>
                )}
                {request.offeredSkill?.skillName && (
                  <SkillTag tone="teach">Offers {request.offeredSkill.skillName}</SkillTag>
                )}
              </div>
            )}

            {request.message && (
              <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                "{request.message}"
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400">{formatDate(request.createdAt)}</p>

            {(pendingActions || canCancel || isAccepted) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pendingActions && (
                  <>
                    <button
                      type="button"
                      disabled={Boolean(busyId)}
                      onClick={() => handleDecision(request, 'accepted')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(busyId)}
                      onClick={() => setRejectTarget(request)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}

                {canCancel && (
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() => setCancelTarget(request)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Request
                  </button>
                )}

                {isAccepted && !hasSession && (
                  <button
                    type="button"
                    onClick={() => setScheduleTarget(request)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Schedule Session
                  </button>
                )}

                {isAccepted && hasSession && (
                  <Link
                    to="/sessions"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
                  >
                    <Eye className="h-4 w-4" />
                    View Session
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const list = tab === 'received' ? received : sent

  const schedulePartner = scheduleTarget
    ? String(scheduleTarget.receiver?._id || scheduleTarget.receiver) === String(user?._id)
      ? scheduleTarget.sender
      : scheduleTarget.receiver
    : null

  return (
    <AppLayout>
      <PageHeader
        title="Exchange Requests"
        subtitle="Review who wants to learn from you and keep track of your sent requests."
      />

      {toast && (
        <div className="mt-6">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: 'received', label: `Received (${received.length})` },
          { key: 'sent', label: `Sent (${sent.length})` },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'bg-primary-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="mt-6">
          <LoadingState rows={3} />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ArrowLeftRight}
            title={tab === 'received' ? 'No requests received yet' : 'No requests sent yet'}
            message={
              tab === 'received'
                ? 'When someone wants to learn from you, it will show up here.'
                : 'When you request an exchange, it will appear here.'
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((request) => renderRequest(request, tab))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject this request?"
        message={`This will decline ${rejectTarget?.sender?.name}'s request to learn ${rejectTarget?.skill?.skillName}.`}
        confirmLabel="Reject Request"
        destructive
        busy={Boolean(busyId)}
        busyLabel="Rejecting..."
        onConfirm={() => rejectTarget && handleDecision(rejectTarget, 'rejected')}
        onCancel={() => setRejectTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this request?"
        message={`Your request to learn ${cancelTarget?.skill?.skillName} will be withdrawn.`}
        confirmLabel="Cancel Request"
        destructive
        busy={Boolean(busyId)}
        busyLabel="Cancelling..."
        onConfirm={handleCancelRequest}
        onCancel={() => setCancelTarget(null)}
      />

      {scheduleTarget && (
        <ScheduleSessionModal
          open
          onClose={() => setScheduleTarget(null)}
          exchangeRequest={scheduleTarget}
          partner={schedulePartner}
          submitting={scheduling}
          onSubmit={handleSchedule}
        />
      )}
    </AppLayout>
  )
}

export default Requests