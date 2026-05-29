import { PRIORITY_ICONS, PROGRESS_ICONS, type TaskStatus, type Priority } from "../taskStore"
import type { Project } from "../workStore"

const PRIORITIES: Priority[] = ["none", "low", "medium", "high", "urgent"]

interface NewTaskWizardProps {
  step: number
  title: string
  desc: string
  setTitle: (v: string) => void
  setDesc: (v: string) => void
  projects: Project[]
  statuses: TaskStatus[]
  projectIdx: number
  statusIdx: number
  priority: Priority
  onNext: () => void
}

export function NewTaskWizard({ step, title, desc, setTitle, setDesc, projects, statuses, projectIdx, statusIdx, priority, onNext }: NewTaskWizardProps) {
  const textSteps = [
    { label: "Task Title:", placeholder: "What needs to be done?", value: title, setter: setTitle },
    { label: "Description (optional):", placeholder: "", value: desc, setter: setDesc },
  ]
  const projectChoices = [{ name: "No Project" }, ...projects.map((p) => ({ name: p.name }))]

  if (step < textSteps.length) {
    const s = textSteps[step]
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Task</strong> (Step {step + 1}/5)</text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">{s.label}</text>
          <input placeholder={s.placeholder} value={s.value} onInput={s.setter} onSubmit={((val: string) => {
            s.setter(val)
            onNext()
          }) as any} focused style={{ width: 40 }} />
        </box>
        <text fg="#414868">Enter to continue, ESC to cancel</text>
      </box>
    )
  }

  if (step === 2) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Task</strong> — Project (Step 3/5)</text>
        {projectChoices.map((p, i) => (
          <text key={i} fg={i === projectIdx ? "#7aa2f7" : "#565f89"}>
            {i === projectIdx ? "▸ " : "  "}{p.name}
          </text>
        ))}
        <text fg="#414868">Up/Down to pick, Enter to confirm</text>
        <input placeholder="" onSubmit={onNext} focused style={{ width: 1 }} />
      </box>
    )
  }

  if (step === 3) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Task</strong> — Status (Step 4/5)</text>
        {statuses.map((s, i) => (
          <text key={s.id} fg={i === statusIdx ? "#7aa2f7" : "#565f89"}>
            {i === statusIdx ? "▸ " : "  "}<span fg={s.color}>{PROGRESS_ICONS[s.progress]}</span> {s.name}
          </text>
        ))}
        <text fg="#414868">Up/Down to pick, Enter to confirm</text>
        <input placeholder="" onSubmit={onNext} focused style={{ width: 1 }} />
      </box>
    )
  }

  if (step === 4) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>New Task</strong> — Priority (Step 5/5)</text>
        {PRIORITIES.map((p, i) => {
          const pi = PRIORITY_ICONS[p]
          return (
            <text key={p} fg={PRIORITIES.indexOf(priority) === i ? "#7aa2f7" : "#565f89"}>
              {PRIORITIES.indexOf(priority) === i ? "▸ " : "  "}<span fg={pi.color}>{pi.icon}</span>{p === "none" ? "No priority" : p.charAt(0).toUpperCase() + p.slice(1)}
            </text>
          )
        })}
        <text fg="#414868">Up/Down to pick, Enter to create</text>
        <input placeholder="" onSubmit={onNext} focused style={{ width: 1 }} />
      </box>
    )
  }

  return null
}
