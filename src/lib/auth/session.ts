import { getDb, generateId, now, SessionRow, UserRow } from "../db";

// Session duration: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  isAdmin: boolean;
  createdAt: number;
}

/**
 * Create a new session for a user
 */
export function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Session {
  const db = getDb();
  const sessionId = generateId();
  const createdAt = now();
  const expiresAt = createdAt + SESSION_DURATION_MS;

  db.prepare(
    `
    INSERT INTO sessions (id, user_id, created_at, expires_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(sessionId, userId, createdAt, expiresAt, ipAddress || null, userAgent || null);

  // Update last login
  db.prepare(
    `
    UPDATE users SET last_login_at = ? WHERE id = ?
  `
  ).run(createdAt, userId);

  return {
    id: sessionId,
    userId,
    createdAt,
    expiresAt,
  };
}

/**
 * Validate a session token and return the session if valid
 */
export function validateSession(sessionId: string): Session | null {
  const db = getDb();
  const session = db
    .prepare(
      `
    SELECT id, user_id, created_at, expires_at
    FROM sessions
    WHERE id = ? AND expires_at > ?
  `
    )
    .get(sessionId, now()) as SessionRow | undefined;

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    userId: session.user_id,
    createdAt: session.created_at,
    expiresAt: session.expires_at,
  };
}

/**
 * Get user by session ID
 */
export function getUserBySession(sessionId: string): User | null {
  const db = getDb();
  const user = db
    .prepare(
      `
    SELECT u.id, u.username, u.email, u.is_admin, u.created_at
    FROM users u
    JOIN sessions s ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `
    )
    .get(sessionId, now()) as UserRow | undefined;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.is_admin === 1,
    createdAt: user.created_at,
  };
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | null {
  const db = getDb();
  const user = db
    .prepare(
      `
    SELECT id, username, email, is_admin, created_at
    FROM users
    WHERE id = ?
  `
    )
    .get(userId) as UserRow | undefined;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.is_admin === 1,
    createdAt: user.created_at,
  };
}

/**
 * Get user by username
 */
export function getUserByUsername(username: string): (User & { passwordHash: string }) | null {
  const db = getDb();
  const user = db
    .prepare(
      `
    SELECT id, username, email, password_hash, is_admin, created_at
    FROM users
    WHERE username = ?
  `
    )
    .get(username) as UserRow | undefined;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.password_hash,
    isAdmin: user.is_admin === 1,
    createdAt: user.created_at,
  };
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

/**
 * Delete all sessions for a user
 */
export function deleteUserSessions(userId: string): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

/**
 * Extend session expiry
 */
export function refreshSession(sessionId: string): Session | null {
  const db = getDb();
  const newExpiresAt = now() + SESSION_DURATION_MS;

  const result = db
    .prepare(
      `
    UPDATE sessions
    SET expires_at = ?
    WHERE id = ? AND expires_at > ?
  `
    )
    .run(newExpiresAt, sessionId, now());

  if (result.changes === 0) {
    return null;
  }

  return validateSession(sessionId);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): number {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM sessions WHERE expires_at < ?")
    .run(now());

  return result.changes;
}

/**
 * Create a new user
 */
export function createUser(
  username: string,
  passwordHash: string,
  email?: string
): User {
  const db = getDb();
  const userId = generateId();
  const timestamp = now();

  db.prepare(
    `
    INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(userId, username, email || null, passwordHash, timestamp, timestamp);

  // Create default settings for the user
  db.prepare(
    `
    INSERT INTO user_settings (user_id)
    VALUES (?)
  `
  ).run(userId);

  return {
    id: userId,
    username,
    email: email || null,
    isAdmin: false,
    createdAt: timestamp,
  };
}

/**
 * Check if username exists
 */
export function usernameExists(username: string): boolean {
  const db = getDb();
  const result = db
    .prepare("SELECT 1 FROM users WHERE username = ?")
    .get(username);

  return !!result;
}

/**
 * Delete a user and all their data
 */
export function deleteUser(userId: string): void {
  const db = getDb();

  // Foreign key cascades will handle most cleanup
  // but we delete explicitly in a transaction to be safe
  const deleteUserData = db.transaction(() => {
    // Delete sessions
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);

    // Delete article_tags (via article_states)
    db.prepare(
      `
      DELETE FROM article_tags
      WHERE article_state_id IN (
        SELECT id FROM article_states WHERE user_id = ?
      )
    `
    ).run(userId);

    // Delete article_states
    db.prepare("DELETE FROM article_states WHERE user_id = ?").run(userId);

    // Delete tags
    db.prepare("DELETE FROM tags WHERE user_id = ?").run(userId);

    // Delete articles (orphaned articles from user's feeds)
    db.prepare(
      `
      DELETE FROM articles
      WHERE feed_id IN (
        SELECT id FROM feeds WHERE user_id = ?
      )
    `
    ).run(userId);

    // Delete feeds
    db.prepare("DELETE FROM feeds WHERE user_id = ?").run(userId);

    // Delete folders
    db.prepare("DELETE FROM folders WHERE user_id = ?").run(userId);

    // Delete settings
    db.prepare("DELETE FROM user_settings WHERE user_id = ?").run(userId);

    // Delete OPML imports
    db.prepare("DELETE FROM opml_imports WHERE user_id = ?").run(userId);

    // Finally delete the user
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  });

  deleteUserData();
}
