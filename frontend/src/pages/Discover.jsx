import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Compass, Search } from 'lucide-react'

import { getSkills } from '../services/skills'
import { CATEGORIES, LEVELS } from '../constants'
import AppLayout from '../components/layout/AppLayout'
import PageHeader from '../components/ui/PageHeader'
import SkillCard from '../components/ui/SkillCard'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Toast from '../components/ui/Toast'

const TYPE_FILTERS = [
  { value: 'teach', label: 'Teaching' },
  { value: 'learn', label: 'Learning' },
  { value: '', label: 'All' },
]

const Discover = () => {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [type, setType] = useState('teach')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Keep the search box in sync when the header search changes the URL.
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    let active = true
    setLoading(true)

    const params = {}
    if (search.trim()) params.search = search.trim()
    if (category) params.category = category
    if (level) params.level = level
    if (type) params.type = type

    getSkills(params)
      .then((res) => {
        if (active) {
          setSkills(Array.isArray(res.data) ? res.data : [])
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Could not load skills. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [search, category, level, type])

  const handleSubmit = (e) => {
    e.preventDefault()
    // The `search` state already drives the effect above. Triggering a state
    // reset keeps the URL-free search working; params handling is in the effect.
    setSearch(search.trim())
  }

  return (
    <AppLayout>
      <PageHeader
        title="Discover Skills"
        subtitle="Find a skill you want to learn or teach. Send an exchange request to start."
      />

      {/* Filters */}
      <section className="mt-6 space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:min-w-0 sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill name or keyword..."
              aria-label="Search skills"
              className="w-full rounded-lg border border-gray-200 bg-canvas py-2.5 pl-9 pr-4 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by proficiency level"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100 sm:w-auto"
          >
            <option value="">All levels</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by skill type"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100 sm:w-auto"
          >
            {TYPE_FILTERS.map((filter) => (
              <option key={filter.value || 'all'} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 pb-1">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === ''
                ? 'bg-primary-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All categories
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(category === item ? '' : item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === item
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={3} />
        </div>
      ) : skills.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Compass}
            title="No skills found"
            message="Try a different search term or category. New skills are added by the community all the time."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} to={`/skills/${skill._id}`} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}

export default Discover