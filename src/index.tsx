import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { runMigrations } from "./db/migrations"
import { App } from "./app"

runMigrations()

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
})

createRoot(renderer).render(<App />)
