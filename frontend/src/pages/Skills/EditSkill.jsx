import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
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
      navigate(`/skills/${id}`)
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

  return (
    <AppLayout>
      <button
        type="button"
        onClick={handleCancel}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Skill Details
      </button>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-500">Loading skill...</p>
      ) : unauthorized ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          You are not authorized to edit this skill.
        </div>
      ) : (
        <>
          <PageHeader
            title="Edit Skill"
            subtitle="Update the details of your skill."
          />

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && skill && (
            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Cancel and go back
            </Link>
          </p>
        </>
      )}
    </AppLayout>
  )
}

export default EditSkill