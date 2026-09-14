import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  Star,
  Timer,
  Video,
  XCircle,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import SkillTag from '../../components/ui/SkillTag'
import UserAvatar from '../../components/ui/UserAvatar'
import Toast from '../../components/ui/Toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import SessionEditModal from '../../components/sessions/SessionEditModal'
import ReviewModal from '../../components/reviews/ReviewModal'
import StarRating from '../../components/ui/StarRating'

import { useAuth } from '../../context/AuthContext'
import {
  cancelSession,
  completeSession,
  getSessionById,
  updateSession,
} from '../../services/sessions'
import { createReview, getReviewsForSession } from '../../services/reviews'

const formatFullDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const SessionDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?._id

  const [session, setSession] = useState(null)
  const [myReview, setMyReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const [editing, setEditing] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completingBusy, setCompletingBusy] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancellingBusy, setCancellingBusy] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getSessionById(id)
      setSession(res.data)
      const reviewsRes = await getReviewsForSession(id)
      const my = (reviewsRes.data || []).find(
        (r) => String(r.reviewer?._id || r.reviewer) === String(currentUserId)
      )
      setMyReview(my || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Session not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUserId])

  const showToast = (type, message) => setToast({ type, message })

  const handleSaveEdit = async (data) => {
    setSavingEdit(true)
    try {
      const res = await updateSession(id, data)
      setSession(res.data)
      setEditing(false)
      showToast('success', 'Session updated successfully.')
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update the session.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleComplete = async () => {
    setCompletingBusy(true)
    try {
      const res = await completeSession(id)
      setSession(res.data)
      setCompleting(false)
      showToast('success', 'Session completed. You can now leave a review.')
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not complete the session.')
      setCompleting(false)
    } finally {
      setCompletingBusy(false)
    }
  }

  const handleCancel = async () => {
    setCancellingBusy(true)
    try {
      const res = await cancelSession(id)
      setSession(res.data)
      setCancelling(false)
      showToast('success', 'Session cancelled.')
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not cancel the session.')
      setCancelling(false)
    } finally {
      setCancellingBusy(false)
    }
  }

  const handleReviewSubmit = async (data) => {
    setReviewing(true)
    try {
      await createReview(data)
      setReviewOpen(false)
      showToast('success', 'Thank you! Your review has been submitted.')
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not submit your review.')
      setReviewing(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState rows={4} />
      </AppLayout>
    )
  }

  if (error || !session) {
    return (
      <AppLayout>
        <div className="mt-10">
          <EmptyState
            icon={XCircle}
            title="Session not found"
            message={error || 'This session may have been removed.'}
            action={
              <Link
                to="/sessions"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Back to Sessions
              </Link>
            }
          />
        </div>
      </AppLayout>
    )
  }

  const isMentor = String(session.mentor?._id || session.mentor) === String(currentUserId)
  const partner = isMentor ? session.learner : session.mentor
  const isUpcoming = session.status === 'Upcoming'
  const isCompleted = session.status === 'Completed'

  return (
    <AppLayout>
      {toast && (
        <div className="mb-6">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main card */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  {session.skill?.skillName || 'Skill session'}
                </h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <SkillTag tone={session.status}>{session.status}</SkillTag>
                  <SkillTag tone={session.meetingMode}>{session.meetingMode}</SkillTag>
                  {session.skill?.category && (
                    <SkillTag tone="category">{session.skill.category}</SkillTag>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                {formatFullDate(session.scheduledDate)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                Starts at {session.startTime}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Timer className="h-4 w-4 text-gray-400" />
                {session.duration} minutes
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                {session.meetingMode === 'Online' ? (
                  <Video className="h-4 w-4 text-gray-400" />
                ) : (
                  <MapPin className="h-4 w-4 text-gray-400" />
                )}
                {session.meetingMode === 'Online' ? 'Online session' : 'In-person session'}
              </div>
            </div>

            {session.meetingMode === 'Online' && isUpcoming && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
                <Video className="h-5 w-5 text-primary-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary-700">Meeting Link</p>
                  <p className="truncate text-sm text-primary-600">
                    {session.meetingLink || 'Not provided yet.'}
                  </p>
                </div>
                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Join Meeting
                  </a>
                )}
              </div>
            )}

            {session.notes && (
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-ink">Notes</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{session.notes}</p>
              </div>
            )}

            {isCompleted && (
              <div className="mt-5">
                {myReview ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-primary-700">Your review</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <StarRating value={myReview.rating} size="sm" readOnly />
                        <span className="text-xs text-primary-700">{myReview.rating}/5</span>
                      </div>
                      {myReview.comment && (
                        <p className="mt-1.5 text-sm text-gray-600">"{myReview.comment}"</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      How was the session? Leave a review for your partner.
                    </p>
                    <button
                      type="button"
                      onClick={() => setReviewOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      <Star className="h-4 w-4" />
                      Leave Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            {isUpcoming && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setCompleting(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => setCancelling(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Session
                </button>
              </>
            )}
          </div>
        </section>

        {/* Partner sidebar */}
        <aside>
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="flex justify-center">
              <UserAvatar name={partner?.name} profileImage={partner?.profileImage} size="lg" />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              {isMentor ? 'Learner' : 'Mentor'} partner
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">{partner?.name || 'Partner'}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {session.meetingMode === 'Online' ? 'Online session' : 'Offline session'} ·{' '}
              {session.duration} min
            </p>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                to="/sessions"
                className="w-full rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
              >
                All Sessions
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <SessionEditModal
        open={editing}
        onClose={() => setEditing(false)}
        session={session}
        submitting={savingEdit}
        onSubmit={handleSaveEdit}
      />

      {reviewOpen && (
        <ReviewModal
          open
          onClose={() => setReviewOpen(false)}
          session={session}
          currentUserId={currentUserId}
          submitting={reviewing}
          onSubmit={handleReviewSubmit}
        />
      )}

      <ConfirmDialog
        open={completing}
        title="Mark this session as completed?"
        message="After completing, you and your partner can leave reviews for this session."
        confirmLabel="Mark Completed"
        busy={completingBusy}
        busyLabel="Saving..."
        destructive={false}
        onConfirm={handleComplete}
        onCancel={() => setCompleting(false)}
      />

      <ConfirmDialog
        open={cancelling}
        title="Cancel this session?"
        message="This will cancel the scheduled session."
        confirmLabel="Cancel Session"
        busy={cancellingBusy}
        busyLabel="Cancelling..."
        destructive
        onConfirm={handleCancel}
        onCancel={() => setCancelling(false)}
      />
    </AppLayout>
  )
}

export default SessionDetails