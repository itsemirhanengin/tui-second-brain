import { Database } from "bun:sqlite"
import { join } from "path"
import { homedir } from "os"
import { mkdirSync, existsSync } from "fs"

const DATA_DIR = join(homedir(), ".tui-second-brain")

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

const DB_PATH = join(DATA_DIR, "brain.db")

const db = new Database(DB_PATH, { create: true })

db.run("PRAGMA journal_mode = WAL")
db.run("PRAGMA foreign_keys = ON")
db.run("PRAGMA busy_timeout = 5000")

export default db
export { DB_PATH, DATA_DIR }
