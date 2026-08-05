ALTER TABLE users
  ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0 AFTER push_token_updated_at,
  ADD COLUMN login_lockout_until DATETIME NULL AFTER failed_login_attempts,
  ADD COLUMN login_lockout_duration_min INT NOT NULL DEFAULT 15 AFTER login_lockout_until;
