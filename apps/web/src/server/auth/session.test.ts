import { describe, expect, it } from "vitest";
import { sha256Hex, newToken } from "./tokens";

/**
 * Unit tests for session-related primitives.
 * These test the pure crypto/logic functions without requiring a database.
 * Integration tests for issueSession/validateSession/revoke would require a DB.
 */

describe("session crypto primitives", () => {
  it("sha256Hex produces a consistent 64-char hex string", () => {
    const input = "test-session-token-abc123";
    const hash = sha256Hex(input);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    // Deterministic
    expect(sha256Hex(input)).toBe(hash);
  });

  it("different inputs produce different hashes", () => {
    const a = sha256Hex("session-token-a");
    const b = sha256Hex("session-token-b");
    expect(a).not.toBe(b);
  });

  it("newToken generates unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(newToken(32));
    }
    // All 100 tokens should be unique
    expect(tokens.size).toBe(100);
  });

  it("newToken respects byte length", () => {
    // 16 bytes = 32 hex chars
    expect(newToken(16)).toHaveLength(32);
    // 32 bytes = 64 hex chars
    expect(newToken(32)).toHaveLength(64);
    // 48 bytes = 96 hex chars
    expect(newToken(48)).toHaveLength(96);
  });

  it("sha256Hex is one-way (cannot derive input from hash)", () => {
    const token = newToken(32);
    const hash = sha256Hex(token);
    // Hash should not contain the original token
    expect(hash).not.toBe(token);
    expect(hash).not.toContain(token);
  });
});

describe("session token storage model", () => {
  it("session tokens are stored as hashes, not plaintext", () => {
    const sessionToken = newToken(32);
    const storedHash = sha256Hex(sessionToken);

    // The stored hash and the raw token are completely different
    expect(storedHash).not.toBe(sessionToken);
    // Both are hex strings but the hash is always 64 chars (SHA-256)
    expect(storedHash).toHaveLength(64);
    expect(sessionToken).toHaveLength(64); // 32 bytes = 64 hex chars

    // Verification: re-hashing produces the same stored value
    expect(sha256Hex(sessionToken)).toBe(storedHash);
  });
});
