import { useState } from "react"
import { WizardForm } from "../../../components/shared/WizardForm"
import { useRoutineStore } from "../../../stores/useRoutineStore"

interface NewRoutineWizardProps {
  onComplete: () => void
}

export function NewRoutineWizard({ onComplete }: NewRoutineWizardProps) {
  const { addRoutine } = useRoutineStore()

  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [freq, setFreq] = useState("daily")
  const [days, setDays] = useState("")
  const [time, setTime] = useState("")
  const [step, setStep] = useState(0)

  const steps = [
    { label: "Routine Name:", placeholder: "e.g. Morning Gym", value: name, onInput: setName },
    { label: "Description:", placeholder: "Describe the routine", value: desc, onInput: setDesc },
    { label: "Frequency (daily/weekly/monthly):", placeholder: "daily", value: freq, onInput: setFreq },
    { label: "Days (e.g. 1,3,5 for Mon,Wed,Fri or day numbers):", placeholder: "leave empty for daily", value: days, onInput: setDays },
    { label: "Preferred Time (HH:MM, optional):", placeholder: "08:00", value: time, onInput: setTime },
  ]

  return (
    <WizardForm
      title="New Routine"
      steps={steps}
      currentStep={step}
      onSubmit={() => {
        if (step < steps.length - 1) {
          setStep(step + 1)
        } else {
          const parsedDays = days ? days.split(",").map(Number).filter((n) => !isNaN(n)) : []
          addRoutine(name, desc, freq, parsedDays, time || null)
          onComplete()
        }
      }}
    />
  )
}
