# Architecture decisions

## Day 1
- One shared backend for web and mobile, not two. Reason: single source of truth for auth, branch scoping, and business rules. Splitting would require maintaining identical logic twice in 5 days.
- Web frontend uses React (with Vite), not React Native. React Native runs only on Android/iOS, not browsers. Components are not interchangeable, so web and mobile are separate codebases that share only the backend API.
- MySQL with `branch_id` on every business table, plus separate `user_branches` (permanent) and `access_grants` (temporary, with expires_at). Reason: clean separation between baseline assignment and on-call coverage; audit-friendly.
- JWT-based auth with role + branches embedded in the token payload. Branch list is computed at login by unioning user_branches with non-expired access_grants.

### OTP issuance invalidates prior codes
register/start, admin-register/start, and forgot-password now mark all prior unconsumed OTPs for the same (email, purpose) as consumed before issuing a new one. Without this, repeat requests during testing left multiple "valid" OTPs in the table and the verify endpoint could end up checking against a different one than the user copied. Same bug class as the earlier pending_registrations issue: stale state from prior attempts confusing the current flow.

### Datetime handling between Node and MySQL
MySQL was running in local Manila time (UTC+8); Node was sending Date objects which mysql2 serialized as UTC. MySQL stored those UTC strings as if they were local time, making every `expires_at` 8 hours in the past on creation. OTPs and refresh tokens appeared expired immediately.

Fix: introduced `toMySQLDateTime(date)` helper that formats local-time strings before sending to the database. All places that wrote DATETIME values (otp_codes.expires_at, pending_registrations.expires_at, refresh_tokens.expires_at) now use this helper. The DB column receives a string matching server-local time, and `NOW()` comparisons work correctly.

### Datetime handling — UTC everywhere
Initial fix wrote local-time strings, which would break in production where Node and MySQL are both UTC. Final fix:
1. Connection-level `SET time_zone = '+00:00'` ensures MySQL treats every connection as UTC regardless of where the server runs.
2. `toMySQLDateTime` uses `toISOString()` to always emit UTC strings.
Result: identical behavior in local dev (Manila) and production (Railway UTC). Display layer converts UTC → user's timezone when rendering.