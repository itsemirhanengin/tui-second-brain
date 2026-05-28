import db from "../../db/connection"
import { now } from "../../utils/date"

export type ProgressLevel = "none" | "quarter" | "half" | "three_quarter" | "full" | "cancelled"
export type Priority = "none" | "low" | "medium" | "high" | "urgent"

export interface TaskStatus {
  id: number
  name: string
  color: string
  position: number
  progress: ProgressLevel
}

export interface Task {
  id: number
  title: string
  description: string
  status_id: number
  project_id: number | null
  priority: Priority
  assignee: string
  labels: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export const PROGRESS_ICONS: Record<ProgressLevel, string> = {
  none: "○",
  quarter: "◔",
  half: "◑",
  three_quarter: "◕",
  full: "●",
  cancelled: "⊘",
}

export const PRIORITY_ICONS: Record<Priority, { icon: string; color: string }> = {
  none: { icon: "  ", color: "#414868" },
  low: { icon: "↓ ", color: "#565f89" },
  medium: { icon: "─ ", color: "#f39c12" },
  high: { icon: "↑ ", color: "#e94560" },
  urgent: { icon: "⚡", color: "#ff0055" },
}

export const COLOR_PALETTE = [
  "#e94560", "#ff6b6b", "#f39c12", "#f1c40f",
  "#16c79a", "#2ecc71", "#1abc9c", "#3498db",
  "#7aa2f7", "#bb9af7", "#9b59b6", "#8e44ad",
  "#e67e22", "#e74c3c", "#565f89", "#414868",
]

// --- Task Statuses ---

export function getTaskStatuses(): TaskStatus[] {
  return db.query("SELECT * FROM task_statuses ORDER BY position").all() as TaskStatus[]
}

export function getTaskStatusById(id: number): TaskStatus | null {
  return db.query("SELECT * FROM task_statuses WHERE id = ?").get(id) as TaskStatus | null
}

export function createTaskStatus(name: string, color: string, progress: ProgressLevel): TaskStatus {
  const maxPos = db.query("SELECT COALESCE(MAX(position), -1) as m FROM task_statuses").get() as { m: number }
  const result = db.prepare("INSERT INTO task_statuses (name, color, position, progress) VALUES (?, ?, ?, ?)").run(name, color, maxPos.m + 1, progress)
  return getTaskStatusById(Number(result.lastInsertRowid))!
}

export function updateTaskStatus(id: number, name: string, color: string, progress: ProgressLevel): void {
  db.run("UPDATE task_statuses SET name = ?, color = ?, progress = ? WHERE id = ?", [name, color, progress, id])
}

export function deleteTaskStatus(id: number): void {
  db.run("DELETE FROM tasks WHERE status_id = ?", [id])
  db.run("DELETE FROM task_statuses WHERE id = ?", [id])
}

export function reorderStatus(id: number, newPosition: number): void {
  const status = getTaskStatusById(id)
  if (!status) return
  const oldPos = status.position
  if (newPosition > oldPos) {
    db.run("UPDATE task_statuses SET position = position - 1 WHERE position > ? AND position <= ?", [oldPos, newPosition])
  } else {
    db.run("UPDATE task_statuses SET position = position + 1 WHERE position >= ? AND position < ?", [newPosition, oldPos])
  }
  db.run("UPDATE task_statuses SET position = ? WHERE id = ?", [newPosition, id])
}

// --- Tasks ---

export function getTasks(projectId?: number): Task[] {
  if (projectId) {
    return db.query("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC").all(projectId) as Task[]
  }
  return db.query("SELECT * FROM tasks ORDER BY created_at DESC").all() as Task[]
}

export function getTasksByStatus(statusId: number, projectId?: number): Task[] {
  if (projectId) {
    return db.query("SELECT * FROM tasks WHERE status_id = ? AND project_id = ? ORDER BY updated_at DESC").all(statusId, projectId) as Task[]
  }
  return db.query("SELECT * FROM tasks WHERE status_id = ? ORDER BY updated_at DESC").all(statusId) as Task[]
}

export function getTaskById(id: number): Task | null {
  return db.query("SELECT * FROM tasks WHERE id = ?").get(id) as Task | null
}

export function createTask(title: string, statusId: number, projectId: number | null = null, priority: Priority = "none", description: string = ""): Task {
  const result = db.prepare("INSERT INTO tasks (title, description, status_id, project_id, priority) VALUES (?, ?, ?, ?, ?)").run(title, description, statusId, projectId, priority)
  return getTaskById(Number(result.lastInsertRowid))!
}

export function updateTask(id: number, title: string, description: string, priority: Priority, labels: string, dueDate: string | null): void {
  db.run("UPDATE tasks SET title = ?, description = ?, priority = ?, labels = ?, due_date = ?, updated_at = ? WHERE id = ?", [title, description, priority, labels, dueDate, now(), id])
}

export function moveTask(id: number, newStatusId: number): void {
  db.run("UPDATE tasks SET status_id = ?, updated_at = ? WHERE id = ?", [newStatusId, now(), id])
}

export function setTaskProject(id: number, projectId: number | null): void {
  db.run("UPDATE tasks SET project_id = ?, updated_at = ? WHERE id = ?", [projectId, now(), id])
}

export function deleteTask(id: number): void {
  db.run("DELETE FROM tasks WHERE id = ?", [id])
}

export function getTaskCountByStatus(projectId?: number): Map<number, number> {
  const query = projectId
    ? "SELECT status_id, COUNT(*) as cnt FROM tasks WHERE project_id = ? GROUP BY status_id"
    : "SELECT status_id, COUNT(*) as cnt FROM tasks GROUP BY status_id"
  const rows = (projectId ? db.query(query).all(projectId) : db.query(query).all()) as { status_id: number; cnt: number }[]
  const map = new Map<number, number>()
  for (const r of rows) map.set(r.status_id, r.cnt)
  return map
}
