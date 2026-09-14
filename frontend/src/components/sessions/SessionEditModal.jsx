import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'

import Modal from '../ui/Modal'
import { DURATION_OPTIONS, SESSION_MODES } from '../../constants'

// Modal for editing an existing upcoming session (participants only).
const SessionEditModal = ({ open, onClose, session, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    scheduledDate: '',
    startTime: '',
    duration: 60,
    meetingMode: 'Online',
    meetingLink: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open && session) {
      const d = session.scheduledDate ? new Date(session.scheduledDate) : new Date()
      setForm({
        scheduledDate: d.toISOString().slice(0, 10),
        startTime: session.startTime || '',
        duration: session.duration || 60,
        meetingMode: session.meetingMode || 'Online',
        meetingLink: session.meetingLink || '',
        notes: session.notes || '',
      })
      setErrors({})
    }
  }, [open, session])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.scheduledDate) next.scheduledDate = 'Date is required'
    if (!form.startTime) next.startTime = 'Start time is required'
    if (!form.duration) next.duration = 'Duration is required'
    if (!form.meetingMode) next.meetingMode = 'Meeting mode is required'
    if (
      form.meetingMode === 'Online' &&
      form.meetingLink &&
      !/^https?:\/\//i.test(form.meetingLink)
    ) {
      next.meetingLink = 'Link must start with http:// or https://'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      scheduledDate: form.scheduledDate,
      startTime: form.startTime,
      duration: Number(form.duration),
      meetingMode: form.meetingMode,
      meetingLink: form.meetingMode === 'Online' ? form.meetingLink.trim() : '',
      notes: form.notes.trim(),
    })
  }

  return (
    <Modal
      title="Edit Session"
      open={open}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarClock className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-date" className="mb-1.5 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="edit-date"
              name="scheduledDate"
              type="date"
              value={form.scheduledDate}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                errors.scheduledDate
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-300 focus:ring-primary-100'
              }`}
            />
            {errors.scheduledDate && (
              <p className="mt-1.5 text-sm text-red-600">{errors.scheduledDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-time" className="mb-1.5 block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              id="edit-time"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                errors.startTime
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-300 focus:ring-primary-100'
              }`}
            />
            {errors.startTime && (
              <p className="mt-1.5 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-duration" className="mb-1.5 block text-sm font-medium text-gray-700">
              Duration
            </label>
            <select
              id="edit-duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-mode" className="mb-1.5 block text-sm font-medium text-gray-700">
              Meeting Mode
            </label>
            <select
              id="edit-mode"
              name="meetingMode"
              value={form.meetingMode}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
            >
              {SESSION_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.meetingMode === 'Online' && (
          <div>
            <label htmlFor="edit-link" className="mb-1.5 block text-sm font-medium text-gray-700">
              Meeting Link <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="edit-link"
              name="meetingLink"
              type="url"
              value={form.meetingLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                errors.meetingLink
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-primary-300 focus:ring-primary-100'
              }`}
            />
            {errors.meetingLink && (
              <p className="mt-1.5 text-sm text-red-600">{errors.meetingLink}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="edit-notes" className="mb-1.5 block text-sm font-medium text-gray-700">
            Notes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="edit-notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            maxLength={1000}
            placeholder="Notes for this session"
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </form>
    </Modal>
  )
}

export default SessionEditModal