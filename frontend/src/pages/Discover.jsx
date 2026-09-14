import { useEffect, useRef, useState } from 'react'

import Navbar from '../components/Navbar'
import { discoverSkills } from '../services/discovery'
import { getPublicProfile } from '../services/profile'
import { createRequest, getRequests } from '../services/requests'

const CATEGORIES = [
  'Web Development',
  'Programming Languages',
  'Design',
  'Data & Analytics',
  'Business',
  'Marketing',
  'Languages',
  'Music',
  'Sports',
  'Other',
]

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const requestKey = (userId, skillId) => `${userId}:${skillId}`

const ProfileModal = ({ userId, onClose }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await getPublicProfile(userId)
        if (active) setProfile(res.data)
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load this profile.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [userId])

  const initials = (name = '') =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  const teachSkills = (profile?.skills || []).filter((s) => s.type === 'teach')
  const learnSkills = (profile?.skills || []).filter((s) => s.type === 'learn')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
            aria-label="Close profile"
          >
            ×
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-gray-500">Loading profile...</p>}
        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {profile && (
          <div className="mt-4">
            <div className="flex items-center gap-4">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={`${profile.name}'s avatar`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {initials(profile.name)}
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold text-gray-900">{profile.name}</h3>
                {profile.location && (
                  <p className="text-sm text-gray-500">{profile.location}</p>
                )}
                <p className="text-sm text-gray-500">
                  {profile.experienceLevel || 'Beginner'}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Bio</dt>
                <dd className="mt-1 whitespace-pre-line text-gray-600">
                  {profile.bio || 'No bio yet'}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-gray-700">Can Teach</dt>
                <dd className="mt-1">
                  {teachSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {teachSkills.map((s) => (
                        <span
                          key={s._id}
                          className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {s.skillName}
                          {s.proficiency ? ` · ${s.proficiency}` : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">None yet</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="font-medium text-gray-700">Want to Learn</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {learnSkills.length > 0 ? (
                    learnSkills.map((s) => (
                      <span
                        key={s._id}
                        className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700"
                      >
                        {s.skillName}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">None yet</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}

const RequestModal = ({ entry, onClose, onSubmit }) => {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(message)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send the request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Send exchange request</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
            aria-label="Close request"
          >
            ×
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Ask {entry.name} to teach you{' '}
          <span className="font-medium text-gray-800">{entry.skill.skillName}</span>.
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
          <label
            htmlFor="requestMessage"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Message <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="requestMessage"
            rows={4}
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Hi! I would love to learn React from you. What time works best?"
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ResultCard = ({
  entry,
  onViewProfile,
  onSendRequest,
  sending,
  sent,
  showSendRequest,
}) => {
  const { skill } = entry

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{entry.name}</h3>
            {entry.location && (
              <span className="text-sm text-gray-500">{entry.location}</span>
            )}
            {entry.isMatch && (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                {entry.matchedSkill} match found
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{skill.skillName}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                skill.type === 'teach'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-purple-50 text-purple-700'
              }`}
            >
              {skill.category}
            </span>
            {skill.proficiency && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {skill.proficiency}
              </span>
            )}
          </div>

          {skill.description && (
            <p className="mt-2 text-sm text-gray-600">{skill.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(entry.userId)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View Profile
          </button>
          {showSendRequest &&
            (sent ? (
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white opacity-70"
              >
                Request Sent
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSendRequest(entry)}
                disabled={sending}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

const ResultSection = ({
  title,
  subtitle,
  entries,
  onViewProfile,
  onSendRequest,
  sendingKey,
  sentKeys,
  showSendRequest,
  empty,
}) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    <div className="mt-4 space-y-4">
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">{empty}</p>
        </div>
      ) : (
        entries.map((entry) => (
          <ResultCard
            key={`${entry.skill._id}-${entry.userId}`}
            entry={entry}
            onViewProfile={onViewProfile}
            onSendRequest={onSendRequest}
            sending={sendingKey === requestKey(entry.userId, entry.skill._id)}
            sent={sentKeys.has(requestKey(entry.userId, entry.skill._id))}
            showSendRequest={showSendRequest}
          />
        ))
      )}
    </div>
  </section>
)

const Discover = () => {
  const [form, setForm] = useState({ skill: '', category: '', proficiency: '', type: '' })
  const [teaches, setTeaches] = useState([])
  const [learns, setLearns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sentKeys, setSentKeys] = useState(new Set())
  const [sendingKey, setSendingKey] = useState(null)
  const [profileModalId, setProfileModalId] = useState(null)
  const [requestTarget, setRequestTarget] = useState(null)

  const requestSeq = useRef(0)

  const runDiscovery = async (params) => {
    const seq = ++requestSeq.current
    setLoading(true)
    setError('')
    try {
      const res = await discoverSkills(params)
      if (seq !== requestSeq.current) return
      setTeaches(res.data.teaches || [])
      setLearns(res.data.learns || [])
    } catch (err) {
      if (seq !== requestSeq.current) return
      setError(err.response?.data?.message || 'Failed to load skills. Please try again.')
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }

  useEffect(() => {
    runDiscovery({})
    getRequests()
      .then((res) => {
        setSentKeys(
          new Set(
            (res.data.sent || []).map((r) =>
              requestKey(r.receiver?._id, r.skill?._id)
            )
          )
        )
      })
      .catch(() => {})
    return () => {
      requestSeq.current += 1
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    runDiscovery(form)
  }

  const handleFilterChange = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      runDiscovery(next)
      return next
    })
  }

  const handleReset = () => {
    const empty = { skill: '', category: '', proficiency: '', type: '' }
    setForm(empty)
    runDiscovery(empty)
  }

  const handleSubmitRequest = async (message) => {
    const entry = requestTarget
    const key = requestKey(entry.userId, entry.skill._id)
    setSendingKey(key)
    setSuccess('')
    setError('')
    try {
      await createRequest({
        receiverId: entry.userId,
        skillId: entry.skill._id,
        message,
      })
      setSentKeys((prev) => {
        const next = new Set(prev)
        next.add(key)
        return next
      })
      setSuccess(
        `Request sent to ${entry.name}. They will see it under Exchange Requests.`
      )
    } finally {
      setSendingKey(null)
    }
  }

  const selectClass =
    'rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const sortedTeaches = [...teaches].sort((a, b) => Number(b.isMatch) - Number(a.isMatch))
  const sortedLearns = [...learns].sort((a, b) => Number(b.isMatch) - Number(a.isMatch))

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {profileModalId && (
        <ProfileModal userId={profileModalId} onClose={() => setProfileModalId(null)} />
      )}

      {requestTarget && (
        <RequestModal
          entry={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSubmit={handleSubmitRequest}
        />
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900">Discover Skills</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find other people based on the skills they can teach or want to learn.
        </p>

        {/* Search + filters */}
        <form
          onSubmit={handleSearch}
          className="mt-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="skill"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search by skill
              </label>
              <input
                id="skill"
                type="text"
                value={form.skill}
                onChange={(e) => setForm((prev) => ({ ...prev, skill: e.target.value }))}
                placeholder="e.g. React"
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={selectClass}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="proficiency"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Proficiency
              </label>
              <select
                id="proficiency"
                value={form.proficiency}
                onChange={(e) => handleFilterChange('proficiency', e.target.value)}
                className={selectClass}
              >
                <option value="">All levels</option>
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="type"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Skill type
              </label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={selectClass}
              >
                <option value="">All types</option>
                <option value="teach">Can Teach</option>
                <option value="learn">Want to Learn</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Reset filters
            </button>
          </div>
        </form>

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex items-center justify-center">
            <p className="text-sm text-gray-500">Searching skills...</p>
          </div>
        ) : (
          <>
            <ResultSection
              title="People Who Can Teach"
              subtitle={`${sortedTeaches.length} result${
                sortedTeaches.length === 1 ? '' : 's'
              }`}
              entries={sortedTeaches}
              onViewProfile={(userId) => setProfileModalId(userId)}
              onSendRequest={setRequestTarget}
              sendingKey={sendingKey}
              sentKeys={sentKeys}
              showSendRequest
              empty="No people are currently offering the skills you searched for."
            />
            <ResultSection
              title="People Looking to Learn"
              subtitle={`${sortedLearns.length} result${
                sortedLearns.length === 1 ? '' : 's'
              }`}
              entries={sortedLearns}
              onViewProfile={(userId) => setProfileModalId(userId)}
              onSendRequest={setRequestTarget}
              sendingKey={sendingKey}
              sentKeys={sentKeys}
              showSendRequest={false}
              empty="No people are currently looking to learn the skills you searched for."
            />
          </>
        )}
      </main>
    </div>
  )
}

export default Discover