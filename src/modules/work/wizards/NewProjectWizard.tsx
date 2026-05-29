import { useState } from "react"
import { useKeyboard } from "@opentui/react"
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
  const [clientIdx, setClientIdx] = useState(0)
  const [step, setStep] = useState(0)

  const clientChoices = [{ name: "No Client", id: null as number | null }, ...clients.map((c) => ({ name: c.name || c.company || `Client #${c.id}`, id: c.id as number | null }))]

  const textSteps = [
    { label: "Project Name:", placeholder: "e.g. Website Redesign", value: name, onInput: setName },
    { label: "Description:", placeholder: "Project description", value: desc, onInput: setDesc },
    { label: "Deadline (YYYY-MM-DD, optional):", placeholder: "", value: deadline, onInput: setDeadline },
    { label: `Hourly Rate (${currency}, optional):`, placeholder: "0", value: rate, onInput: setRate },
  ]

  useKeyboard((key) => {
    if (step >= textSteps.length) {
      if (key.name === "up") setClientIdx((i) => Math.max(0, i - 1))
      if (key.name === "down") setClientIdx((i) => Math.min(clientChoices.length - 1, i + 1))
    }
  })

  if (step < textSteps.length) {
    return (
      <WizardForm
        title="New Project"
        steps={textSteps}
        currentStep={step}
        onSubmit={() => {
          if (step === 0 && !name.trim()) return
          if (step < textSteps.length - 1) {
            setStep(step + 1)
          } else {
            if (clients.length === 0) {
              addProject(name.trim(), null, desc, deadline || null, Number(rate) || null)
              onComplete()
            } else {
              setStep(textSteps.length)
            }
          }
        }}
      />
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>New Project</strong> — Client (Step 5/{textSteps.length + 1})</text>
      {clientChoices.map((c, i) => (
        <text key={i} fg={i === clientIdx ? "#7aa2f7" : "#565f89"}>
          {i === clientIdx ? "▸ " : "  "}{c.name}
        </text>
      ))}
      <text fg="#414868">Up/Down to pick, Enter to create project</text>
      <input placeholder="" onSubmit={() => {
        const selectedClientId = clientChoices[clientIdx]?.id ?? null
        addProject(name.trim(), selectedClientId, desc, deadline || null, Number(rate) || null)
        onComplete()
      }} focused style={{ width: 1 }} />
    </box>
  )
}
