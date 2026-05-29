import { WizardForm } from "../../../components/shared/WizardForm"
import type { Task } from "../taskStore"

interface EditTaskWizardProps {
  task: Task
  editTitle: string
  editDesc: string
  editLabels: string
  editDue: string
  setEditTitle: (v: string) => void
  setEditDesc: (v: string) => void
  setEditLabels: (v: string) => void
  setEditDue: (v: string) => void
  editStep: number
  onSubmit: () => void
}

export function EditTaskWizard({ editTitle, editDesc, editLabels, editDue, setEditTitle, setEditDesc, setEditLabels, setEditDue, editStep, onSubmit }: EditTaskWizardProps) {
  const steps = [
    { label: "Title:", placeholder: "", value: editTitle, onInput: setEditTitle },
    { label: "Description:", placeholder: "", value: editDesc, onInput: setEditDesc },
    { label: "Labels (comma-sep):", placeholder: "bug,feature", value: editLabels, onInput: setEditLabels },
    { label: "Due Date (YYYY-MM-DD):", placeholder: "", value: editDue, onInput: setEditDue },
  ]

  return (
    <WizardForm
      title="Edit Task"
      steps={steps}
      currentStep={editStep}
      onSubmit={onSubmit}
    />
  )
}
