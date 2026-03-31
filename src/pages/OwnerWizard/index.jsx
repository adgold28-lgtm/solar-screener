import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWizard } from '../../hooks/useWizard'
import { OWNER_DEFAULTS } from '../../constants/defaults'
import StepIndicator from '../../components/shared/StepIndicator'
import PropertyStep from './steps/PropertyStep'
import LeaseStep    from './steps/LeaseStep'
import GridStep     from './steps/GridStep'
import OwnerResults from './Results'

const STEPS = [
  { label: 'Property', component: PropertyStep },
  { label: 'Lease',    component: LeaseStep },
  { label: 'Grid',     component: GridStep },
]

const variants = {
  enter:  { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -20 },
}

export default function OwnerWizard() {
  const { step, data, update, next, back, reset, isLast } = useWizard({
    totalSteps: STEPS.length,
    storageKey: 'solar_owner_v2',
    defaultValues: { ...OWNER_DEFAULTS },
  })
  const [showResults, setShowResults] = useState(false)

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <OwnerResults data={data} onReset={() => { reset(); setShowResults(false) }} />
      </div>
    )
  }

  const StepComp  = STEPS[step - 1].component
  const stepLabels = STEPS.map(s => s.label)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-1">Landowner Assessment</h1>
        <p className="text-sm text-gray-500">
          Understand your property's solar lease potential using real site data.
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator steps={STEPS.length} current={step} labels={stepLabels} />
      </div>

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

      <div className="flex justify-between mt-5">
        <button onClick={back} className="btn-secondary" disabled={step === 1}>
          ← Back
        </button>
        <button
          onClick={isLast ? () => setShowResults(true) : next}
          className="btn-primary"
        >
          {isLast ? 'See Results →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
