// Shared centered card layout for the auth pages.
// Light gray background, white card, no fancy effects.
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout