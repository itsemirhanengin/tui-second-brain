import { useState } from "react"
import { WizardForm } from "../../../components/shared/WizardForm"
import { useWorkStore } from "../../../stores/useWorkStore"

interface ManualEntryWizardProps {
  onComplete: () => void
}

export function ManualEntryWizard({ onComplete }: ManualEntryWizardProps) {
  const { projects, addManualEntry } = useWorkStore()

  const [desc, setDesc] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [step, setStep] = useState(0)

  const steps = [
    { label: "Description:", placeholder: "What did you work on?", value: desc, onInput: setDesc },
    { label: "Start Time (YYYY-MM-DD HH:MM):", placeholder: "2024-01-01 09:00", value: start, onInput: setStart },
    { label: "End Time (YYYY-MM-DD HH:MM):", placeholder: "2024-01-01 17:00", value: end, onInput: setEnd },
  ]

  return (
    <WizardForm
      title="Manual Time Entry"
      steps={steps}
      currentStep={step}
      onSubmit={() => {
        if (step < steps.length - 1) {
          setStep(step + 1)
        } else {
          const projId = projects[0]?.id ?? null
          addManualEntry(projId, desc, start, end)
          onComplete()
        }
      }}
    />
  )
}
