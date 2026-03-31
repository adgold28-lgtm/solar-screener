import { cn } from '../../lib/utils'

function irrColor(irr) {
  if (irr == null) return 'text-gray-600'
  if (irr >= 12) return 'text-solar-400'
  if (irr >= 8)  return 'text-blue-400'
  if (irr >= 5)  return 'text-yellow-400'
  return 'text-red-400'
}

export default function SensitivityTable({ sensitivity }) {
  const { ppaLabels, cfLabels, matrix } = sensitivity
  const baseRow = Math.floor(cfLabels.length / 2)
  const baseCol = Math.floor(ppaLabels.length / 2)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 text-gray-500 font-medium">CF \\ PPA</th>
            {ppaLabels.map((l, i) => (
              <th key={i} className={cn(
                'p-2 text-center font-medium',
                i === baseCol ? 'text-solar-400' : 'text-gray-400'
              )}>
                {l}<span className="text-gray-600">/MWh</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cfLabels.map((cfLabel, ri) => (
            <tr key={ri} className="border-t border-border/50">
              <td className={cn(
                'p-2 font-medium',
                ri === baseRow ? 'text-solar-400' : 'text-gray-400'
              )}>
                {cfLabel}
              </td>
              {matrix[ri].map((irr, ci) => (
                <td key={ci} className={cn(
                  'p-2 text-center font-mono font-semibold',
                  ri === baseRow && ci === baseCol && 'bg-bg-elevated rounded',
                  irrColor(irr)
                )}>
                  {irr != null ? `${irr.toFixed(1)}%` : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-600 mt-2">
        Rows = capacity factor · Columns = PPA price · <span className="text-solar-400">Highlighted</span> = base case
      </p>
    </div>
  )
}
