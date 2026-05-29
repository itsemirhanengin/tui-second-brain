interface WizardStep {
  label: string
  placeholder: string
  value: string
  onInput: (value: string) => void
}

interface WizardFormProps {
  title: string
  steps: WizardStep[]
  currentStep: number
  onSubmit: () => void
  hint?: string
}

export function WizardForm({ title, steps, currentStep, onSubmit, hint }: WizardFormProps) {
  const step = steps[currentStep]
  if (!step) return null

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>{title}</strong> (Step {currentStep + 1}/{steps.length})</text>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#565f89">{step.label}</text>
        <input
          placeholder={step.placeholder}
          value={step.value}
          onInput={step.onInput}
          onSubmit={onSubmit}
          focused
          style={{ width: 40 }}
        />
      </box>
      <text fg="#414868">{hint ?? "Enter to continue, ESC to cancel"}</text>
    </box>
  )
}
