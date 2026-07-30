SET @users_profile_photo_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'profile_photo_url'
);

SET @users_profile_photo_sql = IF(
  @users_profile_photo_exists = 0,
  'ALTER TABLE users ADD COLUMN profile_photo_url VARCHAR(500) NULL AFTER status',
  'SELECT 1'
);
PREPARE users_profile_photo_stmt FROM @users_profile_photo_sql;
EXECUTE users_profile_photo_stmt;
DEALLOCATE PREPARE users_profile_photo_stmt;

SET @staff_profile_photo_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'staff_profile'
    AND COLUMN_NAME = 'profile_photo_url'
);

SET @staff_profile_photo_sql = IF(
  @staff_profile_photo_exists = 0,
  'ALTER TABLE staff_profile ADD COLUMN profile_photo_url VARCHAR(500) NULL',
  'SELECT 1'
);
PREPARE staff_profile_photo_stmt FROM @staff_profile_photo_sql;
EXECUTE staff_profile_photo_stmt;
DEALLOCATE PREPARE staff_profile_photo_stmt;

CREATE TABLE IF NOT EXISTS staff_profile_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_profile_id INT NOT NULL,
  uploaded_by INT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NULL,
  file_size INT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_documents_profile
    FOREIGN KEY (staff_profile_id) REFERENCES staff_profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_staff_documents_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_staff_documents_profile_id (staff_profile_id)
);
