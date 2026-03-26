import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'users.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function createFallbackDb(error) {
  const statement = {
    get() {
      return undefined;
    },
    all() {
      return [];
    },
    run() {
      return { changes: 0, lastInsertRowid: 0 };
    },
    iterate() {
      return [][Symbol.iterator]();
    },
    pluck() {
      return this;
    },
    raw() {
      return this;
    },
    bind() {
      return this;
    },
    expand() {
      return this;
    }
  };

  return {
    isAvailable: false,
    error,
    pragma() {},
    exec() {},
    prepare() {
      return statement;
    },
    close() {}
  };
}

function initializeDatabase(db) {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT,
      bio TEXT,
      avatar_url TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  try {
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    const columnNames = tableInfo.map((col) => col.name);
    const hasExistingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count > 0;

    if (!columnNames.includes('email_verified')) {
      db.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0');
      if (hasExistingUsers) db.exec('UPDATE users SET email_verified = 1');
    }
    if (!columnNames.includes('verification_token')) {
      db.exec('ALTER TABLE users ADD COLUMN verification_token TEXT');
    }
    if (!columnNames.includes('is_admin')) {
      db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0');
    }
    if (!columnNames.includes('school')) {
      db.exec('ALTER TABLE users ADD COLUMN school TEXT');
    }
    if (!columnNames.includes('age')) {
      db.exec('ALTER TABLE users ADD COLUMN age INTEGER');
    }
    if (!columnNames.includes('ip')) {
      db.exec('ALTER TABLE users ADD COLUMN ip TEXT');
    }
    if (!columnNames.includes('banned')) {
      db.exec('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS changelog (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      localstorage_data TEXT,
      theme TEXT DEFAULT 'dark',
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(type, target_id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
  `);
}

let db;

try {
  const { default: Database } = await import('better-sqlite3');
  db = new Database(dbPath);
  initializeDatabase(db);
  db.isAvailable = true;
  db.error = null;
} catch (error) {
  console.warn('[db] better-sqlite3 unavailable; starting without persistent storage:', error.message);
  db = createFallbackDb(error);
}

export default db;