import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { runMigrations } from "./db/migrations"
import { processRecurringTransactions } from "./modules/life/budget/recurringStore"
import { App } from "./app"

runMigrations()
processRecurringTransactions()

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
})

createRoot(renderer).render(<App />)
