import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function StepIndicator({ steps, current, labels = [] }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: steps }, (_, i) => {
        const n = i + 1
        const done   = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center">
            {/* Circle */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
              done   && 'bg-solar-500 border-solar-500 text-white',
              active && 'bg-transparent border-solar-500 text-solar-400',
              !done && !active && 'bg-transparent border-border text-gray-600'
            )}>
              {done ? <Check size={14} strokeWidth={3} /> : n}
            </div>
            {/* Label */}
            {labels[i] && (
              <span className={cn(
                'hidden sm:block ml-1.5 text-xs mr-3',
                active ? 'text-gray-300' : done ? 'text-gray-500' : 'text-gray-600'
              )}>
                {labels[i]}
              </span>
            )}
            {/* Connector */}
            {n < steps && (
              <div className={cn(
                'h-px mx-2 transition-all',
                !labels[i] && 'w-8',
                labels[i] && 'w-4',
                n < current ? 'bg-solar-500' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
