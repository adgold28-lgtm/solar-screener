import { Link, useLocation } from 'react-router-dom'
import { Zap } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/faq', label: 'FAQ' },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-base/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-100 hover:text-solar-400 transition-colors">
            <Zap size={18} className="text-solar-500" />
            Solar Screener
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm transition-colors ${
                  pathname === l.to
                    ? 'text-solar-400'
                    : 'text-gray-400 hover:text-gray-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Solar Screener</span>
          <span>Solar production data: NREL PVWatts v8 · Utility rates: NREL URDB · Educational use only — not financial advice</span>
        </div>
      </footer>
    </div>
  )
}
