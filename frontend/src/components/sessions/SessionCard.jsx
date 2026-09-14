import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  MessageSquarePlus,
  Pencil,
  Eye,
  Star,
  Timer,
  XCircle,
  CheckCircle2,
} from 'lucide-react'

import UserAvatar from '../ui/UserAvatar'
import SkillTag from '../ui/SkillTag'
import StarRating from '../ui/StarRating'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

// Single session card used on the Sessions page.
const SessionCard = ({
  session,
  currentUserId,
  myReview,
  onEdit,
  onComplete,
  onCancel,
  onLeaveReview,
  onViewReview,
}) => {
  const isMentor = String(session.mentor?._id || session.mentor) === String(currentUserId)
  const partner = isMentor ? session.learner : session.mentor

  const showLiveActions = session.status === 'Upcoming'
  const showReview = session.status === 'Completed'
  const alreadyReviewed = Boolean(myReview)

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">
              {session.skill?.skillName || 'Skill session'}
            </h3>
            <SkillTag tone={session.status}>{session.status}</SkillTag>
            <SkillTag tone={session.meetingMode}>{session.meetingMode}</SkillTag>
          </div>
          {session.skill?.category && (
            <div className="mt-1.5">
              <SkillTag tone="category">{session.skill.category}</SkillTag>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <UserAvatar name={partner?.name} profileImage={partner?.profileImage} size="sm" />
            <p className="text-sm text-gray-600">
              {isMentor ? 'Learner' : 'Mentor'}:{' '}
              <span className="font-semibold text-ink">{partner?.name || 'Partner'}</span>
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 sm:grid-cols-3">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              {formatDate(session.scheduledDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {session.startTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Timer className="h-4 w-4 text-gray-400" />
              {session.duration} min
            </span>
          </div>

          {session.notes && (
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
              "{session.notes}"
            </p>
          )}

          {showReview && alreadyReviewed && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2">
              <StarRating value={myReview.rating} size="sm" readOnly />
              <span className="text-xs text-primary-700">
                You rated this session {myReview.rating}/5.
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            to={`/sessions/${session._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>

          {showLiveActions && (
            <>
              <button
                type="button"
                onClick={() => onEdit(session)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onComplete(session)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </button>
              <button
                type="button"
                onClick={() => onCancel(session)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            </>
          )}

          {showReview && !alreadyReviewed && (
            <button
              type="button"
              onClick={() => onLeaveReview(session)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <Star className="h-4 w-4" />
              Leave Review
            </button>
          )}

          {showReview && alreadyReviewed && onViewReview && (
            <button
              type="button"
              onClick={() => onViewReview(myReview)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              <MessageSquarePlus className="h-4 w-4" />
              View Review
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default SessionCard