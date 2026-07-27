ALTER TABLE payments
  ADD COLUMN amount_received DECIMAL(10,2) NULL AFTER amount,
  ADD COLUMN payment_source ENUM('patient_upload','staff_recorded') NOT NULL DEFAULT 'patient_upload' AFTER payment_method,
  ADD COLUMN proof_image_url VARCHAR(500) NULL AFTER receipt_uploaded_at,
  ADD COLUMN proof_image_public_id VARCHAR(255) NULL AFTER proof_image_url,
  ADD COLUMN proof_image_file_name VARCHAR(255) NULL AFTER proof_image_public_id,
  ADD COLUMN proof_image_mime_type VARCHAR(100) NULL AFTER proof_image_file_name,
  ADD COLUMN recorded_by INT NULL AFTER verified_at,
  ADD COLUMN recorded_at DATETIME NULL AFTER recorded_by,
  ADD CONSTRAINT fk_payments_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id);

UPDATE payments
SET amount_received = amount
WHERE amount_received IS NULL;
