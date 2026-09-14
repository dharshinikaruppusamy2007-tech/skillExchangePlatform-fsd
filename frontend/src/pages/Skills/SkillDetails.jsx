import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  CalendarDays,
  Compass,
  MapPin,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { deleteSkill, getSkillById } from '../../services/skills'
import { getPublicProfile } from '../../services/profile'
import { createRequest } from '../../services/requests'
import { getReviewsForUser } from '../../services/reviews'
import AppLayout from '../../components/layout/AppLayout'
import SkillIcon from '../../components/ui/SkillIcon'
import SkillTag from '../../components/ui/SkillTag'
import UserAvatar from '../../components/ui/UserAvatar'
import StarRating from '../../components/ui/StarRating'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Toast from '../../components/ui/Toast'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

const SkillDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [skill, setSkill] = useState(null)
  const [ownerRating, setOwnerRating] = useState({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [profileModal, setProfileModal] = useState(false)
  const [publicProfile, setPublicProfile] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const loadSkill = async () => {
    setLoading(true)
    try {
      const res = await getSkillById(id)
      setSkill(res.data)
      setError('')
      const owner = res.data?.userId
      if (owner && owner._id) {
        try {
          const ratingRes = await getReviewsForUser(owner._id)
          const summary = ratingRes.data?.summary || {}
          setOwnerRating({
            average: summary.average || 0,
            count: summary.count || 0,
          })
        } catch {
          setOwnerRating({ average: 0, count: 0 })
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Skill not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkill()
    if (location.state?.success) {
      setToast({ type: 'success', message: location.state.success })
      window.history.replaceState({}, document.title)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const ownerId =
    skill?.userId && skill.userId._id ? String(skill.userId._id) : ''
  const isOwner = Boolean(user && ownerId && ownerId === String(user._id))

  const openProfile = async () => {
    if (!ownerId) return
    try {
      const res = await getPublicProfile(ownerId)
      setPublicProfile(res.data)
      setProfileModal(true)
    } catch {
      setToast({ type: 'error', message: 'Could not load this member.' })
    }
  }

  const handleRequest = async () => {
    setSending(true)
    try {
      await createRequest({
        receiverId: ownerId,
        skillId: id,
        message: requestMessage,
      })
      setRequestOpen(false)
      setRequestMessage('')
      setToast({
        type: 'success',
        message: 'Exchange request sent! The member will respond soon.',
      })
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not send the request.',
      })
      setRequestOpen(false)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteSkill(id)
      navigate('/skills')
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not delete this skill.',
      })
      setConfirmDelete(false)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState rows={4} />
      </AppLayout>
    )
  }

  if (error || !skill) {
    return (
      <AppLayout>
        <div className="mt-10">
          <EmptyState
            icon={Compass}
            title="Skill not found"
            message={error || 'This skill may have been removed.'}
            action={
              <Link
                to="/discover"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Back to Discover
              </Link>
            }
          />
        </div>
      </AppLayout>
    )
  }

  const owner = skill.userId

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
        {/* Main skill card */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <SkillIcon category={skill.category} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-ink">{skill.skillName}</h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <SkillTag tone="category">{skill.category || 'General'}</SkillTag>
                  {skill.proficiency && (
                    <SkillTag tone="level">{skill.proficiency}</SkillTag>
                  )}
                  {skill.type === 'learn' ? (
                    <SkillTag tone="learn">Want to Learn</SkillTag>
                  ) : (
                    <SkillTag tone="teach">Can Teach</SkillTag>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-sm font-semibold text-ink">About this skill</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {skill.description || 'No description provided for this skill yet.'}
              </p>
            </div>

            <p className="mt-5 flex items-center gap-1.5 border-t border-gray-100 pt-4 text-xs text-gray-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Listed on {formatDate(skill.createdAt)}
            </p>
          </div>

          {/* Owner actions */}
          {isOwner ? (
            <div className="mt-4 flex flex-wrap gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
              <p className="flex-1 text-sm text-primary-700">
                This is your skill. You can edit its details or remove it.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/skills/${id}/edit`)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <Pencil className="h-4 w-4" />
                Edit Skill
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                {skill.type === 'learn'
                  ? 'This member wants to learn this skill. Make them an offer!'
                  : 'Interested in learning this skill? Start an exchange.'}
              </p>
              <button
                type="button"
                onClick={() => setRequestOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Request Exchange
              </button>
            </div>
          )}
        </section>

        {/* Owner sidebar */}
        <aside>
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="flex justify-center">
              <UserAvatar
                name={owner?.name}
                profileImage={owner?.profileImage}
                size="lg"
              />
            </div>
            <h2 className="mt-3 text-lg font-bold text-ink">{owner?.name || 'Unknown user'}</h2>
            {owner?.location && (
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                {owner.location}
              </p>
            )}
            {owner?.experienceLevel && (
              <div className="mt-3 flex justify-center">
                <SkillTag tone="level">{owner.experienceLevel}</SkillTag>
              </div>
            )}
            {ownerRating.count > 0 && (
              <div className="mt-3 flex flex-col items-center gap-1">
                <StarRating value={Math.round(ownerRating.average)} size="sm" readOnly />
                <p className="text-xs text-gray-400">
                  {Number(ownerRating.average).toFixed(1)} · {ownerRating.count} review
                  {ownerRating.count !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={openProfile}
              className="mt-5 w-full rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              View Profile
            </button>
          </div>
        </aside>
      </div>

      {/* Request exchange modal */}
      <Modal
        title={`Request Exchange · ${skill.skillName}`}
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRequestOpen(false)}
              disabled={sending}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRequest}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Request'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Send a short message to <span className="font-semibold text-ink">{owner?.name}</span> about
          learning <span className="font-semibold text-ink">{skill.skillName}</span>.
        </p>
        <textarea
          value={requestMessage}
          onChange={(e) => setRequestMessage(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Hi! I'd love to learn this skill. Are you available to exchange sometime?"
          className="mt-4 w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-1.5 text-right text-xs text-gray-400">{requestMessage.length}/500</p>
      </Modal>

      {/* Public profile modal */}
      <Modal
        title="Member Profile"
        open={profileModal}
        onClose={() => setProfileModal(false)}
        size="lg"
      >
        {publicProfile ? (
          <div>
            <div className="flex items-center gap-4">
              <UserAvatar
                name={publicProfile.name}
                profileImage={publicProfile.profileImage}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-bold text-ink">{publicProfile.name}</h3>
                {publicProfile.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {publicProfile.location}
                  </p>
                )}
                {publicProfile.experienceLevel && (
                  <div className="mt-1.5">
                    <SkillTag tone="level">{publicProfile.experienceLevel}</SkillTag>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-gray-600">
              {publicProfile.bio || 'This member has not added a bio yet.'}
            </p>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-ink">Skills</h4>
              <div className="mt-3 space-y-3">
                {publicProfile.skills && publicProfile.skills.length > 0 ? (
                  publicProfile.skills.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => {
                        setProfileModal(false)
                        setSkill(s)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex w-full items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:border-primary-200"
                    >
                      <SkillIcon category={s.category} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{s.skillName}</p>
                        <div className="mt-1 flex gap-1.5">
                          <SkillTag tone="category">{s.category || 'General'}</SkillTag>
                          {s.type === 'learn' ? (
                            <SkillTag tone="learn">Learning</SkillTag>
                          ) : (
                            <SkillTag tone="teach">Teaching</SkillTag>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No public skills listed.</p>
                )}
              </div>
              {publicProfile.skillsToTeach && publicProfile.skillsToTeach.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {publicProfile.skillsToTeach.map((name) => (
                    <SkillTag key={name} tone="teach">
                      {name}
                    </SkillTag>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <BookOpen className="h-4 w-4" /> Loading profile...
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this skill?"
        message={`"${skill.skillName}" will be removed and can no longer be found by other members.`}
        confirmLabel="Delete Skill"
        busy={deleting}
        busyLabel="Deleting..."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </AppLayout>
  )
}

export default SkillDetails