import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { updateNote, type Note } from "./notesStore"

interface NoteViewerProps {
  note: Note
  onEdit: () => void
  onBack: () => void
}

const CHECKBOX_RE = /^- \[[ x]\] /

export function NoteViewer({ note, onEdit, onBack }: NoteViewerProps) {
  const [content, setContent] = useState(note.content)
  const lines = content.split("\n")

  const checkboxIndices = lines
    .map((l, i) => CHECKBOX_RE.test(l) ? i : -1)
    .filter((i) => i >= 0)

  const [selCb, setSelCb] = useState(0)

  useKeyboard((key) => {
    if (key.name === "escape") { onBack(); return }
    if (key.name === "e") { onEdit(); return }

    if (checkboxIndices.length === 0) return

    if (key.name === "up") { setSelCb((i) => Math.max(0, i - 1)); return }
    if (key.name === "down") { setSelCb((i) => Math.min(checkboxIndices.length - 1, i + 1)); return }
    if (key.name === "return") {
      const lineIdx = checkboxIndices[selCb]
      const newLines = [...lines]
      if (newLines[lineIdx].startsWith("- [ ] ")) {
        newLines[lineIdx] = newLines[lineIdx].replace("- [ ] ", "- [x] ")
      } else {
        newLines[lineIdx] = newLines[lineIdx].replace("- [x] ", "- [ ] ")
      }
      const updated = newLines.join("\n")
      updateNote(note.id, note.title, updated, note.tags)
      setContent(updated)
    }
  })

  return (
    <box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg="#7aa2f7">
          <strong>{note.title}</strong>
        </text>
        {note.is_locked === 1 && <text fg="#f39c12">🔒</text>}
        {note.tags && <text fg="#414868">[{note.tags}]</text>}
      </box>
      <text fg="#565f89">
        Created: {note.created_at.substring(0, 10)} | Updated: {note.updated_at.substring(0, 10)}
      </text>

      <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
        {lines.map((line, idx) => {
          if (CHECKBOX_RE.test(line)) {
            const checked = line.startsWith("- [x] ")
            const label = line.replace(CHECKBOX_RE, "")
            const isSel = checkboxIndices[selCb] === idx
           
            return (
              <text key={idx} fg={checked ? "#414868" : "#e2e8f0"}>
                <span fg={isSel ? "#7aa2f7" : "#414868"}>{isSel ? "▸ " : "  "}</span>
                <span fg={checked ? "#16c79a" : "#565f89"}>{checked ? "✓ " : "○ "}</span>
                {label}
              </text>
            )
          }
          if (line.startsWith("# ")) return <text key={idx} fg="#7aa2f7"><strong>{line.substring(2)}</strong></text>
          if (line.startsWith("## ")) return <text key={idx} fg="#bb9af7"><strong>{line.substring(3)}</strong></text>
          if (line.startsWith("### ")) return <text key={idx} fg="#7dcfff">{line.substring(4)}</text>
          if (line.startsWith("- ") || line.startsWith("* ")) return <text key={idx} fg="#e2e8f0">  • {line.substring(2)}</text>
          if (line.startsWith("```")) return <text key={idx} fg="#414868">{"─".repeat(40)}</text>
          if (line.startsWith("> ")) return <text key={idx} fg="#565f89">│ {line.substring(2)}</text>
          if (line.trim() === "") return <text key={idx}> </text>
          return <text key={idx} fg="#e2e8f0">{line}</text>
        })}
      </scrollbox>

      <text fg="#565f89">[E] Edit {checkboxIndices.length > 0 ? "[Enter] Toggle checkbox [Up/Down] Navigate " : ""}[ESC] Back</text>
    </box>
  )
}
