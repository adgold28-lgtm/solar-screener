const FAQS = [
  {
    q: 'Where does the solar production data come from?',
    a: 'Solar irradiance and capacity factor data comes directly from NREL\'s PVWatts v8 API, which uses 30-year TMY (Typical Meteorological Year) datasets. This is the same data used by professional solar developers for project underwriting.',
  },
  {
    q: 'What does "capacity factor" mean?',
    a: 'Capacity factor is the ratio of actual annual energy output to the theoretical maximum if the system ran at full power 24/7. A 22% capacity factor means a 1 MW system produces 0.22 MW on average across the year. US ground-mount solar ranges from ~12% (Pacific Northwest) to ~26% (Desert Southwest).',
  },
  {
    q: 'How are utility rates used?',
    a: 'We pull commercial and industrial electricity rates from the NREL Utility Rate Database (URDB) for your location. These are used to suggest a market-context PPA price range. Actual PPA prices are set through negotiation and depend on offtaker creditworthiness, contract length, and grid constraints.',
  },
  {
    q: 'What is the ITC and how is it modeled?',
    a: 'The Investment Tax Credit (ITC) under the Inflation Reduction Act (2022) provides a 30% federal tax credit on eligible solar project costs. The model applies the ITC as a year-1 tax credit against federal tax liability. The depreciable basis is reduced by 50% of the ITC per IRS rules (i.e., to 85% of total cost for a 30% ITC).',
  },
  {
    q: 'What is MACRS depreciation?',
    a: 'Solar projects qualify for 5-year MACRS (Modified Accelerated Cost Recovery System) depreciation: 20%, 32%, 19.2%, 11.52%, 11.52%, 5.76% over years 1–6. This front-loads tax deductions significantly, improving early cashflows and project IRR.',
  },
  {
    q: 'How accurate are the lease rate estimates?',
    a: 'Lease rate ranges are based on industry benchmarks. Actual offers depend on local grid capacity, land quality, developer competition, state policy, and project economics. Solar developers will run their own underwriting — this tool gives you a baseline for negotiation.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Solar Screener is an educational modeling tool. All outputs are estimates based on simplified assumptions. Do not make investment or land-use decisions based solely on these results. Consult qualified financial, legal, and energy professionals.',
  },
]

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-100 mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-10">How the model works and what the numbers mean.</p>

      <div className="space-y-6">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="card p-6">
            <h2 className="text-sm font-semibold text-gray-100 mb-2">{q}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
