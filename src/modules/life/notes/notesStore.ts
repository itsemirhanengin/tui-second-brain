import db from "../../../db/connection"
import { now } from "../../../utils/date"

export interface Note {
  id: number
  title: string
  content: string
  is_archived: number
  is_locked: number
  password_hash: string | null
  project_id: number | null
  tags: string
  created_at: string
  updated_at: string
}

export function getAllNotes(includeArchived: boolean = false): Note[] {
  if (includeArchived) {
    return db.query("SELECT * FROM notes ORDER BY updated_at DESC").all() as Note[]
  }
  return db.query("SELECT * FROM notes WHERE is_archived = 0 ORDER BY updated_at DESC").all() as Note[]
}

export function getArchivedNotes(): Note[] {
  return db.query("SELECT * FROM notes WHERE is_archived = 1 ORDER BY updated_at DESC").all() as Note[]
}

export function getNoteById(id: number): Note | null {
  return db.query("SELECT * FROM notes WHERE id = ?").get(id) as Note | null
}

export function searchNotes(query: string): Note[] {
  const pattern = `%${query}%`
  return db.query("SELECT * FROM notes WHERE is_archived = 0 AND (title LIKE ? OR content LIKE ? OR tags LIKE ?) ORDER BY updated_at DESC").all(pattern, pattern, pattern) as Note[]
}

export function getNotesByProject(projectId: number): Note[] {
  return db.query("SELECT * FROM notes WHERE project_id = ? AND is_archived = 0 ORDER BY updated_at DESC").all(projectId) as Note[]
}

export function createNote(title: string, content: string = "", tags: string = "", projectId: number | null = null): Note {
  const stmt = db.prepare("INSERT INTO notes (title, content, tags, project_id) VALUES (?, ?, ?, ?)")
  const result = stmt.run(title, content, tags, projectId)
  return getNoteById(Number(result.lastInsertRowid))!
}

export function updateNote(id: number, title: string, content: string, tags: string): void {
  db.run("UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?", [title, content, tags, now(), id])
}

export function archiveNote(id: number): void {
  db.run("UPDATE notes SET is_archived = 1, updated_at = ? WHERE id = ?", [now(), id])
}

export function unarchiveNote(id: number): void {
  db.run("UPDATE notes SET is_archived = 0, updated_at = ? WHERE id = ?", [now(), id])
}

export function deleteNote(id: number): void {
  db.run("DELETE FROM notes WHERE id = ?", [id])
}

export function lockNote(id: number, passwordHash: string): void {
  db.run("UPDATE notes SET is_locked = 1, password_hash = ?, updated_at = ? WHERE id = ?", [passwordHash, now(), id])
}

export function unlockNote(id: number): void {
  db.run("UPDATE notes SET is_locked = 0, password_hash = NULL, updated_at = ? WHERE id = ?", [now(), id])
}

export function setNoteProject(id: number, projectId: number | null): void {
  db.run("UPDATE notes SET project_id = ?, updated_at = ? WHERE id = ?", [projectId, now(), id])
}
