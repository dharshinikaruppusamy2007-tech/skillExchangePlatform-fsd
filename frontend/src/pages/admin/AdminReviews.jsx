import { useCallback, useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import PageHeader from '../../components/ui/PageHeader'
import StarRating from '../../components/ui/StarRating'
import UserAvatar from '../../components/ui/UserAvatar'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import LoadingState from '../../components/ui/LoadingState'
import Toast from '../../components/ui/Toast'
import { deleteAdminReview, getAdminReviews } from '../../services/admin'

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const AdminReviews = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [rating, setRating] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = rating ? { rating } : {}
      const res = await getAdminReviews(params)
      setItems(res.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load reviews.')
    } finally {
      setLoading(false)
    }
  }, [rating])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget._id)
    try {
      await deleteAdminReview(deleteTarget._id)
      setItems((prev) => prev.filter((r) => r._id !== deleteTarget._id))
      setToast({ type: 'success', message: 'Review removed.' })
      setDeleteTarget(null)
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Could not delete this review.',
      })
      setDeleteTarget(null)
    } finally {
      setBusyId('')
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Admin · Reviews"
        subtitle="Moderate all reviews left by members."
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

      {/* Filter */}
      <div className="mt-6 flex items-center gap-3">
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-6">
          <LoadingState rows={5} />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Star} title="No reviews found" message="No reviews match this filter." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">Reviewer</th>
                <th className="px-5 py-3 font-semibold">Reviewee</th>
                <th className="px-5 py-3 font-semibold">Skill</th>
                <th className="px-5 py-3 font-semibold">Rating</th>
                <th className="px-5 py-3 font-semibold">Comment</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={item.reviewer?.name}
                        profileImage={item.reviewer?.profileImage}
                        size="xs"
                      />
                      <span className="font-medium text-ink">
                        {item.reviewer?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={item.reviewee?.name}
                        profileImage={item.reviewee?.profileImage}
                        size="xs"
                      />
                      <span className="text-gray-600">{item.reviewee?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-ink">
                      {item.skill?.skillName || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <StarRating value={item.rating} size="sm" readOnly />
                      <span className="text-xs text-gray-400">{item.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="max-w-xs truncate text-gray-600" title={item.comment}>
                      {item.comment || '—'}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => setDeleteTarget(item)}
                        title="Delete review"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
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
        title="Remove this review?"
        message="This review will be permanently deleted from the platform."
        confirmLabel="Remove Review"
        destructive
        busy={Boolean(busyId)}
        busyLabel="Removing..."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}

export default AdminReviews