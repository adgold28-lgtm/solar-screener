import { Link } from 'react-router-dom'
import { ArrowRight, Zap, TrendingUp, MapPin, BarChart2, Shield, Database } from 'lucide-react'

const PATHS = [
  {
    to: '/developer',
    icon: TrendingUp,
    title: 'I Develop Solar',
    desc: 'Model project IRR, NPV, LCOE, and sensitivity across a 25-year cashflow horizon.',
    badge: 'For developers',
  },
  {
    to: '/owner',
    icon: MapPin,
    title: 'I Own Land',
    desc: 'Estimate lease income potential and understand if your site is worth pursuing.',
    badge: 'For landowners',
  },
]

const FEATURES = [
  { icon: Database, title: 'NREL Solar Data', desc: 'PVWatts v8 capacity factors and irradiance pulled directly for your project location.' },
  { icon: BarChart2, title: 'Local Utility Rates', desc: 'Commercial and industrial electricity rates from the NREL Utility Rate Database.' },
  { icon: Shield, title: 'Project Financial Model', desc: 'IRR, NPV, LCOE, DSCR, MACRS depreciation, and ITC modeled over a 25-year horizon.' },
]

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-solar-500/10 border border-solar-500/20 rounded-full px-4 py-1.5 text-solar-400 text-xs font-medium mb-6">
          <Zap size={12} />
          Powered by NREL PVWatts v8
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-50 mb-4 leading-tight">
          Solar Feasibility,<br />
          <span className="text-solar-400">Grounded in Real Data</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Screen sites and model project economics using solar irradiance and utility rate data pulled for your specific location.
        </p>
      </div>

      {/* Path cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-20">
        {PATHS.map(({ to, icon: Icon, title, desc, badge }) => (
          <Link
            key={to}
            to={to}
            className="card p-7 hover:border-solar-500/50 hover:bg-bg-card/80 transition-all group"
          >
            <span className="inline-block text-xs bg-bg-elevated text-gray-400 px-2.5 py-1 rounded-full mb-4">
              {badge}
            </span>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-solar-500/10 flex items-center justify-center">
                    <Icon size={18} className="text-solar-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight
                size={18}
                className="text-gray-600 group-hover:text-solar-400 group-hover:translate-x-1 transition-all mt-1 shrink-0 ml-4"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Feature strip */}
      <div className="border-t border-border pt-12">
        <p className="text-xs uppercase tracking-widest text-gray-600 text-center mb-8">How it works</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center mx-auto mb-3">
                <Icon size={16} className="text-solar-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
