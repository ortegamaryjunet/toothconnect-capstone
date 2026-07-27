CREATE TABLE IF NOT EXISTS appointment_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointment_settings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO appointment_settings (setting_key, setting_value)
VALUES (
  'cancellation_policy_message',
  'Please contact the clinic as soon as possible if you need to cancel or reschedule your appointment.'
);
