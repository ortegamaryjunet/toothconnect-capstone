CREATE TABLE IF NOT EXISTS clinic_system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Preserve any clinic logo previously stored in the website CMS.
INSERT IGNORE INTO clinic_system_settings (setting_key, setting_value)
SELECT 'clinic_logo_path', field_value
FROM website_content
WHERE field_key = 'clinic_logo_path' AND field_value IS NOT NULL AND field_value <> ''
LIMIT 1;
