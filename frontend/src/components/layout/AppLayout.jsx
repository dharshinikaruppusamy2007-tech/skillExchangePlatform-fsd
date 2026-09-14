import { useState } from 'react'

import Sidebar from './Sidebar'
import Header from './Header'

// Shared authenticated layout: fixed sidebar + top header + scrollable main.
// Mobile shows the sidebar as a slide-over drawer opened from the header.
const AppLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout