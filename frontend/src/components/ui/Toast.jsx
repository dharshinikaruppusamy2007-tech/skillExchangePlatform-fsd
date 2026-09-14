import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const STYLES = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-800',
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
  },
  info: {
    container: 'border-sky-200 bg-sky-50 text-sky-800',
    icon: <Info className="h-5 w-5 text-sky-500" />,
  },
}

// Inline toast banner for success/error/info messages.
const Toast = ({ type = 'info', message, onClose }) => {
  const style = STYLES[type] || STYLES.info

  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${style.container}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{style.icon}</span>
        <p className="whitespace-pre-line">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default Toast