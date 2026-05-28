import db from "../../../db/connection"
import { now } from "../../../utils/date"

export interface Goal {
  id: number
  title: string
  description: string
  target_date: string | null
  target_value: number | null
  current_value: number
  unit: string
  linked_module: string | null
  is_completed: number
  created_at: string
}

export interface Milestone {
  id: number
  goal_id: number
  title: string
  is_completed: number
  completed_at: string | null
}

export function getGoals(includeCompleted = false): Goal[] {
  if (includeCompleted) return db.query("SELECT * FROM goals ORDER BY is_completed, created_at DESC").all() as Goal[]
  return db.query("SELECT * FROM goals WHERE is_completed = 0 ORDER BY created_at DESC").all() as Goal[]
}

export function getGoalById(id: number): Goal | null {
  return db.query("SELECT * FROM goals WHERE id = ?").get(id) as Goal | null
}

export function createGoal(title: string, description: string, targetDate: string | null, targetValue: number | null, unit: string): Goal {
  const result = db.prepare(
    "INSERT INTO goals (title, description, target_date, target_value, unit) VALUES (?, ?, ?, ?, ?)",
  ).run(title, description, targetDate, targetValue, unit)
  return getGoalById(Number(result.lastInsertRowid))!
}

export function updateGoalProgress(id: number, currentValue: number): void {
  db.run("UPDATE goals SET current_value = ? WHERE id = ?", [currentValue, id])
  const goal = getGoalById(id)
  if (goal?.target_value && currentValue >= goal.target_value) {
    db.run("UPDATE goals SET is_completed = 1 WHERE id = ?", [id])
  }
}

export function toggleGoalComplete(id: number): void {
  db.run("UPDATE goals SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END WHERE id = ?", [id])
}

export function deleteGoal(id: number): void {
  db.run("DELETE FROM milestones WHERE goal_id = ?", [id])
  db.run("DELETE FROM goals WHERE id = ?", [id])
}

export function getMilestones(goalId: number): Milestone[] {
  return db.query("SELECT * FROM milestones WHERE goal_id = ? ORDER BY is_completed, id").all(goalId) as Milestone[]
}

export function createMilestone(goalId: number, title: string): Milestone {
  const result = db.prepare("INSERT INTO milestones (goal_id, title) VALUES (?, ?)").run(goalId, title)
  return db.query("SELECT * FROM milestones WHERE id = ?").get(Number(result.lastInsertRowid)) as Milestone
}

export function toggleMilestone(id: number): void {
  const ms = db.query("SELECT * FROM milestones WHERE id = ?").get(id) as Milestone | null
  if (!ms) return
  const completedAt = ms.is_completed ? null : now()
  db.run("UPDATE milestones SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END, completed_at = ? WHERE id = ?", [completedAt, id])
}

export function deleteMilestone(id: number): void {
  db.run("DELETE FROM milestones WHERE id = ?", [id])
}

export function getGoalProgress(goalId: number): number {
  const goal = getGoalById(goalId)
  if (!goal) return 0
  if (goal.is_completed) return 100

  if (goal.target_value && goal.target_value > 0) {
    return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
  }

  const milestones = getMilestones(goalId)
  if (milestones.length === 0) return 0
  const completed = milestones.filter((m) => m.is_completed).length
  return Math.round((completed / milestones.length) * 100)
}
