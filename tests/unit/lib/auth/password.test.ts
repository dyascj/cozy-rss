import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password utilities", () => {
  it("should hash a password", async () => {
    const password = "testpassword123";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
  });

  it("should verify a correct password", async () => {
    const password = "testpassword123";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const password = "testpassword123";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword("wrongpassword", hash);
    expect(isValid).toBe(false);
  });

  it("should generate different hashes for the same password", async () => {
    const password = "testpassword123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});
