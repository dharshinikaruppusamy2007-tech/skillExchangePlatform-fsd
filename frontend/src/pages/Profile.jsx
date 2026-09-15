import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  Clock,
  Compass,
  Mail,
  MapPin,
  Pencil,
  Sparkles,
  Star,
} from 'lucide-react'

import { getProfile, updateProfile } from '../services/profile'
import { getMySkills } from '../services/skills'
import { getReviewsForUser } from '../services/reviews'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import ProfileForm from '../components/profile/ProfileForm'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import StatCard from '../components/ui/StatCard'
import SkillIcon from '../components/ui/SkillIcon'
import SkillTag from '../components/ui/SkillTag'
import UserAvatar from '../components/ui/UserAvatar'
import StarRating from '../components/ui/StarRating'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'

const formatJoined = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  })

const Profile = () => {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState({ average: 0, count: 0, distribution: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const loadData = async () => {
    try {
      const [profileRes, skillsRes, reviewsRes] = await Promise.all([
        getProfile(),
        getMySkills(),
        getReviewsForUser(authUser?._id || ''),
      ])
      setProfile(profileRes.data)
      setSkills(Array.isArray(skillsRes.data) ? skillsRes.data : [])
      const summary = reviewsRes.data?.summary || {}
      setRating({
        average: summary.average || 0,
        count: summary.count || 0,
        distribution: summary.distribution || [],
      })
      setReviews(Array.isArray(reviewsRes.data?.reviews) ? reviewsRes.data.reviews : [])
    } catch {
      setError('Could not load your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      const res = await updateProfile(data)
      setProfile(res.data)
      setEditOpen(false)
      setToast({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not update your profile.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingState rows={4} />
      </AppLayout>
    )
  }

  if (error && !profile) {
    return (
      <AppLayout>
        <Toast type="error" message={error} onClose={() => setError('')} />
      </AppLayout>
    )
  }

  const teachCount = skills.filter((s) => s.type === 'teach').length
  const learnCount = skills.filter((s) => s.type === 'learn').length

  return (
    <AppLayout>
      {toast && (
        <div className="mb-6">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-400 sm:h-28" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
              <div className="w-fit shrink-0 rounded-full ring-4 ring-white sm:-mt-14">
                <UserAvatar
                  name={profile?.name}
                  profileImage={profile?.profileImage}
                  size="xl"
                />
              </div>
              <div className="min-w-0 flex-1 pb-0.5">
                <h1 className="break-words text-2xl font-bold leading-snug tracking-tight text-ink sm:leading-tight">
                  {profile?.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {profile?.experienceLevel && (
                    <SkillTag tone="level">{profile.experienceLevel}</SkillTag>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Joined {formatJoined(profile?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Can Teach" value={teachCount} accent="primary" />
        <StatCard icon={BookOpen} label="Want to Learn" value={learnCount} accent="sky" />
        <StatCard icon={Briefcase} label="Total Skills" value={skills.length} accent="emerald" />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={rating.count ? Number(rating.average).toFixed(1) : '—'}
          accent="amber"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* About */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">About</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{profile?.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{profile?.location || 'No location set'}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {profile?.experienceLevel || 'Not specified'} experience
                </span>
              </div>
              <p className="whitespace-pre-line border-t border-gray-100 pt-4 text-gray-600">
                {profile?.bio || 'No bio yet. Tell the community a little about yourself!'}
              </p>
            </div>
          </div>
        </section>

        {/* My skills */}
        <section className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">My Skills</h2>
            <Link
              to="/skills"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Manage skills
            </Link>
          </div>

          {skills.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={Compass}
                title="No skills listed yet"
                message="Add a skill you can teach or want to learn to get started."
                action={
                  <Link
                    to="/skills/add"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    Add your first skill
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {skills.map((skill) => (
                <Link
                  key={skill._id}
                  to={`/skills/${skill._id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <SkillIcon category={skill.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{skill.skillName}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <SkillTag tone="category">{skill.category || 'General'}</SkillTag>
                      {skill.type !== 'teach' ? (
                        <SkillTag tone="learn">Want to Learn</SkillTag>
                      ) : (
                        <SkillTag tone="teach">Can Teach</SkillTag>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-primary-600">
                    {skill.type === 'teach' ? 'Teaching' : 'Learning'} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Ratings & reviews */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Ratings & Reviews</h2>

        {reviews.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Star}
              title="No reviews yet"
              message="Reviews from completed skill exchanges will appear here."
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-6 lg:grid-cols-3">
            {/* Summary */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-ink">
                  {Number(rating.average).toFixed(1)}
                </span>
                <div className="pb-1.5">
                  <StarRating value={Math.round(rating.average)} size="sm" readOnly />
                  <p className="mt-1 text-xs text-gray-400">
                    {rating.count} review{rating.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const row = rating.distribution.find((d) => d.stars === stars) || {
                    count: 0,
                  }
                  const pct = rating.count ? Math.round((row.count / rating.count) * 100) : 0
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3">{stars}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right tabular-nums">{row.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent reviews */}
            <div className="space-y-3 lg:col-span-2">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review._id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={review.reviewer?.name || 'Member'}
                        profileImage={review.reviewer?.profileImage}
                        size="sm"
                      />
                      <span className="text-sm font-semibold text-ink">
                        {review.reviewer?.name || 'Member'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size="sm" readOnly />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {review.skill?.skillName && (
                    <div className="mt-2 flex gap-1.5">
                      <SkillTag tone="category">{review.skill.category}</SkillTag>
                      <span className="text-xs text-gray-400">{review.skill.skillName}</span>
                    </div>
                  )}
                  {review.comment && (
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Edit profile modal */}
      <Modal title="Edit Profile" open={editOpen} onClose={() => setEditOpen(false)} size="lg">
        <ProfileForm
          profile={profile}
          onSubmit={handleSave}
          onCancel={() => setEditOpen(false)}
          saving={saving}
        />
      </Modal>
    </AppLayout>
  )
}

export default Profile