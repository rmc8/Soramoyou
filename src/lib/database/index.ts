import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export interface BlueskyAccount {
  id?: number;
  handle: string;
  did: string;
  server: string;
  access_jwt: string;
  refresh_jwt: string;
  avatar_url?: string;
  is_current: boolean;
  session_expires_at: string;
  created_at: string;
  updated_at: string;
}

const DATABASE_VERSION = 1;

const createTables = async (database: Database) => {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS database_version (
      version INTEGER PRIMARY KEY
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS bluesky_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handle TEXT NOT NULL,
      did TEXT UNIQUE NOT NULL,
      server TEXT NOT NULL,
      access_jwt TEXT NOT NULL,
      refresh_jwt TEXT NOT NULL,
      avatar_url TEXT,
      is_current BOOLEAN NOT NULL DEFAULT 0,
      session_expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_bluesky_accounts_did ON bluesky_accounts(did)
  `);

  await database.execute(`
    CREATE INDEX IF NOT EXISTS idx_bluesky_accounts_current ON bluesky_accounts(is_current)
  `);
};

const updateDatabaseVersion = async (database: Database, version: number) => {
  await database.execute('DELETE FROM database_version');
  await database.execute('INSERT INTO database_version (version) VALUES (?)', [version]);
};

const getCurrentDatabaseVersion = async (database: Database): Promise<number> => {
  try {
    const result = await database.select<{ version: number }[]>('SELECT version FROM database_version LIMIT 1');
    return result.length > 0 ? result[0].version : 0;
  } catch (error) {
    return 0;
  }
};

const migrateDatabaseIfNeeded = async (database: Database) => {
  const currentVersion = await getCurrentDatabaseVersion(database);
  
  if (currentVersion < DATABASE_VERSION) {
    console.log(`Migrating database from version ${currentVersion} to ${DATABASE_VERSION}`);
    
    // Future migrations can be added here
    // if (currentVersion < 2) {
    //   // Migration logic for version 2
    // }
    
    await updateDatabaseVersion(database, DATABASE_VERSION);
    console.log('Database migration completed');
  }
};

export const initDatabase = async (): Promise<Database> => {
  if (!db) {
    try {
      db = await Database.load('sqlite:soramoyou.db');
      await createTables(db);
      await migrateDatabaseIfNeeded(db);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
};

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const closeDatabase = async () => {
  if (db) {
    await db.close();
    db = null;
  }
};