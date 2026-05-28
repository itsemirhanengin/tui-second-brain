import db from "../../db/connection"
import { today } from "../../utils/date"

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  notes: string
  hourly_rate: number
  is_active: number
  created_at: string
}

export interface Project {
  id: number
  name: string
  client_id: number | null
  description: string
  status: string
  deadline: string | null
  hourly_rate: number | null
  created_at: string
}

export interface TimeEntry {
  id: number
  project_id: number | null
  description: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  is_running: number
  created_at: string
}

// --- Clients ---

export function getClients(activeOnly: boolean = true): Client[] {
  if (activeOnly) {
    return db.query("SELECT * FROM clients WHERE is_active = 1 ORDER BY name").all() as Client[]
  }
  return db.query("SELECT * FROM clients ORDER BY name").all() as Client[]
}

export function getClientById(id: number): Client | null {
  return db.query("SELECT * FROM clients WHERE id = ?").get(id) as Client | null
}

export function createClient(name: string, email: string = "", phone: string = "", company: string = "", notes: string = "", hourlyRate: number = 0): Client {
  const result = db.prepare("INSERT INTO clients (name, email, phone, company, notes, hourly_rate) VALUES (?, ?, ?, ?, ?, ?)").run(name, email, phone, company, notes, hourlyRate)
  return getClientById(Number(result.lastInsertRowid))!
}

export function updateClient(id: number, name: string, email: string, phone: string, company: string, notes: string, hourlyRate: number): void {
  db.run("UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, notes = ?, hourly_rate = ? WHERE id = ?", [name, email, phone, company, notes, hourlyRate, id])
}

export function toggleClientActive(id: number): void {
  db.run("UPDATE clients SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?", [id])
}

export function deleteClient(id: number): void {
  db.run("DELETE FROM clients WHERE id = ?", [id])
}

// --- Projects ---

export function getProjects(status?: string): Project[] {
  if (status) {
    return db.query("SELECT * FROM projects WHERE status = ? ORDER BY name").all(status) as Project[]
  }
  return db.query("SELECT * FROM projects ORDER BY CASE status WHEN 'active' THEN 1 WHEN 'paused' THEN 2 WHEN 'completed' THEN 3 WHEN 'archived' THEN 4 END, name").all() as Project[]
}

export function getProjectById(id: number): Project | null {
  return db.query("SELECT * FROM projects WHERE id = ?").get(id) as Project | null
}

export function getProjectsByClient(clientId: number): Project[] {
  return db.query("SELECT * FROM projects WHERE client_id = ? ORDER BY name").all(clientId) as Project[]
}

export function createProject(name: string, clientId: number | null = null, description: string = "", deadline: string | null = null, hourlyRate: number | null = null): Project {
  const result = db.prepare("INSERT INTO projects (name, client_id, description, deadline, hourly_rate) VALUES (?, ?, ?, ?, ?)").run(name, clientId, description, deadline, hourlyRate)
  return getProjectById(Number(result.lastInsertRowid))!
}

export function updateProject(id: number, name: string, clientId: number | null, description: string, status: string, deadline: string | null, hourlyRate: number | null): void {
  db.run("UPDATE projects SET name = ?, client_id = ?, description = ?, status = ?, deadline = ?, hourly_rate = ? WHERE id = ?", [name, clientId, description, status, deadline, hourlyRate, id])
}

export function deleteProject(id: number): void {
  db.run("DELETE FROM projects WHERE id = ?", [id])
}

// --- Time Entries ---

export function getTimeEntries(projectId?: number, limit: number = 50): TimeEntry[] {
  if (projectId) {
    return db.query("SELECT * FROM time_entries WHERE project_id = ? ORDER BY start_time DESC LIMIT ?").all(projectId, limit) as TimeEntry[]
  }
  return db.query("SELECT * FROM time_entries ORDER BY start_time DESC LIMIT ?").all(limit) as TimeEntry[]
}

export function getRunningTimer(): TimeEntry | null {
  return db.query("SELECT * FROM time_entries WHERE is_running = 1 LIMIT 1").get() as TimeEntry | null
}

export function startTimer(projectId: number | null = null, description: string = ""): TimeEntry {
  const existing = getRunningTimer()
  if (existing) {
    stopTimer(existing.id)
  }

  const startTime = new Date().toISOString()
  const result = db.prepare("INSERT INTO time_entries (project_id, description, start_time, is_running) VALUES (?, ?, ?, 1)").run(projectId, description, startTime)
  return db.query("SELECT * FROM time_entries WHERE id = ?").get(Number(result.lastInsertRowid)) as TimeEntry
}

export function stopTimer(id: number): TimeEntry {
  const entry = db.query("SELECT * FROM time_entries WHERE id = ?").get(id) as TimeEntry
  const endTime = new Date().toISOString()
  const start = new Date(entry.start_time).getTime()
  const end = new Date(endTime).getTime()
  const durationMinutes = Math.round((end - start) / 60000)

  db.run("UPDATE time_entries SET end_time = ?, duration_minutes = ?, is_running = 0 WHERE id = ?", [endTime, durationMinutes, id])
  return db.query("SELECT * FROM time_entries WHERE id = ?").get(id) as TimeEntry
}

export function createManualEntry(projectId: number | null, description: string, startTime: string, endTime: string): TimeEntry {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const durationMinutes = Math.round((end - start) / 60000)

  const result = db.prepare("INSERT INTO time_entries (project_id, description, start_time, end_time, duration_minutes, is_running) VALUES (?, ?, ?, ?, ?, 0)").run(projectId, description, startTime, endTime, durationMinutes)
  return db.query("SELECT * FROM time_entries WHERE id = ?").get(Number(result.lastInsertRowid)) as TimeEntry
}

export function deleteTimeEntry(id: number): void {
  db.run("DELETE FROM time_entries WHERE id = ?", [id])
}

export function getTodayTotalMinutes(): number {
  const todayStr = today()
  const row = db.query(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total
    FROM time_entries
    WHERE date(start_time) = ? AND is_running = 0
  `).get(todayStr) as { total: number }
  return row.total
}

export function getWeekTotalMinutes(): number {
  const row = db.query(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total
    FROM time_entries
    WHERE start_time >= date('now', 'weekday 0', '-7 days') AND is_running = 0
  `).get() as { total: number }
  return row.total
}

export function getProjectTotalMinutes(projectId: number): number {
  const row = db.query("SELECT COALESCE(SUM(duration_minutes), 0) as total FROM time_entries WHERE project_id = ? AND is_running = 0").get(projectId) as { total: number }
  return row.total
}

export function getProjectHourlyRate(project: Project): number {
  if (project.hourly_rate) return project.hourly_rate
  if (project.client_id) {
    const client = getClientById(project.client_id)
    if (client) return client.hourly_rate
  }
  return 0
}

export function getProjectBillable(projectId: number): number {
  const project = getProjectById(projectId)
  if (!project) return 0
  const rate = getProjectHourlyRate(project)
  const totalMinutes = getProjectTotalMinutes(projectId)
  return (totalMinutes / 60) * rate
}
