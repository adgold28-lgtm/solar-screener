import { motion, AnimatePresence } from 'framer-motion'
import { useWizard } from '../../hooks/useWizard'
import { DEVELOPER_DEFAULTS } from '../../constants/defaults'
import StepIndicator from '../../components/shared/StepIndicator'
import SiteStep       from './steps/SiteStep'
import ProductionStep from './steps/ProductionStep'
import RevenueStep    from './steps/RevenueStep'
import CostsStep      from './steps/CostsStep'
import FinanceStep    from './steps/FinanceStep'
import DeveloperResults from './Results'

const STEPS = [
  { label: 'Site',       component: SiteStep },
  { label: 'Production', component: ProductionStep },
  { label: 'Revenue',    component: RevenueStep },
  { label: 'Costs',      component: CostsStep },
  { label: 'Finance',    component: FinanceStep },
]

const variants = {
  enter:  { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -20 },
}

export default function DeveloperWizard() {
  const { step, data, update, next, back, reset, isLast } = useWizard({
    totalSteps: STEPS.length,
    storageKey: 'solar_developer_v2',
    defaultValues: { ...DEVELOPER_DEFAULTS },
  })

  const [showResults, setShowResults] = useState(false)

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <DeveloperResults data={data} onReset={() => { reset(); setShowResults(false) }} />
      </div>
    )
  }

  const StepComp = STEPS[step - 1].component
  const stepLabels = STEPS.map(s => s.label)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-1">Developer Analysis</h1>
        <p className="text-sm text-gray-500">
          Model project economics with real NREL solar and utility rate data.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <StepIndicator steps={STEPS.length} current={step} labels={stepLabels} />
      </div>

      {/* Step card */}
      <div className="card p-7">
        <h2 className="text-base font-semibold text-gray-200 mb-5">
          Step {step}: {STEPS[step - 1].label}
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18 }}
          >
            <StepComp data={data} update={update} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-5">
        <button
          onClick={back}
          className="btn-secondary"
          disabled={step === 1}
        >
          ← Back
        </button>
        <button
          onClick={isLast ? () => setShowResults(true) : next}
          className="btn-primary"
        >
          {isLast ? 'Run Analysis →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

// Need useState import
import { useState } from 'react'
