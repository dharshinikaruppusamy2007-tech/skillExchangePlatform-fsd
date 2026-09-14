// Shows a row of pulsing skeleton blocks while data loads.
const LoadingState = ({ rows = 3, label = 'Loading...' }) => (
  <div className="space-y-3" role="status" aria-label={label}>
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="h-28 animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
      </div>
    ))}
    <span className="sr-only">{label}</span>
  </div>
)

export default LoadingState