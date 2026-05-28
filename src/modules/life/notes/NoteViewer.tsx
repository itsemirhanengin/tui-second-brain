import type { Note } from "./notesStore"

interface NoteViewerProps {
  note: Note
  onEdit: () => void
  onBack: () => void
}

export function NoteViewer({ note, onEdit, onBack }: NoteViewerProps) {
  const lines = note.content.split("\n")

  return (
    <box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <text fg="#7aa2f7">
          <strong>{note.title}</strong>
        </text>
        {note.is_locked && <text fg="#f39c12">🔒</text>}
        {note.tags && <text fg="#414868">[{note.tags}]</text>}
      </box>
      <text fg="#565f89">
        Created: {note.created_at.substring(0, 10)} | Updated: {note.updated_at.substring(0, 10)}
      </text>

      <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
        {lines.map((line, idx) => {
          if (line.startsWith("# ")) return <text key={idx} fg="#7aa2f7"><strong>{line.substring(2)}</strong></text>
          if (line.startsWith("## ")) return <text key={idx} fg="#bb9af7"><strong>{line.substring(3)}</strong></text>
          if (line.startsWith("### ")) return <text key={idx} fg="#7dcfff">{line.substring(4)}</text>
          if (line.startsWith("- ") || line.startsWith("* ")) return <text key={idx} fg="#e2e8f0">  • {line.substring(2)}</text>
          if (line.startsWith("```")) return <text key={idx} fg="#414868">{'─'.repeat(40)}</text>
          if (line.startsWith("> ")) return <text key={idx} fg="#565f89">│ {line.substring(2)}</text>
          if (line.trim() === "") return <text key={idx}> </text>
          return <text key={idx} fg="#e2e8f0">{line}</text>
        })}
      </scrollbox>

      <text fg="#565f89">[E] Edit [ESC] Back</text>
    </box>
  )
}
