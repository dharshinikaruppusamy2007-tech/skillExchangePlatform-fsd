import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import SkillForm from '../../components/skills/SkillForm'
import { getSkillById, updateSkill } from '../../services/skills'
import { useAuth } from '../../context/AuthContext'

const EditSkill = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [skill, setSkill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await getSkillById(id)
        if (!active) return

        const ownerId =
          res.data.userId && res.data.userId._id
            ? res.data.userId._id
            : res.data.userId
        if (!user || !ownerId || ownerId.toString() !== user._id) {
          setUnauthorized(true)
          return
        }

        setSkill(res.data)
        setError('')
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
  }, [id, user])

  const handleSubmit = async (values) => {
    setSaving(true)
    setError('')
    try {
      await updateSkill(id, values)
      navigate(`/skills/${id}`, {
        state: { success: 'Skill updated successfully.' },
      })
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      )
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(`/skills/${id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Loading skill...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-xl px-4 py-8">
        {unauthorized ? (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            You are not authorized to edit this skill.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Skill</h1>
              <p className="mt-1 text-sm text-gray-500">
                Update the details of your skill.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!error && skill && (
              <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                <SkillForm
                  initialSkill={skill}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  saving={saving}
                />
              </div>
            )}

            <p className="mt-6 text-center text-sm">
              <Link
                to={`/skills/${id}`}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Back to Skill Details
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default EditSkill