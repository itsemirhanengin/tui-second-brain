import db from "../db/connection"
import { writeFileSync } from "fs"
import { join } from "path"

const TABLES = [
  "settings",
  "water_goals",
  "water_entries",
  "notes",
  "accounts",
  "categories",
  "transactions",
  "budgets",
  "credit_card_debts",
  "loans",
  "liability_payments",
  "routines",
  "routine_logs",
  "clients",
  "projects",
  "time_entries",
]

export function exportToJson(outputDir: string): string {
  const data: Record<string, unknown[]> = {}
  for (const table of TABLES) {
    data[table] = db.query(`SELECT * FROM ${table}`).all()
  }
  const filePath = join(outputDir, `second-brain-export-${new Date().toISOString().split("T")[0]}.json`)
  writeFileSync(filePath, JSON.stringify(data, null, 2))
  return filePath
}

export function exportTableToCsv(tableName: string, outputDir: string): string {
  const rows = db.query(`SELECT * FROM ${tableName}`).all() as Record<string, unknown>[]
  if (rows.length === 0) return ""

  const headers = Object.keys(rows[0])
  const csvLines = [headers.join(",")]
  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h]
      if (val === null || val === undefined) return ""
      const str = String(val)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    csvLines.push(values.join(","))
  }

  const filePath = join(outputDir, `${tableName}-${new Date().toISOString().split("T")[0]}.csv`)
  writeFileSync(filePath, csvLines.join("\n"))
  return filePath
}

export function exportAllCsv(outputDir: string): string[] {
  const paths: string[] = []
  for (const table of TABLES) {
    const p = exportTableToCsv(table, outputDir)
    if (p) paths.push(p)
  }
  return paths
}
