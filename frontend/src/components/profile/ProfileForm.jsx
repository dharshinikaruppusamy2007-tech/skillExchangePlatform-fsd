import { useState } from 'react'

import SkillTagInput from './SkillTagInput'

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

// Editable profile form. Keeps its own field state and resets to the latest
// saved profile when Cancel/Reset is clicked.
const ProfileForm = ({ profile, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    experienceLevel: profile?.experienceLevel || 'Beginner',
    skillsToTeach: profile?.skillsToTeach || [],
    skillsToLearn: profile?.skillsToLearn || [],
    profileImage: profile?.profileImage || '',
  })
  const [errors, setErrors] = useState({})

  const resetFromProfile = () => {
    setForm({
      name: profile?.name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      experienceLevel: profile?.experienceLevel || 'Beginner',
      skillsToTeach: profile?.skillsToTeach || [],
      skillsToLearn: profile?.skillsToLearn || [],
      profileImage: profile?.profileImage || '',
    })
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSubmit({
      name: form.name.trim(),
      bio: form.bio.trim(),
      location: form.location.trim(),
      experienceLevel: form.experienceLevel,
      skillsToTeach: form.skillsToTeach,
      skillsToLearn: form.skillsToLearn,
      profileImage: form.profileImage.trim(),
    })
  }

  const handleCancel = () => {
    resetFromProfile()
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
            errors.name
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary-300 focus:ring-primary-100'
          }`}
        />
        {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={profile?.email || ''}
          readOnly
          className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Email cannot be changed
        </p>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={form.bio}
          onChange={handleChange}
          placeholder="Tell others a little about yourself"
          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          placeholder="City, country"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label
          htmlFor="experienceLevel"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Experience Level
        </label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <SkillTagInput
        label="Skills I Can Teach"
        skills={form.skillsToTeach}
        onChange={(skills) => setForm((prev) => ({ ...prev, skillsToTeach: skills }))}
        placeholder="e.g. React"
      />

      <SkillTagInput
        label="Skills I Want to Learn"
        skills={form.skillsToLearn}
        onChange={(skills) => setForm((prev) => ({ ...prev, skillsToLearn: skills }))}
        placeholder="e.g. Python"
      />

      <div>
        <label
          htmlFor="profileImage"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Profile Image URL
        </label>
        <input
          id="profileImage"
          name="profileImage"
          type="url"
          value={form.profileImage}
          onChange={handleChange}
          placeholder="https://example.com/avatar.png"
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Leave empty to use a placeholder avatar
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Cancel / Reset
        </button>
      </div>
    </form>
  )
}

export default ProfileForm
