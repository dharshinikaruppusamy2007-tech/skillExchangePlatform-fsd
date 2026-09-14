// Compact stat card used on the dashboard and profile pages.
const StatCard = ({ icon: Icon, label, value, hint, accent = 'primary' }) => {
  const accentStyles = {
    primary: 'bg-primary-50 text-primary-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            accentStyles[accent] || accentStyles.primary
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
    </div>
  )
}

export default StatCard