ALTER TABLE users
  ADD COLUMN deactivated_at DATE NULL AFTER created_at;
