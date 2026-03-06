import { describe, expect, it } from "vitest";
import { CredentialsSchema, EmailSchema, PasswordSchema } from "./credentials";

describe("credentials validation", () => {
  describe("EmailSchema", () => {
    it("accepts a valid email", () => {
      expect(EmailSchema.safeParse("user@example.com").success).toBe(true);
    });

    it("rejects an invalid email", () => {
      expect(EmailSchema.safeParse("not-an-email").success).toBe(false);
      expect(EmailSchema.safeParse("").success).toBe(false);
    });

    it("rejects emails over 320 chars", () => {
      const longEmail = "a".repeat(310) + "@example.com";
      expect(EmailSchema.safeParse(longEmail).success).toBe(false);
    });
  });

  describe("PasswordSchema", () => {
    it("accepts passwords >= 12 chars", () => {
      expect(PasswordSchema.safeParse("123456789012").success).toBe(true);
      expect(PasswordSchema.safeParse("a very long and secure password").success).toBe(true);
    });

    it("rejects passwords < 12 chars", () => {
      expect(PasswordSchema.safeParse("short").success).toBe(false);
      expect(PasswordSchema.safeParse("12345678901").success).toBe(false); // 11 chars
    });

    it("rejects passwords over 256 chars", () => {
      expect(PasswordSchema.safeParse("a".repeat(257)).success).toBe(false);
    });
  });

  describe("CredentialsSchema", () => {
    it("accepts valid credentials", () => {
      const result = CredentialsSchema.safeParse({
        email: "user@example.com",
        password: "a-secure-password"
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing fields", () => {
      expect(CredentialsSchema.safeParse({}).success).toBe(false);
      expect(CredentialsSchema.safeParse({ email: "user@example.com" }).success).toBe(false);
      expect(CredentialsSchema.safeParse({ password: "a-secure-password" }).success).toBe(false);
    });
  });
});
