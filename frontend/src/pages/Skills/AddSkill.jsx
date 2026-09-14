import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import SkillForm from '../../components/skills/SkillForm'
import { createSkill } from '../../services/skills'

const AddSkill = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // The modal on the My Skills page links here with ?type=teach|learn.
  const presetType = searchParams.get('type')

  const handleSubmit = async (values) => {
    setSaving(true)
    setError('')
    try {
      await createSkill(values)
      navigate('/skills')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      )
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/skills')
  }

  return (
    <AppLayout>
      <button
        type="button"
        onClick={() => navigate('/skills')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Skills
      </button>

      <PageHeader
        title="Add a Skill"
        subtitle="Describe a skill you can teach or want to learn."
      />

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <SkillForm
          initialType={presetType === 'learn' ? 'learn' : 'teach'}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>

      <p className="mt-6 text-center text-sm">
        <Link to="/skills" className="font-medium text-primary-600 hover:text-primary-700">
          Cancel and go back
        </Link>
      </p>
    </AppLayout>
  )
}

export default AddSkill