ALTER TABLE services
  ADD COLUMN time_buffer_min INT NOT NULL DEFAULT 30 AFTER duration_min;

UPDATE services
SET time_buffer_min = 30
WHERE time_buffer_min IS NULL OR time_buffer_min < 0;
