import { useState } from 'react'

// Reusable input for a list of skills. Skills are shown as removable
// chips/tags; pressing Enter or clicking Add appends a new one.
const SkillTagInput = ({ label, skills, onChange, placeholder }) => {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const addSkill = () => {
    const value = draft.trim()
    if (!value) return

    const isDuplicate = skills.some(
      (skill) => skill.toLowerCase() === value.toLowerCase()
    )
    if (isDuplicate) {
      setError('That skill is already added')
      return
    }

    onChange([...skills, value])
    setDraft('')
    setError('')
  }

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mb-2 flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={`${skill}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-3 pr-1 text-sm font-medium text-blue-700"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              aria-label={`Remove ${skill}`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-gray-400">No skills added yet</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={addSkill}
          className="shrink-0 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default SkillTagInput