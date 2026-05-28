import { useState, useRef, useEffect } from "react"
import { useKeyboard, useRenderer } from "@opentui/react"
import { setGlobalInputFocus } from "../../../utils/inputFocus"
import type { TextareaRenderable } from "@opentui/core"
import { updateNote, lockNote, unlockNote, type Note } from "./notesStore"
import { hashPassword } from "../../../utils/crypto"

interface NoteEditorProps {
  note: Note
  onDone: () => void
}

export function NoteEditor({ note, onDone }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [tags, setTags] = useState(note.tags)
  const [mode, setMode] = useState<"title" | "content" | "tags" | "lock">("content")
  const [lockPassword, setLockPassword] = useState("")
  const textareaRef = useRef<TextareaRenderable>(null)
  const renderer = useRenderer()

  useEffect(() => {
    setGlobalInputFocus(true)
    if (textareaRef.current && note.content) {
      textareaRef.current.setText(note.content)
    }
    return () => setGlobalInputFocus(false)
  }, [note.id])

  useKeyboard((key) => {
    if (key.ctrl && key.name === "s") {
      const content = textareaRef.current?.plainText ?? note.content
      updateNote(note.id, title, content, tags)
      onDone()
      return
    }

    if (key.ctrl && key.name === "l") {
      setMode("lock")
      return
    }
  })

  if (mode === "lock") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#f39c12">
          <strong>{note.is_locked ? "Remove Lock" : "Set Lock Password"}</strong>
        </text>
        {note.is_locked ? (
          <box style={{ flexDirection: "column", gap: 1 }}>
            <text fg="#e2e8f0">Remove password protection from this note?</text>
            <text fg="#565f89">[Y] Yes [N] No</text>
            <input
              placeholder=""
              onSubmit={() => {
                unlockNote(note.id)
                setMode("content")
              }}
              focused
              style={{ width: 1 }}
            />
          </box>
        ) : (
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89">Password:</text>
            <input
              placeholder="Enter password..."
              value={lockPassword}
              onInput={setLockPassword}
              onSubmit={async () => {
                if (lockPassword.trim()) {
                  const hash = await hashPassword(lockPassword)
                  lockNote(note.id, hash)
                }
                setLockPassword("")
                setMode("content")
              }}
              focused
              style={{ width: 30 }}
            />
          </box>
        )}
        <text fg="#414868">ESC to cancel</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", gap: 1, flexGrow: 1 }}>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#7aa2f7">
          <strong>Edit Note</strong>
        </text>
        <text fg="#565f89">Ctrl+S: Save | Ctrl+L: {note.is_locked ? "Unlock" : "Lock"} | ESC: Cancel</text>
      </box>

      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg="#565f89">Title:</text>
        <input
          value={title}
          onInput={setTitle}
          focused={mode === "title"}
          style={{ width: 40 }}
          placeholder="Note title..."
        />
        <text fg="#565f89">Tags:</text>
        <input
          value={tags}
          onInput={setTags}
          focused={mode === "tags"}
          style={{ width: 20 }}
          placeholder="tag1,tag2"
        />
      </box>

      <box title="Content (Markdown)" style={{ border: true, flexGrow: 1, borderColor: "#292e42" }}>
        <textarea ref={textareaRef} placeholder="Write your note in Markdown..." focused={mode === "content"} />
      </box>
    </box>
  )
}
