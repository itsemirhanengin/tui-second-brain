import db from "./connection"

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS water_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    daily_goal_ml INTEGER NOT NULL DEFAULT 2000,
    effective_from TEXT NOT NULL DEFAULT (date('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS water_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount_ml INTEGER NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    time TEXT NOT NULL DEFAULT (time('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    is_archived INTEGER NOT NULL DEFAULT 0,
    is_locked INTEGER NOT NULL DEFAULT 0,
    password_hash TEXT,
    project_id INTEGER,
    tags TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('bank','credit_card','cash','savings','investment','ewallet')),
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'TRY',
    credit_limit REAL,
    color TEXT NOT NULL DEFAULT '#7aa2f7',
    icon TEXT NOT NULL DEFAULT '💳',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    parent_id INTEGER,
    monthly_limit REAL,
    color TEXT NOT NULL DEFAULT '#7aa2f7',
    icon TEXT NOT NULL DEFAULT '📁',
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TRY',
    description TEXT NOT NULL DEFAULT '',
    category_id INTEGER,
    account_id INTEGER NOT NULL,
    to_account_id INTEGER,
    date TEXT NOT NULL DEFAULT (date('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    limit_amount REAL NOT NULL,
    UNIQUE(category_id, month, year),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS credit_card_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    statement_date INTEGER NOT NULL DEFAULT 1,
    due_days_after_statement INTEGER NOT NULL DEFAULT 10,
    min_payment_rate REAL NOT NULL DEFAULT 0.3,
    current_balance REAL NOT NULL DEFAULT 0,
    statement_amount REAL NOT NULL DEFAULT 0,
    last_statement_date TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('personal','mortgage','car','education','other')),
    principal REAL NOT NULL,
    interest_rate REAL NOT NULL DEFAULT 0,
    monthly_payment REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    remaining_balance REAL NOT NULL,
    payment_day INTEGER NOT NULL DEFAULT 1,
    total_installments INTEGER NOT NULL,
    paid_installments INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS liability_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liability_type TEXT NOT NULL CHECK(liability_type IN ('credit_card','loan')),
    liability_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL DEFAULT (date('now')),
    is_minimum INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT ''
  )`,

  `CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    frequency TEXT NOT NULL CHECK(frequency IN ('daily','weekly','monthly','custom')) DEFAULT 'daily',
    days_of_week TEXT NOT NULL DEFAULT '[]',
    time_of_day TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    streak_count INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS routine_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    status TEXT NOT NULL CHECK(status IN ('completed','skipped','missed')),
    note TEXT NOT NULL DEFAULT '',
    completed_at TEXT,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    hourly_rate REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client_id INTEGER,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK(status IN ('active','paused','completed','archived')) DEFAULT 'active',
    deadline TEXT,
    hourly_rate REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    description TEXT NOT NULL DEFAULT '',
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_minutes INTEGER,
    is_running INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS task_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#565f89',
    position INTEGER NOT NULL DEFAULT 0,
    progress TEXT NOT NULL DEFAULT 'none' CHECK(progress IN ('none','quarter','half','three_quarter','full','cancelled'))
  )`,

  `CREATE TABLE IF NOT EXISTS recurring_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'TRY',
    category_id INTEGER,
    account_id INTEGER NOT NULL,
    frequency TEXT NOT NULL CHECK(frequency IN ('daily','weekly','biweekly','monthly','yearly')),
    day_of_month INTEGER,
    day_of_week INTEGER,
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_generated TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status_id INTEGER NOT NULL,
    project_id INTEGER,
    priority TEXT NOT NULL DEFAULT 'none' CHECK(priority IN ('none','low','medium','high','urgent')),
    assignee TEXT NOT NULL DEFAULT '',
    labels TEXT NOT NULL DEFAULT '',
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (status_id) REFERENCES task_statuses(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS pomodoro_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    date TEXT NOT NULL DEFAULT (date('now')),
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    work_minutes INTEGER NOT NULL DEFAULT 25,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )`,
]

const SEED_DATA = [
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'TRY')`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('date_format', 'YYYY-MM-DD')`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('time_format', '24h')`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('water_daily_goal', '2000')`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'tokyo_night')`,

  `INSERT OR IGNORE INTO water_goals (daily_goal_ml) VALUES (2000)`,

  `INSERT OR IGNORE INTO task_statuses (id, name, color, position, progress) VALUES (1, 'Backlog', '#565f89', 0, 'none')`,
  `INSERT OR IGNORE INTO task_statuses (id, name, color, position, progress) VALUES (2, 'Todo', '#7aa2f7', 1, 'none')`,
  `INSERT OR IGNORE INTO task_statuses (id, name, color, position, progress) VALUES (3, 'In Progress', '#f39c12', 2, 'half')`,
  `INSERT OR IGNORE INTO task_statuses (id, name, color, position, progress) VALUES (4, 'Done', '#16c79a', 3, 'full')`,
  `INSERT OR IGNORE INTO task_statuses (id, name, color, position, progress) VALUES (5, 'Cancelled', '#e94560', 4, 'cancelled')`,

  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (1, 'Salary', 'income', '💰', '#16c79a')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (2, 'Freelance', 'income', '💻', '#3498db')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (3, 'Investment', 'income', '📈', '#9b59b6')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (4, 'Other Income', 'income', '💵', '#1abc9c')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (5, 'Food & Dining', 'expense', '🍕', '#e94560')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (6, 'Transportation', 'expense', '🚗', '#f39c12')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (7, 'Shopping', 'expense', '🛒', '#e74c3c')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (8, 'Bills & Utilities', 'expense', '📄', '#2ecc71')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (9, 'Entertainment', 'expense', '🎮', '#9b59b6')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (10, 'Health', 'expense', '🏥', '#1abc9c')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (11, 'Education', 'expense', '📚', '#3498db')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (12, 'Rent', 'expense', '🏠', '#e67e22')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (13, 'Subscriptions', 'expense', '📺', '#8e44ad')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (14, 'Personal Care', 'expense', '💇', '#f1c40f')`,
  `INSERT OR IGNORE INTO categories (id, name, type, icon, color) VALUES (15, 'Other Expense', 'expense', '📦', '#95a5a6')`,
]

export function runMigrations(): void {
  const migrate = db.transaction(() => {
    for (const sql of MIGRATIONS) {
      db.run(sql)
    }
    for (const sql of SEED_DATA) {
      db.run(sql)
    }
  })
  migrate()
}
