import { PROGRESS_ICONS, COLOR_PALETTE, type ProgressLevel } from "../taskStore"

const PROGRESS_LEVELS: ProgressLevel[] = ["none", "quarter", "half", "three_quarter", "full", "cancelled"]
const PROGRESS_LABELS: Record<ProgressLevel, string> = {
  none: "Not started",
  quarter: "Started",
  half: "Halfway",
  three_quarter: "Almost done",
  full: "Complete",
  cancelled: "Cancelled",
}

interface StatusWizardProps {
  isEdit: boolean
  statusStep: number
  statusName: string
  statusColorIdx: number
  statusProgressIdx: number
  setStatusName: (v: string) => void
  onNameSubmit: () => void
  onColorSubmit: () => void
  onProgressSubmit: () => void
}

export function StatusWizard({ isEdit, statusStep, statusName, statusColorIdx, statusProgressIdx, setStatusName, onNameSubmit, onColorSubmit, onProgressSubmit }: StatusWizardProps) {
  if (statusStep === 1) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{isEdit ? "Edit" : "New"} Status</strong> — Color</text>
        <box style={{ flexDirection: "row", flexWrap: "wrap", gap: 0 }}>
          {COLOR_PALETTE.map((c, i) => (
            <text key={c} fg={i === statusColorIdx ? "#ffffff" : c} bg={i === statusColorIdx ? c : undefined}>{" ● "}</text>
          ))}
        </box>
        <text fg="#565f89">Selected: <span fg={COLOR_PALETTE[statusColorIdx]}>████ {COLOR_PALETTE[statusColorIdx]}</span></text>
        <text fg="#414868">Left/Right to pick, Enter to confirm, ESC to cancel</text>
        <input placeholder="" onSubmit={onColorSubmit} focused style={{ width: 1 }} />
      </box>
    )
  }

  if (statusStep === 2) {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7"><strong>{isEdit ? "Edit" : "New"} Status</strong> — Progress Level</text>
        {PROGRESS_LEVELS.map((level, i) => (
          <text key={level} fg={i === statusProgressIdx ? "#7aa2f7" : "#565f89"}>
            {i === statusProgressIdx ? "▸ " : "  "}{PROGRESS_ICONS[level]} {PROGRESS_LABELS[level]}
          </text>
        ))}
        <text fg="#414868">Up/Down to pick, Enter to confirm, ESC to cancel</text>
        <input placeholder="" onSubmit={onProgressSubmit} focused style={{ width: 1 }} />
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7"><strong>{isEdit ? "Edit" : "New"} Status</strong> — Name</text>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#565f89">Status Name:</text>
        <input placeholder="e.g. In Review" value={statusName} onInput={setStatusName} onSubmit={onNameSubmit} focused style={{ width: 30 }} />
      </box>
      <text fg="#414868">Enter to continue, ESC to cancel</text>
    </box>
  )
}
