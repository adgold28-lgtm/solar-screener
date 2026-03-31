import { useState, useCallback } from 'react'

export function useWizard({ totalSteps, storageKey, defaultValues }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(() => {
    if (!storageKey) return defaultValues
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? { ...defaultValues, ...JSON.parse(saved) } : defaultValues
    } catch {
      return defaultValues
    }
  })

  const update = useCallback((patch) => {
    setData(prev => {
      const next = { ...prev, ...patch }
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }, [storageKey])

  const next = useCallback(() => setStep(s => Math.min(s + 1, totalSteps)), [totalSteps])
  const back = useCallback(() => setStep(s => Math.max(s - 1, 1)), [])
  const reset = useCallback(() => {
    if (storageKey) { try { localStorage.removeItem(storageKey) } catch {} }
    setData(defaultValues)
    setStep(1)
  }, [storageKey, defaultValues])

  return { step, data, update, next, back, reset, isFirst: step === 1, isLast: step === totalSteps }
}
