import { ArrowLeftRight, BookOpen, Sparkles } from 'lucide-react'

// Auth pages share this two-column layout: a soft brand panel on larger
// screens and a centered card for the form.
const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-700 p-10 lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-500/30" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary-500/20" />

        <div className="relative flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold">Skill Exchange</span>
        </div>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            Trade skills. Grow together.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-100">
            Teach what you know, learn what you love. Connect with peers, set up
            exchanges and build a shared skills community.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: BookOpen, text: 'Add the skills you can teach' },
              { icon: Sparkles, text: 'Discover people who can help you learn' },
              { icon: ArrowLeftRight, text: 'Exchange skills with your community' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-primary-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-white" />
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-200">
          © {new Date().getFullYear()} Skill Exchange Platform
        </p>
      </div>

      {/* Form column */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <ArrowLeftRight className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-ink">Skill Exchange</span>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout