import { useState } from "react"
import { WizardForm } from "../../../components/shared/WizardForm"
import { useWorkStore } from "../../../stores/useWorkStore"
import { getCurrency } from "../../settings/settingsStore"

interface NewProjectWizardProps {
  onComplete: () => void
}

export function NewProjectWizard({ onComplete }: NewProjectWizardProps) {
  const currency = getCurrency()
  const { clients, addProject } = useWorkStore()

  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [deadline, setDeadline] = useState("")
  const [rate, setRate] = useState("")
  const [step, setStep] = useState(0)

  const steps = [
    { label: "Project Name:", placeholder: "e.g. Website Redesign", value: name, onInput: setName },
    { label: "Description:", placeholder: "Project description", value: desc, onInput: setDesc },
    { label: "Deadline (YYYY-MM-DD, optional):", placeholder: "", value: deadline, onInput: setDeadline },
    { label: `Hourly Rate (${currency}, optional):`, placeholder: "0", value: rate, onInput: setRate },
  ]

  return (
    <WizardForm
      title="New Project"
      steps={steps}
      currentStep={step}
      onSubmit={() => {
        if (step < steps.length - 1) {
          setStep(step + 1)
        } else {
          const clientId = clients[0]?.id ?? null
          addProject(name, clientId, desc, deadline || null, Number(rate) || null)
          onComplete()
        }
      }}
    />
  )
}
