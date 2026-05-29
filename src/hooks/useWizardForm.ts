import { useState, useCallback } from "react"

export interface WizardStep {
  label: string
  placeholder: string
  value: string
  setter: (value: string) => void
}

interface WizardFormOptions {
  totalSteps: number
  onComplete: () => void
  onCancel?: () => void
}

export function useWizardForm(options: WizardFormOptions) {
  const { totalSteps, onComplete, onCancel } = options
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }, [currentStep, totalSteps, onComplete])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const reset = useCallback(() => {
    setCurrentStep(0)
  }, [])

  const cancel = useCallback(() => {
    reset()
    onCancel?.()
  }, [reset, onCancel])

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    reset,
    cancel,
    isLastStep: currentStep === totalSteps - 1,
    totalSteps,
  }
}
