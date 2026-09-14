import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import SkillForm from '../../components/skills/SkillForm'
import { createSkill } from '../../services/skills'

const AddSkill = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (values) => {
    setSaving(true)
    setError('')
    try {
      await createSkill(values)
      navigate('/skills', { state: { success: 'Skill added successfully.' } })
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-xl px-4 py-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add a Skill</h1>
          <p className="mt-1 text-sm text-gray-500">
            Describe a skill you can teach or want to learn.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <SkillForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link to="/skills" className="font-medium text-blue-600 hover:text-blue-700">
            Back to Discover Skills
          </Link>
        </p>
      </main>
    </div>
  )
}

export default AddSkill