import { useState } from 'react'

const COMMON_CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Design',
  'Communication',
  'Languages',
  'Other',
]

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

// Form for adding or editing a skill. Pass initialSkill to edit an existing one.
const SkillForm = ({ initialSkill, initialType = 'teach', onSubmit, onCancel, saving }) => {
  const isEditing = Boolean(initialSkill)

  const [form, setForm] = useState({
    skillName: initialSkill?.skillName || '',
    category: initialSkill?.category || '',
    type: initialSkill?.type || initialType,
    description: initialSkill?.description || '',
    proficiency: initialSkill?.proficiency || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.skillName.trim()) newErrors.skillName = 'Skill name is required'
    if (!form.category.trim()) newErrors.category = 'Category is required'
    if (!form.type) newErrors.type = 'Skill type is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSubmit({
      skillName: form.skillName.trim(),
      category: form.category.trim(),
      type: form.type,
      description: form.description.trim(),
      proficiency: form.proficiency,
    })
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-primary-300 focus:ring-primary-100'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="skillName"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Skill name
        </label>
        <input
          id="skillName"
          name="skillName"
          type="text"
          value={form.skillName}
          onChange={handleChange}
          placeholder="e.g. React"
          className={inputClass(errors.skillName)}
        />
        {errors.skillName && (
          <p className="mt-1.5 text-sm text-red-600">{errors.skillName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <input
          id="category"
          name="category"
          type="text"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g. Web Development"
          list="common-categories"
          className={inputClass(errors.category)}
        />
        <datalist id="common-categories">
          {COMMON_CATEGORIES.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        {errors.category && (
          <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          Skill type
        </span>
        <div className="flex gap-3">
          {[
            { value: 'teach', label: 'Can Teach' },
            { value: 'learn', label: 'Want to Learn' },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-center text-sm font-semibold transition ${
                form.type === option.value
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={form.type === option.value}
                onChange={handleChange}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.type && <p className="mt-1.5 text-sm text-red-600">{errors.type}</p>}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Description <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="A short description of this skill"
          className={`${inputClass()} resize-y`}
        />
      </div>

      <div>
        <label
          htmlFor="proficiency"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Proficiency level <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <select
          id="proficiency"
          name="proficiency"
          value={form.proficiency}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">Not specified</option>
          {PROFICIENCY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving
            ? isEditing
              ? 'Saving...'
              : 'Adding...'
            : isEditing
              ? 'Save Changes'
              : 'Add Skill'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default SkillForm