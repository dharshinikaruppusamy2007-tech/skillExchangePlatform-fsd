import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Avatar from '../components/Avatar'
import { deleteSkill, getMySkills, getSkills } from '../services/skills'

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Design',
  'Communication',
  'Languages',
  'Other',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const SkillCard = ({ skill, manageable, onDelete }) => {
  const owner = skill.userId

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{skill.skillName}</h3>
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
        {skill.description && (
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-gray-600">
            {skill.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Avatar
            name={owner?.name || ''}
            profileImage={owner?.profileImage || ''}
            size="h-8 w-8"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-800">{owner?.name || 'Unknown user'}</p>
            {owner?.location && <p className="text-gray-500">{owner.location}</p>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Link
          to={`/skills/${skill._id}`}
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View Skill
        </Link>
        {manageable && (
          <>
            <Link
              to={`/skills/${skill._id}/edit`}
              className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(skill)}
              className="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const Skills = () => {
  const location = useLocation()

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.success || '')

  const requestSeq = useRef(0)

  useEffect(() => {
    if (location.state?.success) {
      // Clear the one-time message so it does not show again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const currentParams = () => {
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (category) params.category = category
    if (level) params.level = level
    return params
  }

  const loadSkills = async (params) => {
    const seq = ++requestSeq.current
    setLoading(true)
    setError('')
    try {
      const res =
        tab === 'mine' ? await getMySkills() : await getSkills(params)
      if (seq !== requestSeq.current) return
      setSkills(res.data)
    } catch (err) {
      if (seq !== requestSeq.current) return
      setError(
        err.response?.data?.message || 'Failed to load skills. Please try again.'
      )
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills(currentParams())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // Category/level changes filter automatically
  const runFilter = () => loadSkills(currentParams())

  const handleSearch = (e) => {
    e.preventDefault()
    loadSkills(currentParams())
  }

  const handleReset = () => {
    setSearch('')
    setCategory('')
    setLevel('')
    loadSkills({})
  }

  const handleDelete = async (skill) => {
    if (
      !window.confirm(`Delete the skill "${skill.skillName}"? This cannot be undone.`)
    ) {
      return
    }
    setError('')
    setSuccess('')
    try {
      await deleteSkill(skill._id)
      setSkills((prev) => prev.filter((item) => item._id !== skill._id))
      setSuccess('Skill deleted successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the skill. Please try again.'
      )
    }
  }

  const selectClass =
    'rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Discover Skills</h1>
            <p className="mt-1 text-sm text-gray-500">
              Search skills offered by other users, or manage the skills you own.
            </p>
          </div>
          <Link
            to="/skills/add"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Skill
          </Link>
        </div>

        {/* Search + filters */}
        <form
          onSubmit={handleSearch}
          className="mt-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="search"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. React"
                className={inputClass}
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
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  runFilter()
                }}
                className={selectClass}
              >
                <option value="">All categories</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="level"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value)
                  runFilter()
                }}
                className={selectClass}
              >
                <option value="">All levels</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
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

        {/* All / My skills toggle */}
        <div className="mt-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                tab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Skills
            </button>
            <button
              type="button"
              onClick={() => setTab('mine')}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                tab === 'mine'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              My Skills
            </button>
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

        {loading ? (
          <div className="mt-12 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading skills...</p>
          </div>
        ) : (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {tab === 'mine' ? 'My Skills' : 'Available Skills'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {skills.length} result{skills.length === 1 ? '' : 's'}
            </p>
            <div className="mt-4 space-y-4">
              {skills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="text-sm text-gray-500">
                    {tab === 'mine'
                      ? "You haven't added any skills yet. Click 'Add Skill' to create one."
                      : 'No skills match your search. Try different filters.'}
                  </p>
                </div>
              ) : (
                skills.map((skill) => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    manageable={tab === 'mine'}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Skills