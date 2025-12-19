import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { mkdirSync } from "fs";
import { dirname, join } from "path";

let _db: BetterSQLite3Database<typeof schema> | null = null;
let _migrated = false;

function getDatabase(): BetterSQLite3Database<typeof schema> {
  if (!_db) {
    const DATABASE_PATH = process.env.DATABASE_PATH || "./data/cozyrss.db";
    mkdirSync(dirname(DATABASE_PATH), { recursive: true });

    const sqlite = new Database(DATABASE_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("busy_timeout = 5000");
    sqlite.pragma("foreign_keys = ON");

    _db = drizzle(sqlite, { schema });

    // Auto-run migrations on first connection
    if (!_migrated) {
      try {
        migrate(_db, { migrationsFolder: join(process.cwd(), "drizzle") });
      } catch (e: unknown) {
        const msg = e instanceof Error ? (e.cause as Error | undefined)?.message ?? e.message : String(e);
        if (!msg.includes("already exists")) {
          console.error("Migration error:", e);
        }
      }
      _migrated = true;
    }
  }
  return _db;
}

// Export a proxy that lazily initializes the database on first use
export const db: BetterSQLite3Database<typeof schema> = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    const database = getDatabase();
    const value = (database as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});

export { schema };
