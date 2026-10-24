CREATE TABLE IF NOT EXISTS termsandcondition (
  id TINYINT UNSIGNED PRIMARY KEY,
  content MEDIUMTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_termsandcondition_singleton CHECK (id = 1)
);

INSERT IGNORE INTO termsandcondition (id, content)
VALUES (1, 'By creating a ToothConnect account, you agree to provide accurate account and contact information and keep your password confidential. Your account lets you manage registration and access appointment services.\n\nUse the app respectfully and do not attempt to disrupt its services or access another person’s account. Appointment requests are subject to availability and clinic confirmation.\n\nYou may contact the clinic through its listed channels if you have questions about these terms or your account.');

CREATE TABLE IF NOT EXISTS privacypolicy (
  id TINYINT UNSIGNED PRIMARY KEY,
  content MEDIUMTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_privacypolicy_singleton CHECK (id = 1)
);

INSERT IGNORE INTO privacypolicy (id, content)
VALUES (1, 'ToothConnect uses the information you provide, such as your name, email address, preferred branch, and appointment details, to create and manage your account and provide clinic services.\n\nYour information may be accessed by authorized clinic personnel who need it to assist with your care and appointments. Keep your login details private and contact the clinic if you believe your account has been accessed without permission.\n\nFor questions about your personal information or to request assistance, contact the clinic through its listed channels.');
