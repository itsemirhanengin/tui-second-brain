import { useState, useCallback, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { consumePendingAction } from "../../../utils/pendingAction"
import { setGlobalInputFocus } from "../../../utils/inputFocus"
import { EmptyState } from "../../../components/shared/EmptyState"
import {
  getAllNotes,
  getArchivedNotes,
  searchNotes,
  createNote,
  archiveNote,
  unarchiveNote,
  deleteNote,
  type Note,
} from "./notesStore"
import { NoteEditor } from "./NoteEditor"
import { NoteViewer } from "./NoteViewer"
import { hashPassword, verifyPassword } from "../../../utils/crypto"

type View = "list" | "archive" | "editor" | "viewer" | "new" | "search" | "password"

export function NotesList() {
  const [view, setView] = useState<View>("list")
  const [notes, setNotes] = useState(getAllNotes())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [inputFocused, _setInputFocused] = useState(false)
  const setInputFocused = (v: boolean) => { _setInputFocused(v); setGlobalInputFocus(v) }
  const [passwordInput, setPasswordInput] = useState("")
  const [pendingAction, setPendingAction] = useState<"view" | "edit" | null>(null)
  const [newTitle, setNewTitle] = useState("")

  const refresh = useCallback(() => {
    setNotes(view === "archive" ? getArchivedNotes() : getAllNotes())
    setSelectedIndex(0)
  }, [view])

  const openNote = useCallback(
    async (note: Note, action: "view" | "edit") => {
      if (note.is_locked && note.password_hash) {
        setActiveNote(note)
        setPendingAction(action)
        setView("password")
        setInputFocused(true)
        return
      }
      setActiveNote(note)
      setView(action === "view" ? "viewer" : "editor")
    },
    []
  )

  const didConsume = useRef(false)
  useEffect(() => {
    if (didConsume.current) return
    const action = consumePendingAction()
    if (action === "new-note") {
      didConsume.current = true
      setView("new"); setNewTitle(""); setInputFocused(true)
    }
  })

  useKeyboard((key) => {
    if (key.name === "escape" && inputFocused) {
      setView("list"); setNotes(getAllNotes()); setInputFocused(false); setSelectedIndex(0)
      return
    }

    if (inputFocused) return

    if (view === "list" || view === "archive") {
      switch (key.name) {
        case "up":
          setSelectedIndex((i) => Math.max(0, i - 1))
          break
        case "down":
          setSelectedIndex((i) => Math.min(notes.length - 1, i + 1))
          break
        case "return":
          if (notes[selectedIndex]) openNote(notes[selectedIndex], "view")
          break
        case "e":
          if (notes[selectedIndex]) openNote(notes[selectedIndex], "edit")
          break
        case "n":
          setView("new")
          setNewTitle("")
          setInputFocused(true)
          break
        case "a":
          if (view === "list") {
            setView("archive")
            setNotes(getArchivedNotes())
            setSelectedIndex(0)
          } else {
            setView("list")
            setNotes(getAllNotes())
            setSelectedIndex(0)
          }
          break
        case "x":
          if (notes[selectedIndex]) {
            if (view === "archive") {
              deleteNote(notes[selectedIndex].id)
            } else {
              archiveNote(notes[selectedIndex].id)
            }
            refresh()
          }
          break
        case "u":
          if (view === "archive" && notes[selectedIndex]) {
            unarchiveNote(notes[selectedIndex].id)
            refresh()
          }
          break
        case "/":
          setView("search")
          setSearchQuery("")
          setInputFocused(true)
          break
      }
    } else if (key.name === "escape") {
      setView("list")
      setNotes(getAllNotes())
      setInputFocused(false)
      setSelectedIndex(0)
    }
  })

  if (view === "password") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#f39c12">
          <strong>This note is locked</strong>
        </text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Password:</text>
          <input
            placeholder="Enter password..."
            value={passwordInput}
            onInput={setPasswordInput}
            onSubmit={(async (val: string) => {
              setPasswordInput(val)
              if (activeNote?.password_hash) {
                const valid = await verifyPassword(val, activeNote.password_hash)
                if (valid) {
                  setView(pendingAction === "edit" ? "editor" : "viewer")
                } else {
                  setPasswordInput("")
                }
              }
              setInputFocused(false)
            }) as any}
            focused
            style={{ width: 30 }}
          />
        </box>
        <text fg="#414868">Enter password to unlock, ESC to cancel</text>
      </box>
    )
  }

  if (view === "new") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7">
          <strong>New Note</strong>
        </text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Title:</text>
          <input
            placeholder="Note title..."
            value={newTitle}
            onInput={setNewTitle}
            onSubmit={((val: string) => {
              setNewTitle(val)
              if (val.trim()) {
                const note = createNote(val.trim())
                setActiveNote(note)
                setView("editor")
              }
              setInputFocused(false)
            }) as any}
            focused
            style={{ width: 40 }}
          />
        </box>
        <text fg="#414868">Press Enter to create, ESC to cancel</text>
      </box>
    )
  }

  if (view === "search") {
    return (
      <box style={{ flexDirection: "column", gap: 1 }}>
        <text fg="#7aa2f7">
          <strong>Search Notes</strong>
        </text>
        <box style={{ flexDirection: "row", gap: 1 }}>
          <text fg="#565f89">Query:</text>
          <input
            placeholder="Search..."
            value={searchQuery}
            onInput={setSearchQuery}
            onSubmit={((val: string) => {
              setSearchQuery(val)
              setNotes(searchNotes(val))
              setView("list")
              setInputFocused(false)
              setSelectedIndex(0)
            }) as any}
            focused
            style={{ width: 40 }}
          />
        </box>
        <text fg="#414868">Press Enter to search, ESC to cancel</text>
      </box>
    )
  }

  if (view === "editor" && activeNote) {
    return (
      <NoteEditor
        note={activeNote}
        onDone={() => {
          setView("list")
          refresh()
        }}
      />
    )
  }

  if (view === "viewer" && activeNote) {
    return (
      <NoteViewer
        note={activeNote}
        onEdit={() => setView("editor")}
        onBack={() => {
          setView("list")
          refresh()
        }}
      />
    )
  }

  const isArchive = view === "archive"

  return (
    <box style={{ flexDirection: "column", gap: 1 }}>
      <text fg="#7aa2f7">
        <strong>{isArchive ? "Archived Notes" : "Notes"}</strong>
        <span fg="#565f89"> ({notes.length})</span>
      </text>

      <text fg="#565f89">
        [N] New [Enter] View [E] Edit [/] Search [A] {isArchive ? "Active" : "Archive View"} [X]{" "}
        {isArchive ? "Delete" : "Archive"}
        {isArchive ? " [U] Unarchive" : ""}
      </text>

      {notes.length === 0 ? (
        <EmptyState message={isArchive ? "No archived notes" : "No notes yet"} hint="Press 'N' to create a new note" />
      ) : (
        <scrollbox style={{ flexGrow: 1, borderStyle: "single", borderColor: "#292e42", padding: 1 }} viewportCulling>
          {notes.map((note, idx) => (
            <box key={note.id} style={{ flexDirection: "row", gap: 1 }}>
              <text fg={idx === selectedIndex ? "#7aa2f7" : "#e2e8f0"}>
                {idx === selectedIndex ? "▸ " : "  "}
                {note.is_locked ? "🔒 " : ""}
                {note.title}
              </text>
              {note.tags && <text fg="#414868">[{note.tags}]</text>}
              <text fg="#565f89">{note.updated_at.substring(0, 10)}</text>
            </box>
          ))}
        </scrollbox>
      )}
    </box>
  )
}
