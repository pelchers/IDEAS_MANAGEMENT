import { z } from "zod";

export const EmailSchema = z.string().email().max(320);
export const PasswordSchema = z.string().min(12).max(256);

export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema
});

export type Credentials = z.infer<typeof CredentialsSchema>;

