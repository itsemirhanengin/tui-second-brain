import { useState } from "react"
import { WizardForm } from "../../../components/shared/WizardForm"
import { useWorkStore } from "../../../stores/useWorkStore"
import { getCurrency } from "../../settings/settingsStore"

interface NewClientWizardProps {
  onComplete: () => void
}

export function NewClientWizard({ onComplete }: NewClientWizardProps) {
  const currency = getCurrency()
  const { addClient } = useWorkStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [rate, setRate] = useState("")
  const [step, setStep] = useState(0)

  const steps = [
    { label: "Client Name:", placeholder: "e.g. Acme Corp", value: name, onInput: setName },
    { label: "Email:", placeholder: "client@example.com", value: email, onInput: setEmail },
    { label: "Company:", placeholder: "Company name", value: company, onInput: setCompany },
    { label: `Hourly Rate (${currency}):`, placeholder: "0", value: rate, onInput: setRate },
  ]

  return (
    <WizardForm
      title="New Client"
      steps={steps}
      currentStep={step}
      onSubmit={() => {
        if (step < steps.length - 1) {
          setStep(step + 1)
        } else {
          addClient(name, email, "", company, "", Number(rate) || 0)
          onComplete()
        }
      }}
    />
  )
}
