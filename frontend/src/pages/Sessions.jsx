import { useEffect, useState } from 'react'
import { CalendarClock, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import AppLayout from '../components/layout/AppLayout'
import PageHeader from '../components/ui/PageHeader'
import SessionCard from '../components/sessions/SessionCard'
import ReviewModal from '../components/reviews/ReviewModal'
import SessionEditModal from '../components/sessions/SessionEditModal'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Toast from '../components/ui/Toast'
import SkillTag from '../components/ui/SkillTag'
import StarRating from '../components/ui/StarRating'
import UserAvatar from '../components/ui/UserAvatar'

import { useAuth } from '../context/AuthContext'
import {
  cancelSession,
  completeSession,
  getPastSessions,
  getUpcomingSessions,
  updateSession,
} from '../services/sessions'
import { createReview, getMyReviews } from '../services/reviews'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
]

const Sessions = () => {
  const { user } = useAuth()
  const currentUserId = user?._id

  const [tab, setTab] = useState('upcoming')
  const [sessions, setSessions] = useState([])
  const [reviewsBySession, setReviewsBySession] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const [editing, setEditing] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [completing, setCompleting] = useState(null)
  const [completingBusy, setCompletingBusy] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [cancellingBusy, setCancellingBusy] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewing, setReviewing] = useState(false)
  const [viewingReview, setViewingReview] = useState(null)

  const showToast = (type, message) => setToast({ type, message })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const isUpcoming = tab === 'upcoming'
      const [res, myReviewsRes] = await Promise.all([
        isUpcoming ? getUpcomingSessions() : getPastSessions(),
        getMyReviews(),
      ])
      const list = Array.isArray(res.data) ? res.data : []
      setSessions(list)
      const map = {}
      const myReviews = Array.isArray(myReviewsRes.data) ? myReviewsRes.data : []
      myReviews.forEach((review) => {
        if (review.session) map[String(review.session._id || review.session)] = review
      })
      setReviewsBySession(map)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your sessions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const handleEdit = (session) => setEditing(session)

  const handleSaveEdit = async (data) => {
    setSavingEdit(true)
    try {
      await updateSession(editing._id, data)
      setEditing(null)
      showToast('success', 'Session updated successfully.')
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update the session.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleComplete = async () => {
    if (!completing) return
    setCompletingBusy(true)
    try {
      await completeSession(completing._id)
      showToast('success', 'Session marked as completed. You can now leave a review.')
      setCompleting(null)
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not complete the session.')
      setCompleting(null)
    } finally {
      setCompletingBusy(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelling) return
    setCancellingBusy(true)
    try {
      await cancelSession(cancelling._id)
      showToast('success', 'Session cancelled.')
      setCancelling(null)
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not cancel the session.')
      setCancelling(null)
    } finally {
      setCancellingBusy(false)
    }
  }

  const handleReviewSubmit = async (data) => {
    setReviewing(true)
    try {
      await createReview(data)
      setReviewTarget(null)
      showToast('success', 'Thank you! Your review has been submitted.')
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not submit your review.')
      setReviewing(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Skill Exchange Sessions"
        subtitle="Manage your upcoming and past learning sessions."
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
        {TABS.map((t) => (
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
      ) : sessions.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={CalendarClock}
            title={
              tab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions yet'
            }
            message={
              tab === 'upcoming'
                ? "When an exchange request is accepted you can schedule a session here."
                : 'Completed and cancelled sessions will show up here.'
            }
            action={
              tab === 'upcoming' ? (
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  <Compass className="h-4 w-4" />
                  Discover Skills
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              currentUserId={currentUserId}
              myReview={reviewsBySession[String(session._id)] || null}
              onEdit={handleEdit}
              onComplete={setCompleting}
              onCancel={setCancelling}
              onLeaveReview={setReviewTarget}
              onViewReview={(review) => setViewingReview(review)}
            />
          ))}
        </div>
      )}

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          open
          onClose={() => setReviewTarget(null)}
          session={reviewTarget}
          currentUserId={currentUserId}
          submitting={reviewing}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* View review (read-only) */}
      <Modal
        title="Your Review"
        open={Boolean(viewingReview)}
        onClose={() => setViewingReview(null)}
        size="sm"
        footer={
          <button
            type="button"
            onClick={() => setViewingReview(null)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Close
          </button>
        }
      >
        {viewingReview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StarRating value={viewingReview.rating} size="md" readOnly />
              <SkillTag tone="Completed">{viewingReview.rating} / 5</SkillTag>
            </div>
            {viewingReview.skill?.skillName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-700">
                  {viewingReview.skill.skillName}
                </span>
                <SkillTag tone="category">{viewingReview.skill.category}</SkillTag>
              </div>
            )}
            {viewingReview.comment && (
              <p className="whitespace-pre-line rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                "{viewingReview.comment}"
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <UserAvatar
                name={viewingReview.reviewee?.name}
                profileImage={viewingReview.reviewee?.profileImage}
                size="xs"
              />
              Reviewing {viewingReview.reviewee?.name || 'partner'} ·{' '}
              {new Date(viewingReview.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit session modal */}
      <SessionEditModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        session={editing}
        submitting={savingEdit}
        onSubmit={handleSaveEdit}
      />

      {/* Complete confirmation */}
      <ConfirmDialog
        open={Boolean(completing)}
        title="Mark this session as completed?"
        message="After completing, you and your partner can leave reviews for this session."
        confirmLabel="Mark Completed"
        busy={completingBusy}
        busyLabel="Saving..."
        destructive={false}
        onConfirm={handleComplete}
        onCancel={() => setCompleting(null)}
      />

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={Boolean(cancelling)}
        title="Cancel this session?"
        message="This will cancel the scheduled session. You can schedule again later if needed."
        confirmLabel="Cancel Session"
        busy={cancellingBusy}
        busyLabel="Cancelling..."
        destructive
        onConfirm={handleCancel}
        onCancel={() => setCancelling(null)}
      />
    </AppLayout>
  )
}

export default Sessions