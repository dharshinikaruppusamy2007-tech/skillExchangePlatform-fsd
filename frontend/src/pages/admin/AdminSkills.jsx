import { useCallback, useEffect, useState } from 'react'
import { Search, Trash2, Wrench } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import SkillTag from '../../components/ui/SkillTag'
import SkillIcon from '../../components/ui/SkillIcon'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import Toast from '../../components/ui/Toast'
import { CATEGORIES, LEVELS } from '../../constants'
import { deleteAdminSkill, getAdminSkills } from '../../services/admin'

const AdminSkills = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (category) params.category = category
      if (level) params.level = level
      const res = await getAdminSkills(params)
      setSkills(res.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load skills.')
    } finally {
      setLoading(false)
    }
  }, [search, category, level])

  useEffect(() => {
    const t = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget._id)
    try {
      await deleteAdminSkill(deleteTarget._id)
      setSkills((prev) => prev.filter((s) => s._id !== deleteTarget._id))
      setToast({
        type: 'success',
        message: `"${deleteTarget.skillName}" was removed.`,
      })
      setDeleteTarget(null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not delete this skill.',
      })
      setDeleteTarget(null)
    } finally {
      setBusyId('')
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Admin · Skills"
        subtitle="Review and remove any skill listed on the platform."
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

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-6">
          <LoadingState rows={5} />
        </div>
      ) : skills.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Wrench} title="No skills found" message="Try adjusting your filters." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">Skill</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Level</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <SkillIcon category={skill.category} />
                      <div>
                        <p className="font-semibold text-ink">{skill.skillName}</p>
                        <div className="mt-0.5">
                          <SkillTag tone="category">{skill.category || 'General'}</SkillTag>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{skill.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{skill.userId?.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <SkillTag tone={skill.type === 'learn' ? 'learn' : 'teach'}>
                      {skill.type === 'learn' ? 'Learning' : 'Teaching'}
                    </SkillTag>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{skill.proficiency || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => setDeleteTarget(skill)}
                        title="Delete skill"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this skill?"
        message={`"${deleteTarget?.skillName}" will be permanently removed from the platform.`}
        confirmLabel="Delete Skill"
        destructive
        busy={Boolean(busyId)}
        busyLabel="Deleting..."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}

export default AdminSkills