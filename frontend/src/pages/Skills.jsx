import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, PlusCircle, Sparkles } from 'lucide-react'

import { deleteSkill, getMySkills } from '../services/skills'
import AppLayout from '../components/layout/AppLayout'
import PageHeader from '../components/ui/PageHeader'
import SkillCard from '../components/ui/SkillCard'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingState from '../components/ui/LoadingState'
import Toast from '../components/ui/Toast'

const TABS = [
  { key: 'all', label: 'All Skills' },
  { key: 'teach', label: 'Teaching' },
  { key: 'learn', label: 'Learning' },
]

const Skills = () => {
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [adding, setAdding] = useState(false)

  const loadSkills = async () => {
    setLoading(true)
    try {
      const res = await getMySkills()
      setSkills(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch {
      setError('Could not load your skills. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const handleEdit = (skill) => navigate(`/skills/${skill._id}/edit`)

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await deleteSkill(deleting._id)
      setSkills((prev) => prev.filter((s) => s._id !== deleting._id))
      setToast({ type: 'success', message: `"${deleting.skillName}" was deleted.` })
      setDeleting(null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not delete this skill.',
      })
      setDeleting(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  const filtered = skills.filter((s) => {
    if (tab === 'all') return true
    return s.type === tab
  })

  const tabs = skills.map((s) => s.type)
  const teachCount = tabs.filter((t) => t === 'teach').length
  const learnCount = tabs.filter((t) => t === 'learn').length

  return (
    <AppLayout>
      <PageHeader
        title="My Skills"
        subtitle="The skills you offer to teach and the ones you want to learn."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <PlusCircle className="h-4 w-4" />
            Add Skill
          </button>
        }
      />

      {toast && (
        <div className="mt-6">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
      {error && (
        <div className="mt-6">
          <Toast type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={3} />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {TABS.map((t) => {
              const count =
                t.key === 'all' ? skills.length : t.key === 'teach' ? teachCount : learnCount
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-150 ${
                    active
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Skill grid */}
          {filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={BookOpen}
                title={
                  tab === 'all'
                    ? 'No skills yet'
                    : tab === 'teach'
                      ? 'No teaching skills yet'
                      : 'No learning skills yet'
                }
                message={
                  tab === 'all'
                    ? 'Add a skill you can teach or want to learn to get started.'
                    : 'Add a skill to grow your exchange list.'
                }
                action={
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Skill
                  </button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((skill) => (
                <SkillCard
                  key={skill._id}
                  skill={skill}
                  onEdit={handleEdit}
                  onDelete={(s) => setDeleting(s)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add skill modal */}
      <Modal
        title="Add a Skill"
        open={adding}
        onClose={() => setAdding(false)}
        footer={
          <span className="text-sm text-gray-500">
            Prefer the full form?{' '}
            <Link to="/skills/add" className="font-medium text-primary-600 hover:text-primary-700">
              Open add page
            </Link>
          </span>
        }
      >
        <div className="space-y-4">
          <Link
            to="/skills/add?type=teach"
            onClick={() => setAdding(false)}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">Add a teaching skill</p>
              <p className="text-sm text-gray-500">Share what you can help others learn.</p>
            </div>
          </Link>
          <Link
            to="/skills/add?type=learn"
            onClick={() => setAdding(false)}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">Add a learning goal</p>
              <p className="text-sm text-gray-500">Tell the community what you want to learn.</p>
            </div>
          </Link>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this skill?"
        message={`"${deleting?.skillName}" will be removed from your profile and can no longer be found by other members.`}
        confirmLabel="Delete Skill"
        busy={deleteBusy}
        busyLabel="Deleting..."
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </AppLayout>
  )
}

export default Skills