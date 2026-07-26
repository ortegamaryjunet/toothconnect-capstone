SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS appointment_consumption;
DROP TABLE IF EXISTS inventory_usage_history;
DROP TABLE IF EXISTS schedule_requests;
DROP TABLE IF EXISTS service_kit_items;
DROP TABLE IF EXISTS service_kits;
DROP TABLE IF EXISTS clinic_expenses;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS patient_feedback;
DROP TABLE IF EXISTS treatments;
DROP TABLE IF EXISTS treatment_plans;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS dentist_schedules;
DROP TABLE IF EXISTS dentist_services;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS supplies;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS access_grants;
DROP TABLE IF EXISTS user_branches;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS pending_registrations;
DROP TABLE IF EXISTS patient_profile;
DROP TABLE IF EXISTS staff_previous_work;
DROP TABLE IF EXISTS staff_profile;
DROP TABLE IF EXISTS user_presence;
DROP TABLE IF EXISTS online_appointments_tbl;
DROP TABLE IF EXISTS inquiry_replies;
DROP TABLE IF EXISTS online_inquiries_tbl;
DROP TABLE IF EXISTS website_content;
DROP TABLE IF EXISTS website_faqs;
DROP TABLE IF EXISTS website_services;
DROP TABLE IF EXISTS website_announcements;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS branches;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  contact_person VARCHAR(100) NULL,
  date_opened DATE NULL,
  operating_hours VARCHAR(120) NULL,
  years_active VARCHAR(30) NULL,
  status ENUM('Active','Inactive','Renovation','Opening','Closed') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('admin','dentist','receptionist','patient') NOT NULL,
  home_branch_id INT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  email_verified BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT FALSE,
  push_token VARCHAR(255) NULL,
  push_token_updated_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deactivated_at DATE NULL,
  recall_reminder_sent_at TIMESTAMP NULL,
  FOREIGN KEY (home_branch_id) REFERENCES branches(id)
);

CREATE TABLE user_presence (
  user_id INT PRIMARY KEY,
  last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE patient_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  contact_number VARCHAR(30) NOT NULL,
  address VARCHAR(255) NOT NULL,
  birthday DATE NULL,
  age INT NULL,
  nationality VARCHAR(100) NULL,
  occupation VARCHAR(100) NULL,
  sex ENUM('Male', 'Female', 'Other') NULL,
  civil_status VARCHAR(50) NULL,
  emergency_contact_name VARCHAR(100) NULL,
  emergency_contact_number VARCHAR(30) NULL,
  medical_conditions TEXT NULL,
  allergies TEXT NULL,
  medications TEXT NULL,
  dental_history TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_patient_profile_user_id (user_id),
  INDEX idx_patient_profile_email (email)
);

CREATE TABLE staff_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  branch_id INT NULL,
  staff_type ENUM('Dentist','Dental Assistant','Receptionist','Admin') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  nickname VARCHAR(100) NULL,
  suffix VARCHAR(20) NULL,
  birthday DATE NULL,
  age INT NULL,
  gender ENUM('Female', 'Male') NULL,
  civil_status VARCHAR(50) NULL,
  religion VARCHAR(100) NULL,
  nationality VARCHAR(100) NULL,
  home_address VARCHAR(255) NULL,
  contact_number VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  position VARCHAR(100) NULL,
  specialization VARCHAR(150) NULL,
  work_department VARCHAR(150) NULL,
  medical_degree VARCHAR(150) NULL,
  license_number VARCHAR(100) NULL,
  years_experience INT DEFAULT 0,
  skills TEXT NULL,
  start_date DATE NULL,
  employment_type ENUM('Full-Time','Part-Time','Contract','Intern') NULL,
  shift_type VARCHAR(100) NULL,
  work_days VARCHAR(255) NULL,
  work_start_time TIME NULL,
  work_end_time TIME NULL,
  assigned_dentist_profile_id INT NULL,
  status ENUM('Active','Inactive','Archived') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_profile_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_staff_profile_branch
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_staff_profile_assigned_dentist
    FOREIGN KEY (assigned_dentist_profile_id) REFERENCES staff_profile(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_staff_profile_user_id (user_id),
  INDEX idx_staff_profile_branch_id (branch_id),
  INDEX idx_staff_profile_staff_type (staff_type),
  INDEX idx_staff_profile_status (status),
  INDEX idx_staff_profile_assigned_dentist (assigned_dentist_profile_id)
);

CREATE TABLE staff_previous_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_profile_id INT NOT NULL,
  company_name VARCHAR(150) NULL,
  company_address VARCHAR(255) NULL,
  position VARCHAR(100) NULL,
  specialization VARCHAR(150) NULL,
  start_month DATE NULL,
  end_month DATE NULL,
  responsibilities TEXT NULL,
  reason_for_leaving TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_previous_work_profile
    FOREIGN KEY (staff_profile_id) REFERENCES staff_profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_staff_previous_work_profile_id (staff_profile_id)
);

CREATE TABLE user_branches (
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, branch_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE access_grants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  granted_by INT NOT NULL,
  expires_at DATETIME NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (granted_by) REFERENCES users(id)
);

CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  purpose ENUM('register','reset_password') NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_purpose (email, purpose)
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General Dentistry',
  duration_min INT NOT NULL,
  time_buffer_min INT NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('Active','Inactive','Discontinued') NOT NULL DEFAULT 'Active',
  description TEXT NULL
);

CREATE TABLE dentist_services (
  dentist_id INT NOT NULL,
  service_id INT NOT NULL,
  PRIMARY KEY (dentist_id, service_id),
  FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE dentist_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dentist_id INT NOT NULL,
  branch_id INT NOT NULL,
  weekday TINYINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (dentist_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  patient_id INT NOT NULL,
  dentist_id INT NOT NULL,
  service_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  duration_min INT NOT NULL,
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  status ENUM('scheduled','arrived','completed','cancelled','no_show') DEFAULT 'scheduled',
  dentist_note TEXT NULL,
  cancellation_reason TEXT NULL,
  cancelled_by VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (dentist_id) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE treatments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  dentist_id INT NOT NULL,
  tooth_number TINYINT,
  condition_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (dentist_id) REFERENCES users(id)
);

CREATE TABLE treatment_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  dentist_id INT NOT NULL,
  tooth_number TINYINT NULL,
  planned_treatment VARCHAR(255) NOT NULL,
  status ENUM('planned','in_progress','completed') NOT NULL DEFAULT 'planned',
  notes TEXT NULL,
  date_completed DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (dentist_id) REFERENCES users(id),
  INDEX idx_treatment_plans_patient (patient_id),
  INDEX idx_treatment_plans_dentist (dentist_id),
  INDEX idx_treatment_plans_tooth (patient_id, tooth_number),
  INDEX idx_treatment_plans_status (status)
);

CREATE TABLE patient_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL UNIQUE,
  branch_id INT NOT NULL,
  patient_id INT NOT NULL,
  dentist_id INT NOT NULL,
  rating TINYINT NOT NULL,
  feedback TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (dentist_id) REFERENCES users(id),
  CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_patient_feedback_branch_date (branch_id, submitted_at),
  INDEX idx_patient_feedback_dentist (dentist_id),
  INDEX idx_patient_feedback_patient (patient_id),
  INDEX idx_patient_feedback_rating (rating)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  branch_id INT NOT NULL,
  patient_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','ewallet','bank_transfer','card') NOT NULL DEFAULT 'ewallet',
  ewallet_provider VARCHAR(50) NULL,
  reference_number VARCHAR(100) NULL,
  receipt_url VARCHAR(500) NULL,
  receipt_public_id VARCHAR(255) NULL,
  receipt_file_name VARCHAR(255) NULL,
  receipt_mime_type VARCHAR(100) NULL,
  receipt_uploaded_at TIMESTAMP NULL DEFAULT NULL,
  paid_at DATETIME NULL,
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  verified_by INT NULL,
  verified_at DATETIME NULL,
  rejection_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_payments_appointment (appointment_id),
  INDEX idx_payments_branch_status (branch_id, status),
  INDEX idx_payments_patient (patient_id),
  INDEX idx_payments_paid_at (paid_at)
);

CREATE TABLE clinic_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  recorded_by INT NULL,
  receipt_url VARCHAR(500) NULL,
  receipt_public_id VARCHAR(255) NULL,
  status ENUM('recorded','voided') NOT NULL DEFAULT 'recorded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  INDEX idx_clinic_expenses_branch_date (branch_id, expense_date),
  INDEX idx_clinic_expenses_status (status)
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NULL,
  body TEXT NOT NULL,
  related_type VARCHAR(50) NULL,
  related_id INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE supplies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  supply_name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NULL,
  supplier VARCHAR(255) NULL,
  category VARCHAR(100) NULL,
  unit VARCHAR(50) NOT NULL,

  quantity INT NOT NULL DEFAULT 0,
  maximum_stock INT NOT NULL DEFAULT 0,
  stock_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN maximum_stock > 0 THEN LEAST(100.00, GREATEST(0.00, ROUND((quantity / maximum_stock) * 100, 2)))
      ELSE 0
    END
  ) STORED,

  price_per_item DECIMAL(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (branch_id) REFERENCES branches(id),

  INDEX idx_supplies_branch (branch_id),
  INDEX idx_supplies_low (branch_id, quantity, low_stock_threshold)
);

CREATE TABLE medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,

  medicine_name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NULL,
  category VARCHAR(100) NULL,
  form VARCHAR(50) NULL,
  dosage VARCHAR(100) NULL,
  brand VARCHAR(255) NULL,
  supplier VARCHAR(255) NULL,
  unit VARCHAR(50) NOT NULL,

  quantity INT NOT NULL DEFAULT 0,
  maximum_stock INT NOT NULL DEFAULT 0,
  stock_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN maximum_stock > 0 THEN LEAST(100.00, GREATEST(0.00, ROUND((quantity / maximum_stock) * 100, 2)))
      ELSE 0
    END
  ) STORED,

  price_per_item DECIMAL(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (branch_id) REFERENCES branches(id),

  INDEX idx_medicines_branch (branch_id),
  INDEX idx_medicines_low (branch_id, quantity, low_stock_threshold)
);

CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,

  equipment_name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NULL,
  supplier VARCHAR(255) NULL,
  category VARCHAR(100) NULL,
  model_number VARCHAR(100) NULL,
  serial_number VARCHAR(100) NULL,
  location VARCHAR(100) NULL,

  purchase_date DATE NULL,
  warranty_date DATE NULL,
  last_maintenance DATE NULL,
  next_maintenance DATE NULL,

  maintenance_status VARCHAR(50) DEFAULT 'Available',
  assigned_to INT NULL,

  quantity INT NOT NULL DEFAULT 1,
  maximum_stock INT NOT NULL DEFAULT 0,
  stock_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN maximum_stock > 0 THEN LEAST(100.00, GREATEST(0.00, ROUND((quantity / maximum_stock) * 100, 2)))
      ELSE 0
    END
  ) STORED,

  price_per_item DECIMAL(10,2) NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 1,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),

  INDEX idx_equipment_branch (branch_id)
);

CREATE TABLE service_kits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL UNIQUE,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE service_kit_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_kit_id INT NOT NULL,
  category ENUM('supply', 'medicine', 'equipment') NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  default_quantity INT NOT NULL,
  FOREIGN KEY (service_kit_id) REFERENCES service_kits(id) ON DELETE CASCADE,
  INDEX idx_kit_items_kit (service_kit_id)
);

CREATE TABLE appointment_consumption (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  category ENUM('supply', 'medicine', 'equipment') NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity_used INT NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recorded_by INT NOT NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (recorded_by) REFERENCES users(id),
  INDEX idx_consumption_appt (appointment_id),
  INDEX idx_consumption_item (category, item_id)
);

CREATE TABLE inventory_usage_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  branch_id INT NOT NULL,
  inventory_type ENUM('medicine','equipment','supply') NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_category VARCHAR(255) NULL,
  quantity_deducted INT NOT NULL,
  service_id INT NULL,
  service_name VARCHAR(255) NULL,
  appointment_start_time DATETIME NULL,
  deducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deducted_by INT NOT NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (deducted_by) REFERENCES users(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  INDEX idx_usage_branch_date (branch_id, deducted_at),
  INDEX idx_usage_appt (appointment_id),
  INDEX idx_usage_item (inventory_type, item_id)
);

CREATE TABLE schedule_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dentist_id INT NOT NULL,
  request_type ENUM('leave', 'transfer') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  date_from DATE NULL,
  date_to DATE NULL,
  reason TEXT NULL,
  requested_branch_id INT NULL,
  transfer_type ENUM('permanent', 'temporary') NULL,
  duration VARCHAR(100) NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT NULL,
  FOREIGN KEY (dentist_id) REFERENCES users(id),
  FOREIGN KEY (requested_branch_id) REFERENCES branches(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_schedule_requests_dentist (dentist_id),
  INDEX idx_schedule_requests_status (status)
);

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  device_browser VARCHAR(120) NULL,
  log_status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  branch_id INT,
  via_grant BOOLEAN DEFAULT FALSE,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  platform ENUM('web','mobile') NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  last_used_at DATETIME NULL,
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_platform (user_id, platform)
);

CREATE TABLE pending_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  intended_role ENUM('patient','admin') NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  branch_id INT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  INDEX idx_email_role (email, intended_role)
);

CREATE TABLE online_appointments_tbl (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  phone_number VARCHAR(30) NOT NULL,
  location VARCHAR(255) NOT NULL,
  reason_for_booking TEXT NULL,
  assigned_dentist_id INT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_online_appt_date (appointment_date),
  INDEX idx_online_appt_status (status),
  FOREIGN KEY (assigned_dentist_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE online_inquiries_tbl (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email_address VARCHAR(150) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  branch VARCHAR(150) NOT NULL DEFAULT '',
  concern VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_online_inquiry_phone (phone_number),
  INDEX idx_online_inquiry_branch (branch)
);

CREATE TABLE inquiry_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT NOT NULL,
  replied_by INT NOT NULL,
  reply_message TEXT NOT NULL,
  sent_to_email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES online_inquiries_tbl(id) ON DELETE CASCADE,
  FOREIGN KEY (replied_by) REFERENCES users(id),
  INDEX idx_inquiry_replies_inquiry_id (inquiry_id)
);

CREATE TABLE website_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_value TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wc_section_key (section, field_key)
);

CREATE TABLE website_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('active','hidden') NOT NULL DEFAULT 'active',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE website_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  image_path VARCHAR(255) NULL,
  description TEXT NULL,
  slug VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status ENUM('active','hidden') NOT NULL DEFAULT 'active',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE website_announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('active','hidden') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
