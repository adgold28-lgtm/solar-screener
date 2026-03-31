import { cn } from '../../lib/utils'

export default function StatCard({ label, value, sub, accent = false, className }) {
  return (
    <div className={cn('card p-5', className)}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={cn(
        'text-2xl font-bold font-mono',
        accent ? 'text-solar-400' : 'text-gray-100'
      )}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
