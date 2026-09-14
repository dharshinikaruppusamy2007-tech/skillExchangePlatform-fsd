import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

import Modal from '../ui/Modal'
import UserAvatar from '../ui/UserAvatar'
import SkillTag from '../ui/SkillTag'
import StarRating from '../ui/StarRating'

// Modal for leaving a 1-5 star review on a completed session.
const ReviewModal = ({ open, onClose, session, currentUserId, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setRating(0)
      setComment('')
      setError('')
    }
  }, [open])

  const isMentor = String(session?.mentor?._id) === String(currentUserId)
  const partner = isMentor ? session?.learner : session?.mentor
  const skill = session?.skill

  const handleSubmit = () => {
    if (rating < 1) {
      setError('Please select a rating between 1 and 5 stars.')
      return
    }
    setError('')
    onSubmit({ sessionId: session._id, rating, comment })
  }

  return (
    <Modal
      title="Rate Your Skill Exchange"
      open={open}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <UserAvatar name={partner?.name} profileImage={partner?.profileImage} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{partner?.name || 'Your partner'}</p>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              Session with{' '}
              <span className="font-medium text-gray-700">{skill?.skillName || 'skill'}</span>
            </p>
          </div>
          {skill?.category && <SkillTag tone="category">{skill.category}</SkillTag>}
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            How would you rate this exchange?
          </span>
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={setRating} size="lg" />
            <span className="text-sm font-semibold text-gray-600">
              {rating > 0 ? `${rating} / 5` : '— / 5'}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Comment <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Share what you liked about the session or what could be improved."
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          />
          <p className="mt-1.5 text-right text-xs text-gray-400">{comment.length}/1000</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}

export default ReviewModal