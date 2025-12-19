// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

// Must set env before importing
vi.stubEnv("SESSION_SECRET", "test-secret-that-is-at-least-32-characters-long!!");

const { createSessionToken, verifySessionToken } = await import(
  "@/lib/auth/session"
);

describe("session utilities", () => {
  it("should create and verify a session token", async () => {
    const token = await createSessionToken("user-123", "testuser");
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const payload = await verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe("user-123");
    expect(payload!.username).toBe("testuser");
  });

  it("should reject an invalid token", async () => {
    const payload = await verifySessionToken("invalid-token");
    expect(payload).toBeNull();
  });

  it("should reject a tampered token", async () => {
    const token = await createSessionToken("user-123", "testuser");
    const tampered = token.slice(0, -5) + "XXXXX";
    const payload = await verifySessionToken(tampered);
    expect(payload).toBeNull();
  });
});
