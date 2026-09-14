// Reusable empty state with an icon, message and optional action button.
const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
    {Icon && (
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </span>
    )}
    {title && <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>}
    {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)

export default EmptyState