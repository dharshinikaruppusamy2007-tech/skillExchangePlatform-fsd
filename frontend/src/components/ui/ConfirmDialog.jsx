import { AlertTriangle } from 'lucide-react'

import Modal from './Modal'

// Confirmation dialog used for destructive actions such as deleting skills.
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  busyLabel = 'Working...',
  destructive = true,
  onConfirm,
  onCancel,
}) => (
  <Modal title={title} open={open} onClose={onCancel} size="sm">
    <div className="flex items-start gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          destructive ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
        }`}
      >
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="pt-1.5 text-sm text-gray-600">{message}</p>
    </div>
    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
          destructive
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        {busy ? busyLabel : confirmLabel}
      </button>
    </div>
  </Modal>
)

export default ConfirmDialog