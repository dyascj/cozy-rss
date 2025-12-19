import { getDb, generateId, now } from "./index";
import { hashPassword } from "../auth/password";

/**
 * Seed the database with initial data
 */
export async function seedDatabase(): Promise<void> {
  const db = getDb();

  // Check if admin user already exists
  const existingAdmin = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get("admin");

  if (existingAdmin) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  console.log("Creating admin user...");

  const userId = generateId();
  const timestamp = now();
  const passwordHash = await hashPassword("admin");

  // Create admin user
  db.prepare(
    `
    INSERT INTO users (id, username, password_hash, created_at, updated_at, is_admin)
    VALUES (?, ?, ?, ?, ?, 1)
  `
  ).run(userId, "admin", passwordHash, timestamp, timestamp);

  // Create default settings for admin
  db.prepare(
    `
    INSERT INTO user_settings (user_id)
    VALUES (?)
  `
  ).run(userId);

  console.log("Admin user created successfully!");
  console.log("  Username: admin");
  console.log("  Password: admin");
}

/**
 * Initialize database and seed if needed
 */
export async function initializeDatabase(): Promise<void> {
  // Getting the db will run migrations
  getDb();

  // Seed the database
  await seedDatabase();
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialized.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error initializing database:", error);
      process.exit(1);
    });
}
