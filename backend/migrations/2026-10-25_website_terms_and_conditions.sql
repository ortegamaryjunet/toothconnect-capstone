CREATE TABLE IF NOT EXISTS website_terms_and_conditions (
  id TINYINT UNSIGNED PRIMARY KEY,
  content MEDIUMTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_website_terms_singleton CHECK (id = 1)
);

INSERT IGNORE INTO website_terms_and_conditions (id, content)
SELECT 1, content FROM termsandcondition WHERE id = 1;
