import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import Avatar from '../../components/Avatar'
import { deleteSkill, getSkillById } from '../../services/skills'
import { useAuth } from '../../context/AuthContext'

const SkillDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [skill, setSkill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success] = useState(location.state?.success || '')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (location.state?.success) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await getSkillById(id)
        if (active) {
          setSkill(res.data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || 'Failed to load this skill. Please try again.'
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
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this skill? This cannot be undone.')) {
      return
    }
    setDeleting(true)
    setError('')
    try {
      await deleteSkill(id)
      navigate('/skills', { state: { success: 'Skill deleted successfully.' } })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the skill. Please try again.'
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading skill...</p>
      </div>
    )
  }

  if (error && !skill) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
          <p className="mt-6 text-center text-sm">
            <Link
              to="/skills"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Back to Discover Skills
            </Link>
          </p>
        </main>
      </div>
    )
  }

  const owner = skill.userId && skill.userId._id ? skill.userId : null
  const ownerId = owner ? owner._id : skill.userId
  const isOwner = Boolean(user && ownerId && ownerId.toString() === user._id)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/skills"
          className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Discover Skills
        </Link>

        <div className="mt-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{skill.skillName}</h1>
            {skill.category && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {skill.category}
              </span>
            )}
            {skill.proficiency && (
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                {skill.proficiency}
              </span>
            )}
            {skill.type === 'learn' && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Want to Learn
              </span>
            )}
          </div>

          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-medium text-gray-700">Description</dt>
              <dd className="mt-1 whitespace-pre-line text-gray-600">
                {skill.description || 'No description provided.'}
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-gray-700">Category</dt>
                <dd className="mt-1 text-gray-600">{skill.category || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Level</dt>
                <dd className="mt-1 text-gray-600">{skill.proficiency || '—'}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <Avatar
              name={owner?.name || ''}
              profileImage={owner?.profileImage || ''}
              size="h-12 w-12"
            />
            <div>
              <dt className="sr-only">Owner</dt>
              <p className="text-sm font-semibold text-gray-900">
                {owner?.name || 'Unknown user'}
              </p>
              <p className="text-sm text-gray-500">
                {owner?.location || 'Location not provided'}
              </p>
            </div>
          </div>

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

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
            {isOwner ? (
              <>
                <Link
                  to={`/skills/${skill._id}/edit`}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-500"
              >
                Exchange Request will be available in Module 4
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default SkillDetails