import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { fmtCurrency } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs space-y-1 shadow-xl">
      <p className="font-semibold text-gray-300 mb-2">Year {label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-gray-200">{fmtCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function CashflowChart({ cashflows }) {
  const data = cashflows.map(y => ({
    year: y.year,
    Revenue: y.revenue,
    'O&M': -y.omCost,
    'Net CF': y.projectCF,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gNetCF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#374151' }}
          label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
        />
        <YAxis
          tickFormatter={v => fmtCurrency(v)}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={72}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 8 }}
        />
        <Area type="monotone" dataKey="Revenue"  stroke="#22c55e" fill="url(#gRevenue)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="Net CF"   stroke="#3b82f6" fill="url(#gNetCF)"   strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
