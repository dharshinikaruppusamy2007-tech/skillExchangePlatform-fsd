import { useCallback, useEffect, useState } from 'react'
import { Search, Shield, UserX, Users } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import SkillTag from '../../components/ui/SkillTag'
import UserAvatar from '../../components/ui/UserAvatar'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import Toast from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { getAdminUsers, updateAdminUser } from '../../services/admin'

const AdminUsers = () => {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (role) params.role = role
      const res = await getAdminUsers(params)
      setUsers(res.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [search, role])

  useEffect(() => {
    const t = setTimeout(() => {
      load()
    }, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleToggleRole = async (user) => {
    setBusyId(user._id)
    try {
      const nextRole = user.role === 'admin' ? 'user' : 'admin'
      const res = await updateAdminUser(user._id, { role: nextRole })
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: res.data.role } : u))
      )
      setToast({
        type: 'success',
        message: `${user.name} is now ${res.data.role === 'admin' ? 'an admin' : 'a regular user'}.`,
      })
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not update this user.',
      })
    } finally {
      setBusyId('')
    }
  }

  const handleToggleActive = async (user) => {
    if (String(user._id) === String(me?._id)) {
      setToast({ type: 'error', message: 'You cannot deactivate your own account.' })
      return
    }
    setBusyId(user._id)
    try {
      const nextActive = !user.active
      const res = await updateAdminUser(user._id, { active: nextActive })
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, active: res.data.active } : u))
      )
      setToast({
        type: 'success',
        message: nextActive
          ? `${user.name} has been reactivated.`
          : `${user.name} has been deactivated.`,
      })
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not update this user.',
      })
    } finally {
      setBusyId('')
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Admin · Users"
        subtitle="Manage members, roles and account status."
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
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-6">
          <LoadingState rows={5} />
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Users} title="No users found" message="Try adjusting your search." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Skills</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user.name}
                        profileImage={user.profileImage}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">
                          {user.name}
                          {String(user._id) === String(me?._id) && (
                            <span className="ml-1.5 text-xs font-normal text-gray-400">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <SkillTag tone={user.role}>{user.role}</SkillTag>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{user.skillsCount || 0}</td>
                  <td className="px-5 py-3">
                    <SkillTag tone={user.active ? 'active' : 'inactive'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </SkillTag>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => handleToggleRole(user)}
                        title={user.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 disabled:opacity-60"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => handleToggleActive(user)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                          user.active
                            ? 'border-red-200 bg-white text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <UserX className="h-3.5 w-3.5" />
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}

export default AdminUsers