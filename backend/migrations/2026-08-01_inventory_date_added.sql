ALTER TABLE supplies
  ADD COLUMN date_added DATE NULL AFTER low_stock_threshold;

UPDATE supplies
SET date_added = DATE(created_at)
WHERE date_added IS NULL;

ALTER TABLE medicines
  ADD COLUMN date_added DATE NULL AFTER low_stock_threshold;

UPDATE medicines
SET date_added = DATE(created_at)
WHERE date_added IS NULL;

ALTER TABLE equipment
  ADD COLUMN date_added DATE NULL AFTER low_stock_threshold;

UPDATE equipment
SET date_added = DATE(created_at)
WHERE date_added IS NULL;
