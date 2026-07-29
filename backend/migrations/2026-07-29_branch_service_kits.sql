SET @service_kits_branch_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'service_kits'
    AND COLUMN_NAME = 'branch_id'
);

SET @service_kits_branch_column_sql = IF(
  @service_kits_branch_column_exists = 0,
  'ALTER TABLE service_kits ADD COLUMN branch_id INT NULL AFTER service_id',
  'SELECT 1'
);
PREPARE service_kits_branch_column_stmt FROM @service_kits_branch_column_sql;
EXECUTE service_kits_branch_column_stmt;
DEALLOCATE PREPARE service_kits_branch_column_stmt;

SET @service_kits_branch_fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'service_kits'
    AND COLUMN_NAME = 'branch_id'
    AND REFERENCED_TABLE_NAME = 'branches'
);

SET @service_kits_branch_fk_sql = IF(
  @service_kits_branch_fk_exists = 0,
  'ALTER TABLE service_kits ADD CONSTRAINT fk_service_kits_branch FOREIGN KEY (branch_id) REFERENCES branches(id)',
  'SELECT 1'
);
PREPARE service_kits_branch_fk_stmt FROM @service_kits_branch_fk_sql;
EXECUTE service_kits_branch_fk_stmt;
DEALLOCATE PREPARE service_kits_branch_fk_stmt;

SET @service_kits_old_unique_index = (
  SELECT INDEX_NAME
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'service_kits'
    AND NON_UNIQUE = 0
  GROUP BY INDEX_NAME
  HAVING COUNT(*) = 1
    AND SUM(CASE WHEN COLUMN_NAME = 'service_id' THEN 1 ELSE 0 END) = 1
  LIMIT 1
);

SET @service_kits_old_unique_sql = IF(
  @service_kits_old_unique_index IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE service_kits DROP INDEX `', REPLACE(@service_kits_old_unique_index, '`', '``'), '`')
);
PREPARE service_kits_old_unique_stmt FROM @service_kits_old_unique_sql;
EXECUTE service_kits_old_unique_stmt;
DEALLOCATE PREPARE service_kits_old_unique_stmt;

SET @service_kits_branch_unique_exists = (
  SELECT COUNT(DISTINCT INDEX_NAME)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'service_kits'
    AND INDEX_NAME = 'uniq_service_kit_branch'
);

SET @service_kits_branch_unique_sql = IF(
  @service_kits_branch_unique_exists = 0,
  'ALTER TABLE service_kits ADD UNIQUE KEY uniq_service_kit_branch (service_id, branch_id)',
  'SELECT 1'
);
PREPARE service_kits_branch_unique_stmt FROM @service_kits_branch_unique_sql;
EXECUTE service_kits_branch_unique_stmt;
DEALLOCATE PREPARE service_kits_branch_unique_stmt;
