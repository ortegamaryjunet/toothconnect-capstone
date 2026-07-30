SET @appointments_reminder_2h_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'reminder_sent_2h'
);

SET @appointments_reminder_2h_sql = IF(
  @appointments_reminder_2h_exists = 0,
  'ALTER TABLE appointments ADD COLUMN reminder_sent_2h BOOLEAN DEFAULT FALSE AFTER reminder_sent_24h',
  'SELECT 1'
);
PREPARE appointments_reminder_2h_stmt FROM @appointments_reminder_2h_sql;
EXECUTE appointments_reminder_2h_stmt;
DEALLOCATE PREPARE appointments_reminder_2h_stmt;
