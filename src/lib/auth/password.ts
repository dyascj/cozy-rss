import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Returns null if valid, or an error message if invalid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  return null;
}

/**
 * Validate username format
 * Returns null if valid, or an error message if invalid
 */
export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }

  if (username.length > 50) {
    return "Username must be less than 50 characters";
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }

  return null;
}
