# Phase 2 User Story Report: Auth Endpoints

Session: backend-foundation
Phase: 2
Date: 2026-03-08
Server: localhost:3000 (Next.js dev)
Database: postgresql://postgres:2322@localhost:5432/idea_management

---

## US-1: Signup creates user and returns session

**Test:** POST /api/auth/signup with `{"email":"test@example.com","password":"TestPassword123!"}`

**Result:** PASS
- HTTP 201
- Response: `{"ok":true,"user":{"id":"...","email":"test@example.com","role":"USER","createdAt":"..."},"_dev":{"verificationToken":"..."}}`
- Cookies set: `im_session` and `im_refresh` (HttpOnly, SameSite=lax)
- Email verification token issued and returned in `_dev` field

---

## US-2: Signup rejects duplicate emails

**Test:** POST /api/auth/signup with same email as US-1

**Result:** PASS
- HTTP 409
- Response: `{"ok":false,"error":"email_in_use"}`

---

## US-3: Signup rejects short passwords

**Test:** POST /api/auth/signup with `{"email":"short@example.com","password":"short"}`

**Result:** PASS
- HTTP 400
- Response: `{"ok":false,"error":"invalid_request"}`
- Zod PasswordSchema enforces min(12)

**Additional edge cases tested:**
- Missing password field: 400 `invalid_request` - PASS
- Invalid email format: 400 `invalid_request` - PASS

---

## US-4: Signin with correct credentials returns session cookie

**Test:** POST /api/auth/signin with `{"email":"test@example.com","password":"TestPassword123!"}`

**Result:** PASS
- HTTP 200
- Response: `{"ok":true,"user":{"id":"...","email":"test@example.com","role":"USER"}}`
- Cookies set: `im_session` and `im_refresh`

**Admin signin also tested:**
- POST /api/auth/signin with `{"email":"admin@ideamgmt.local","password":"AdminPass123!"}`
- HTTP 200, role: "ADMIN" - PASS

---

## US-5: Signin with wrong credentials returns 401

**Tests:**
1. Wrong password: `{"email":"test@example.com","password":"WrongPassword123!"}` -> 401 `invalid_credentials` - PASS
2. Non-existent account: `{"email":"nobody@example.com","password":"TestPassword123!"}` -> 401 `invalid_credentials` - PASS
3. Missing fields: `{"email":"test@example.com"}` -> 400 `invalid_request` - PASS

**Note:** Same error message for wrong password and non-existent account (prevents user enumeration).

---

## US-6: Signout revokes session

**Single-device signout:**
1. Signin to get session cookies
2. POST /api/auth/signout with `{}` -> 200 `{"ok":true}` - PASS
3. GET /api/auth/me with revoked cookies -> 401 `unauthorized` - PASS

**All-devices signout:**
1. Created two sessions (device 1 and device 2) for same user
2. Both sessions validated with GET /me -> 200 - PASS
3. POST /api/auth/signout with `{"allDevices":true}` from device 1 -> 200 - PASS
4. GET /me from device 1 -> 401 (session revoked) - PASS
5. GET /me from device 2 -> 401 (session also revoked) - PASS

---

## US-7: Refresh token rotation works

**Test flow:**
1. Signin to get session + refresh cookies
2. POST /api/auth/refresh -> 200 `{"ok":true}` - PASS
3. New `im_session` and `im_refresh` cookies set (different values from original) - PASS
4. GET /me with new cookies -> 200 with correct user data - PASS
5. POST /api/auth/refresh with OLD refresh token -> 401 `invalid_refresh` - PASS (old token revoked)
6. POST /api/auth/refresh without cookie -> 401 `missing_refresh` - PASS

---

## US-8: GET /me returns authenticated user

**Tests:**
1. With valid user session: 200, returns `{ok, user: {id, email, role, emailVerified}, entitlements: {plan, features, isAdmin}}` - PASS
2. With admin session: 200, role "ADMIN", isAdmin true, all features present - PASS
3. Without session cookie: 401 `unauthorized` - PASS
4. After signout: 401 `unauthorized` - PASS

---

## US-9: Password reset flow works end-to-end

**Request reset:**
1. POST /api/auth/password-reset with existing email -> 200, `_dev.resetToken` returned - PASS
2. POST /api/auth/password-reset with non-existent email -> 200 (no enumeration) - PASS
3. POST /api/auth/password-reset with invalid email -> 400 `invalid_request` - PASS

**Confirm reset:**
1. POST /api/auth/password-reset/confirm with valid token + new password -> 200 - PASS
2. Same token reused -> 400 `invalid_or_expired_token` - PASS
3. Invalid token -> 400 `invalid_or_expired_token` - PASS
4. Short new password -> 400 `invalid_request` - PASS
5. All existing sessions revoked after password reset -> PASS
6. Signin with new password -> 200 - PASS
7. Signin with old password -> 401 `invalid_credentials` - PASS

---

## US-10: Email verification flow works

**Tests:**
1. Verification token returned during signup in `_dev.verificationToken` - PASS
2. POST /api/auth/verify-email with valid token -> 200 - PASS
3. GET /me shows `emailVerified: true` after verification - PASS
4. Same token reused -> 400 `invalid_or_expired_token` (marked as used) - PASS
5. Invalid token -> 400 `invalid_or_expired_token` - PASS
6. Missing token -> 400 `invalid_request` - PASS

---

## US-11: Admin bootstrap procedure

**Test:**
1. Admin seeded in Phase 1 (admin@ideamgmt.local / AdminPass123!)
2. Signin with admin credentials -> 200, role "ADMIN" - PASS
3. GET /me returns admin with all entitlements (pro_access, team_access, whiteboard, schema_planner, ai_chat) - PASS
4. emailVerified: true for admin - PASS

---

## Summary

| # | User Story | Result |
|---|-----------|--------|
| US-1 | Signup creates user and returns session | PASS |
| US-2 | Signup rejects duplicate emails | PASS |
| US-3 | Signup rejects short passwords | PASS |
| US-4 | Signin with correct credentials returns session cookie | PASS |
| US-5 | Signin with wrong credentials returns 401 | PASS |
| US-6 | Signout revokes session (single + all devices) | PASS |
| US-7 | Refresh token rotation works | PASS |
| US-8 | GET /me returns authenticated user | PASS |
| US-9 | Password reset flow works end-to-end | PASS |
| US-10 | Email verification flow works | PASS |
| US-11 | Admin bootstrap procedure | PASS |

**Total: 11/11 PASS | 0 FAIL | 0 bugs found**

No code fixes were needed. All auth endpoints function correctly as implemented.
