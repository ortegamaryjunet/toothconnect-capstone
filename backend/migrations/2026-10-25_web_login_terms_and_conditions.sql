CREATE TABLE IF NOT EXISTS web_login_terms_and_conditions (
  id TINYINT UNSIGNED PRIMARY KEY,
  content MEDIUMTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_web_login_terms_singleton CHECK (id = 1)
);

INSERT IGNORE INTO web_login_terms_and_conditions (id, content)
SELECT 1, content FROM termsandcondition WHERE id = 1;
