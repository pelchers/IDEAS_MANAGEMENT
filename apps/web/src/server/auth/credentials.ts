import { z } from "zod";

export const EmailSchema = z.string().email().max(320);
export const PasswordSchema = z.string().min(12).max(256);

export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema
});

export type Credentials = z.infer<typeof CredentialsSchema>;

/**
 * Sign-in accepts any non-empty password. Password *strength* is enforced only
 * at signup (CredentialsSchema); the login endpoint just needs to validate the
 * shape and verify the hash, and must not reject shorter/legacy passwords.
 */
export const SigninPasswordSchema = z.string().min(1).max(256);
export const SigninCredentialsSchema = z.object({
  email: EmailSchema,
  password: SigninPasswordSchema
});

