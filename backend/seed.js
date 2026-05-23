const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function tableExists(tableName) {
  const [rows] = await pool.query(
    `
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return rows.length > 0;
}

async function safeDeleteAndReset(tables) {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of tables) {
    const exists = await tableExists(table);

    if (exists) {
      await pool.query(`DELETE FROM \`${table}\``);
      await pool.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
      console.log(`Cleared table: ${table}`);
    } else {
      console.log(`Skipped missing table: ${table}`);
    }
  }

  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function seed() {
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const tables = [
    'website_announcements',
    'website_services',
    'website_faqs',
    'website_content',
    'refresh_tokens',
    'audit_logs',
    'schedule_requests',
    'appointment_consumption',
    'service_kit_items',
    'service_kits',
    'equipment',
    'medicines',
    'supplies',
    'notifications',
    'messages',
    'clinic_expenses',
    'payments',
    'patient_feedback',
    'treatment_plans',
    'treatments',
    'appointments',
    'dentist_schedules',
    'dentist_services',
    'services',
    'otp_codes',
    'pending_registrations',
    'access_grants',
    'user_branches',
    'staff_previous_work',
    'staff_profile',
    'patient_profile',
    'user_presence',
    'users',
    'branches',
  ];

  await safeDeleteAndReset(tables);

  // =========================
  // Branches
  // =========================
  await pool.query(
    `
    INSERT INTO branches
      (id, name, address, phone, contact_person, date_opened, operating_hours, years_active, status)
    VALUES
      (1, 'Smile Empress Dental Hub', 'Makati', NULL, NULL, NULL, '10:00 AM - 7:00 PM', '20+ years', 'Active'),
      (2, 'Smile Empress Dental Hub', 'Las Piñas', NULL, NULL, NULL, '10:00 AM - 7:00 PM', '15+ years', 'Active')
    `
  );

  // =========================
  // Users: dentists and receptionists only
  // No admin account
  // No patient account
  // =========================
  const users = [
    // Dentists
    ['dentist', 1, 'Dr. Twinky Belino', 'twinky.belino@test.com', hash('password123')],
    ['dentist', 1, 'Dr. Maureen Datu', 'maureen.datu@test.com', hash('password123')],
    ['dentist', 2, 'Dr. Tourmand Morteza', 'tourmand.morteza@test.com', hash('password123')],

    // Dummy dentists for other services
    ['dentist', 1, 'Dr. Adrian Santos', 'adrian.santos@test.com', hash('password123')],
    ['dentist', 2, 'Dr. Camille Reyes', 'camille.reyes@test.com', hash('password123')],
    ['dentist', 2, 'Dr. Nathan Cruz', 'nathan.cruz@test.com', hash('password123')],

    // Receptionists
    ['receptionist', 1, 'Makati Receptionist', 'recep.makati@test.com', hash('password123')],
    ['receptionist', 2, 'Las Piñas Receptionist', 'recep.laspinas@test.com', hash('password123')],
  ];

  for (const user of users) {
    await pool.query(
      `
      INSERT INTO users
        (role, home_branch_id, name, email, password_hash, email_verified)
      VALUES (?, ?, ?, ?, ?, TRUE)
      `,
      user
    );
  }

  // User IDs after insert:
  // 1 Dr. Twinky Belino
  // 2 Dr. Maureen Datu
  // 3 Dr. Tourmand Morteza
  // 4 Dr. Adrian Santos
  // 5 Dr. Camille Reyes
  // 6 Dr. Nathan Cruz
  // 7 Makati Receptionist
  // 8 Las Piñas Receptionist
  await pool.query(
    `
    INSERT INTO user_branches (user_id, branch_id, is_primary)
    VALUES
      (1, 1, TRUE),
      (2, 1, TRUE),
      (3, 2, TRUE),
      (4, 1, TRUE),
      (5, 2, TRUE),
      (6, 2, TRUE),
      (7, 1, TRUE),
      (8, 2, TRUE)
    `
  );

  // =========================
  // Staff profiles
  // Matches seeded user IDs: 1–6 dentists, 7–8 receptionists
  // =========================
  await pool.query(
    `
    INSERT INTO staff_profile
      (user_id, branch_id, staff_type,
       first_name, last_name,
       position, specialization, work_department, medical_degree,
       employment_type, shift_type,
       work_days, work_start_time, work_end_time, status)
    VALUES
      (1, 1, 'Dentist', 'Twinky', 'Belino',
       'Dentist', 'Cosmetic Dentist', 'Cosmetic Dentistry', 'DMD',
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
       '10:00:00', '19:00:00', 'Active'),

      (2, 1, 'Dentist', 'Maureen', 'Datu',
       'Dentist', 'Endodontist', 'Endodontics', 'DMD',
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
       '10:00:00', '19:00:00', 'Active'),

      (3, 2, 'Dentist', 'Tourmand', 'Morteza',
       'Dentist', 'General Dentist', 'Periodontics', 'DMD',
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
       '10:00:00', '19:00:00', 'Active'),

      (4, 1, 'Dentist', 'Adrian', 'Santos',
       'Dentist', 'Orthodontist', 'Orthodontics', 'DMD',
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
       '10:00:00', '19:00:00', 'Active'),

      (5, 2, 'Dentist', 'Camille', 'Reyes',
       'Dentist', 'Prosthodontist', 'Prosthodontics', 'DMD',
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
       '10:00:00', '19:00:00', 'Active'),

      (6, 2, 'Dentist', 'Nathan', 'Cruz',
       'Dentist', 'Implantologist', 'Prosthodontics', 'DMD',
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
       '10:00:00', '19:00:00', 'Active'),

      (7, 1, 'Receptionist', 'Makati', 'Receptionist',
       'Receptionist', NULL, NULL, NULL,
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday',
       '10:00:00', '19:00:00', 'Active'),

      (8, 2, 'Receptionist', 'Las Piñas', 'Receptionist',
       'Receptionist', NULL, NULL, NULL,
       'Full-Time', 'Regular',
       'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday',
       '10:00:00', '19:00:00', 'Active')
    `
  );

  // =========================
  // Services
  // =========================
  await pool.query(
    `
    INSERT INTO services
      (category, name, duration_min, price, status, description)
    VALUES
      ('Orthodontics', 'Braces', 60, 40000.00, 'Active',
       'Traditional orthodontic treatment used to correct teeth alignment and bite problems.'),

      ('Orthodontics', 'Clear Aligners', 45, 70000.00, 'Active',
       'Removable transparent aligners designed to gradually straighten teeth.'),

      ('Endodontics', 'Root Canal Treatment', 90, 8000.00, 'Active',
       'Treatment for infected or damaged tooth pulp to save the natural tooth.'),

      ('Cosmetic Dentistry', 'Smile Makeovers', 90, 25000.00, 'Active',
       'A customized cosmetic dental treatment plan to improve the overall appearance of the smile.'),

      ('Cosmetic Dentistry', 'Teeth Whitening', 60, 6000.00, 'Active',
       'A cosmetic procedure that helps lighten teeth and reduce stains or discoloration.'),

      ('Cosmetic Dentistry', 'Veneers (Emax / Zirconia)', 90, 18000.00, 'Active',
       'Thin custom-made shells placed over the front surface of teeth to improve shape, color, and appearance.'),

      ('Periodontics', 'Deep Scaling (Dental Cleaning)', 60, 2500.00, 'Active',
       'A deep cleaning procedure that removes plaque and tartar buildup below the gumline.'),

      ('Prosthodontics', 'Porcelain Jacket Crowns (PFM or Zirconia)', 90, 12000.00, 'Active',
       'Custom crowns used to restore damaged teeth and improve strength, shape, and appearance.'),

      ('Prosthodontics', 'Complete and Removable Partial Dentures', 90, 15000.00, 'Active',
       'Removable dental appliances used to replace missing teeth and restore chewing function.'),

      ('Prosthodontics', 'Dental Implants', 120, 60000.00, 'Active',
       'A surgical tooth replacement option using an implant post and prosthetic crown.'),

      ('General Dentistry', 'Consultation', 30, 500.00, 'Active',
       'Initial dental visit for oral examination, diagnosis, and treatment planning.')
    `
  );

  // =========================
  // Dentist services
  // =========================
  await pool.query(
    `
    INSERT INTO dentist_services (dentist_id, service_id)
    VALUES
      -- Dr. Twinky Belino - Cosmetic Dentistry
      (1, 4),
      (1, 5),
      (1, 6),
      (1, 11),

      -- Dr. Maureen Datu - Root Canal / Endodontics
      (2, 3),
      (2, 11),

      -- Dr. Tourmand Morteza - General Dentistry / Periodontics
      (3, 7),
      (3, 11),

      -- Dr. Adrian Santos - Orthodontics
      (4, 1),
      (4, 2),
      (4, 11),

      -- Dr. Camille Reyes - Prosthodontics
      (5, 8),
      (5, 9),
      (5, 11),

      -- Dr. Nathan Cruz - Dental Implants / Prosthodontics
      (6, 8),
      (6, 10),
      (6, 11)
    `
  );

  // =========================
  // Dentist schedules
  // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // =========================
  // Multi-branch schedule: 4 home days + 3 away days per week.
  // Every day has exactly 3 dentists at each branch.
  // weekday: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  //
  // Dentist | Home  | Mon | Tue | Wed | Thu | Fri | Sat | Sun
  // Twinky  | MKT   | MKT | MKT | MKT | MKT |  LP |  LP |  LP
  // Maureen | MKT   | MKT |  LP | MKT |  LP | MKT | MKT |  LP
  // Tourmand| LP    |  LP |  LP |  LP |  LP | MKT | MKT | MKT
  // Adrian  | MKT   |  LP | MKT |  LP | MKT |  LP | MKT | MKT
  // Camille | LP    |  LP | MKT |  LP | MKT |  LP |  LP | MKT
  // Nathan  | LP    | MKT |  LP | MKT |  LP | MKT |  LP |  LP
  await pool.query(
    `
    INSERT INTO dentist_schedules (dentist_id, branch_id, weekday, start_time, end_time)
    VALUES
      -- Dr. Twinky Belino (1): Makati Mon–Thu, Las Piñas Fri–Sun
      (1, 1, 1, '10:00:00', '19:00:00'),
      (1, 1, 2, '10:00:00', '19:00:00'),
      (1, 1, 3, '10:00:00', '19:00:00'),
      (1, 1, 4, '10:00:00', '19:00:00'),
      (1, 2, 5, '10:00:00', '19:00:00'),
      (1, 2, 6, '10:00:00', '19:00:00'),
      (1, 2, 0, '10:00:00', '19:00:00'),

      -- Dr. Maureen Datu (2): Makati Mon/Wed/Fri/Sat, Las Piñas Tue/Thu/Sun
      (2, 1, 1, '10:00:00', '19:00:00'),
      (2, 2, 2, '10:00:00', '19:00:00'),
      (2, 1, 3, '10:00:00', '19:00:00'),
      (2, 2, 4, '10:00:00', '19:00:00'),
      (2, 1, 5, '10:00:00', '19:00:00'),
      (2, 1, 6, '10:00:00', '19:00:00'),
      (2, 2, 0, '10:00:00', '19:00:00'),

      -- Dr. Tourmand Morteza (3): Las Piñas Mon–Thu, Makati Fri–Sun
      (3, 2, 1, '10:00:00', '19:00:00'),
      (3, 2, 2, '10:00:00', '19:00:00'),
      (3, 2, 3, '10:00:00', '19:00:00'),
      (3, 2, 4, '10:00:00', '19:00:00'),
      (3, 1, 5, '10:00:00', '19:00:00'),
      (3, 1, 6, '10:00:00', '19:00:00'),
      (3, 1, 0, '10:00:00', '19:00:00'),

      -- Dr. Adrian Santos (4): Makati Tue/Thu/Sat/Sun, Las Piñas Mon/Wed/Fri
      (4, 2, 1, '10:00:00', '19:00:00'),
      (4, 1, 2, '10:00:00', '19:00:00'),
      (4, 2, 3, '10:00:00', '19:00:00'),
      (4, 1, 4, '10:00:00', '19:00:00'),
      (4, 2, 5, '10:00:00', '19:00:00'),
      (4, 1, 6, '10:00:00', '19:00:00'),
      (4, 1, 0, '10:00:00', '19:00:00'),

      -- Dr. Camille Reyes (5): Las Piñas Mon/Wed/Fri/Sat, Makati Tue/Thu/Sun
      (5, 2, 1, '10:00:00', '19:00:00'),
      (5, 1, 2, '10:00:00', '19:00:00'),
      (5, 2, 3, '10:00:00', '19:00:00'),
      (5, 1, 4, '10:00:00', '19:00:00'),
      (5, 2, 5, '10:00:00', '19:00:00'),
      (5, 2, 6, '10:00:00', '19:00:00'),
      (5, 1, 0, '10:00:00', '19:00:00'),

      -- Dr. Nathan Cruz (6): Las Piñas Tue/Thu/Sat/Sun, Makati Mon/Wed/Fri
      (6, 1, 1, '10:00:00', '19:00:00'),
      (6, 2, 2, '10:00:00', '19:00:00'),
      (6, 1, 3, '10:00:00', '19:00:00'),
      (6, 2, 4, '10:00:00', '19:00:00'),
      (6, 1, 5, '10:00:00', '19:00:00'),
      (6, 2, 6, '10:00:00', '19:00:00'),
      (6, 2, 0, '10:00:00', '19:00:00')
    `
  );

  // =========================
  // Supplies
  // Related to cleaning, braces, veneers, crowns, dentures, implants, and consultation
  // =========================
  await pool.query(
    `
    INSERT INTO supplies
      (branch_id, supply_name, brand, supplier, category, unit, quantity, price_per_item, low_stock_threshold)
    VALUES
      (1, 'Orthodontic Brackets', 'DentalPro', 'Smile Dental Supply', 'Orthodontics', 'box', 20, 2500.00, 5),
      (1, 'Orthodontic Archwires', 'DentalPro', 'Smile Dental Supply', 'Orthodontics', 'pack', 20, 1200.00, 5),
      (1, 'Elastic Ligature Ties', 'OrthoFlex', 'Smile Dental Supply', 'Orthodontics', 'pack', 20, 350.00, 5),
      (1, 'Clear Aligner Case', 'AlignCare', 'Smile Dental Supply', 'Orthodontics', 'piece', 20, 120.00, 5),

      (1, 'Composite Veneer Kit', 'VitaDent', 'Makati Dental Depot', 'Cosmetic Dentistry', 'kit', 20, 4500.00, 5),
      (1, 'Whitening Gel Syringe', 'BrightSmile', 'Makati Dental Depot', 'Cosmetic Dentistry', 'piece', 20, 650.00, 5),
      (1, 'Shade Guide Card', 'VitaDent', 'Makati Dental Depot', 'Cosmetic Dentistry', 'piece', 20, 900.00, 5),
      (1, 'Dental Bibs', 'MediSafe', 'Makati Dental Depot', 'General Dentistry', 'pack', 20, 250.00, 5),
      (1, 'Disposable Cups', 'MediSafe', 'Makati Dental Depot', 'General Dentistry', 'pack', 20, 180.00, 5),

      (2, 'Scaling Tips', 'UltraClean', 'Las Piñas Dental Supply', 'Periodontics', 'piece', 20, 800.00, 5),
      (2, 'Prophy Brush', 'CleanDent', 'Las Piñas Dental Supply', 'General Dentistry', 'pack', 20, 300.00, 5),
      (2, 'Dental Bibs', 'MediSafe', 'Las Piñas Dental Supply', 'General Dentistry', 'pack', 20, 250.00, 5),
      (2, 'Disposable Cups', 'MediSafe', 'Las Piñas Dental Supply', 'General Dentistry', 'pack', 20, 180.00, 5),

      (2, 'Crown Impression Trays', 'CrownFit', 'Las Piñas Dental Supply', 'Prosthodontics', 'set', 20, 1000.00, 5),
      (2, 'Denture Impression Material', 'DenturePro', 'Las Piñas Dental Supply', 'Prosthodontics', 'pack', 20, 1500.00, 5),
      (2, 'Implant Surgical Drapes', 'ImplantCare', 'Las Piñas Dental Supply', 'Implants', 'pack', 20, 900.00, 5)
    `
  );

  // Cross-branch supplies — ensures all kit items resolve at both branches
  await pool.query(
    `
    INSERT INTO supplies
      (branch_id, supply_name, brand, supplier, category, unit, quantity, price_per_item, low_stock_threshold)
    VALUES
      -- Orthodontics supplies for Branch 2
      (2, 'Orthodontic Brackets',      'DentalPro',  'Las Piñas Dental Supply', 'Orthodontics',      'box',   20, 2500.00, 5),
      (2, 'Orthodontic Archwires',     'DentalPro',  'Las Piñas Dental Supply', 'Orthodontics',      'pack',  20, 1200.00, 5),
      (2, 'Elastic Ligature Ties',     'OrthoFlex',  'Las Piñas Dental Supply', 'Orthodontics',      'pack',  20,  350.00, 5),
      (2, 'Clear Aligner Case',        'AlignCare',  'Las Piñas Dental Supply', 'Orthodontics',      'piece', 10,  120.00, 5),

      -- Cosmetic Dentistry supplies for Branch 2
      (2, 'Composite Veneer Kit',      'VitaDent',   'Las Piñas Dental Supply', 'Cosmetic Dentistry','kit',   20, 4500.00, 5),
      (2, 'Whitening Gel Syringe',     'BrightSmile','Las Piñas Dental Supply', 'Cosmetic Dentistry','piece', 20,  650.00, 5),
      (2, 'Shade Guide Card',          'VitaDent',   'Las Piñas Dental Supply', 'Cosmetic Dentistry','piece', 20,  900.00, 2),

      -- Periodontics / Prosthodontics / Implants supplies for Branch 1
      (1, 'Scaling Tips',              'UltraClean', 'Makati Dental Depot',     'Periodontics',      'piece', 20,  800.00, 5),
      (1, 'Prophy Brush',              'CleanDent',  'Makati Dental Depot',     'General Dentistry', 'pack',  20,  300.00, 5),
      (1, 'Crown Impression Trays',    'CrownFit',   'Makati Dental Depot',     'Prosthodontics',    'set',   20, 1000.00, 5),
      (1, 'Denture Impression Material','DenturePro','Makati Dental Depot',     'Prosthodontics',    'pack',  20, 1500.00, 5),
      (1, 'Implant Surgical Drapes',   'ImplantCare','Makati Dental Depot',     'Implants',          'pack',  20,  900.00, 5)
    `
  );

  // =========================
  // Medicines
  // Related to root canal, surgery/implant procedures, and post-treatment care
  // =========================
  await pool.query(
    `
    INSERT INTO medicines
      (branch_id, medicine_name, generic_name, category, form, dosage, brand, supplier, unit, quantity, price_per_item, low_stock_threshold)
    VALUES
      (1, 'Lidocaine Anesthetic', 'Lidocaine HCl', 'Local Anesthetic', 'Injection', '2%', 'LidoDent', 'Makati Dental Depot', 'cartridge', 20, 120.00, 5),
      (1, 'Articaine Anesthetic', 'Articaine HCl', 'Local Anesthetic', 'Injection', '4%', 'ArtiDent', 'Makati Dental Depot', 'cartridge', 20, 140.00, 5),
      (1, 'Calcium Hydroxide Paste', 'Calcium Hydroxide', 'Endodontics', 'Paste', 'Standard', 'EndoCal', 'Makati Dental Depot', 'syringe', 20, 450.00, 5),
      (1, 'Sodium Hypochlorite Solution', 'Sodium Hypochlorite', 'Endodontics', 'Solution', '2.5%', 'EndoClean', 'Makati Dental Depot', 'bottle', 20, 380.00, 5),
      (1, 'Ibuprofen', 'Ibuprofen', 'Pain Reliever', 'Tablet', '400mg', 'PainAway', 'Makati Dental Depot', 'box', 20, 250.00, 5),
      (1, 'Topical Anesthetic Gel', 'Benzocaine', 'Topical Anesthetic', 'Gel', '20%', 'GumEase', 'Makati Dental Depot', 'tube', 20, 300.00, 5),

      (2, 'Lidocaine Anesthetic', 'Lidocaine HCl', 'Local Anesthetic', 'Injection', '2%', 'LidoDent', 'Las Piñas Dental Supply', 'cartridge', 20, 120.00, 5),
      (2, 'Chlorhexidine Mouthwash', 'Chlorhexidine Gluconate', 'Antiseptic', 'Mouthwash', '0.12%', 'OraClean', 'Las Piñas Dental Supply', 'bottle', 20, 280.00, 5),
      (2, 'Amoxicillin', 'Amoxicillin', 'Antibiotic', 'Capsule', '500mg', 'AmoxiCare', 'Las Piñas Dental Supply', 'box', 20, 350.00, 5),
      (2, 'Mefenamic Acid', 'Mefenamic Acid', 'Pain Reliever', 'Capsule', '500mg', 'PainRelief', 'Las Piñas Dental Supply', 'box', 20, 230.00, 5),
      (2, 'Topical Anesthetic Gel', 'Benzocaine', 'Topical Anesthetic', 'Gel', '20%', 'GumEase', 'Las Piñas Dental Supply', 'tube', 20, 300.00, 5),
      (2, 'Ibuprofen', 'Ibuprofen', 'Pain Reliever', 'Tablet', '400mg', 'PainAway', 'Las Piñas Dental Supply', 'box', 20, 250.00, 5)
    `
  );

  // Cross-branch medicines — ensures all kit items resolve at both branches
  await pool.query(
    `
    INSERT INTO medicines
      (branch_id, medicine_name, generic_name, category, form, dosage, brand, supplier, unit, quantity, price_per_item, low_stock_threshold)
    VALUES
      -- Endodontics medicines for Branch 2 (Root Canal kit)
      (2, 'Calcium Hydroxide Paste',      'Calcium Hydroxide',      'Endodontics', 'Paste',    'Standard', 'EndoCal',   'Las Piñas Dental Supply', 'syringe', 10, 450.00, 3),
      (2, 'Sodium Hypochlorite Solution',  'Sodium Hypochlorite',    'Endodontics', 'Solution', '2.5%',     'EndoClean', 'Las Piñas Dental Supply', 'bottle',  10, 380.00, 3),

      -- Antiseptic and antibiotic for Branch 1 (Deep Scaling and Implants kits)
      (1, 'Chlorhexidine Mouthwash',       'Chlorhexidine Gluconate','Antiseptic',  'Mouthwash','0.12%',    'OraClean',  'Makati Dental Depot',     'bottle',  10, 280.00, 3),
      (1, 'Amoxicillin',                   'Amoxicillin',            'Antibiotic',  'Capsule',  '500mg',    'AmoxiCare', 'Makati Dental Depot',     'box',     10, 350.00, 3)
    `
  );

  // =========================
  // Equipment
  // Related to diagnostics, cleaning, root canal, cosmetic, prosthodontics, and implants
  // assigned_to references dentist user IDs
  // =========================
  await pool.query(
    `
    INSERT INTO equipment
      (branch_id, equipment_name, brand, supplier, category, model_number, serial_number, location, purchase_date, warranty_date, maintenance_status, assigned_to, quantity, price_per_item, low_stock_threshold)
    VALUES
      (1, 'Dental Chair Unit', 'DentaLux', 'Makati Dental Depot', 'General Dentistry', 'DL-100', 'MK-CHAIR-001', 'Makati Operatory 1', '2023-01-15', '2028-01-15', 'Available', NULL, 10, 180000.00, 1),
      (1, 'Intraoral Camera', 'OralView', 'Makati Dental Depot', 'Diagnostics', 'OV-200', 'MK-CAM-001', 'Makati Consultation Room', '2023-03-10', '2026-03-10', 'Available', NULL, 10, 35000.00, 1),
      (1, 'Root Canal Motor', 'EndoMax', 'Makati Dental Depot', 'Endodontics', 'EM-500', 'MK-ENDO-001', 'Makati Operatory 2', '2023-06-20', '2027-06-20', 'Available', 2, 10, 65000.00, 1),
      (1, 'LED Teeth Whitening Lamp', 'BrightLite', 'Makati Dental Depot', 'Cosmetic Dentistry', 'BL-900', 'MK-WHITE-001', 'Makati Cosmetic Room', '2023-07-05', '2027-07-05', 'Available', 1, 10, 75000.00, 1),
      (1, 'Orthodontic Pliers Set', 'OrthoFlex', 'Smile Dental Supply', 'Orthodontics', 'OF-PLIER-SET', 'MK-ORTHO-001', 'Makati Ortho Cabinet', '2023-08-01', '2026-08-01', 'Available', 4, 10, 12000.00, 1),

      (2, 'Dental Chair Unit', 'DentaLux', 'Las Piñas Dental Supply', 'General Dentistry', 'DL-100', 'LP-CHAIR-001', 'Las Piñas Operatory 1', '2022-11-18', '2027-11-18', 'Available', NULL, 10, 180000.00, 1),
      (2, 'Intraoral Camera', 'OralView', 'Las Piñas Dental Supply', 'Diagnostics', 'OV-200', 'LP-CAM-001', 'Las Piñas Consultation Room', '2023-03-10', '2026-03-10', 'Available', NULL, 10, 35000.00, 1),
      (2, 'Ultrasonic Scaler', 'UltraClean', 'Las Piñas Dental Supply', 'Periodontics', 'UC-300', 'LP-SCALER-001', 'Las Piñas Cleaning Room', '2023-02-12', '2026-02-12', 'Available', 3, 10, 28000.00, 1),
      (2, 'Implant Surgical Kit', 'ImplantPro', 'Las Piñas Dental Supply', 'Implants', 'IP-KIT-700', 'LP-IMPLANT-001', 'Las Piñas Surgery Room', '2023-09-14', '2028-09-14', 'Available', 6, 10, 95000.00, 1),
      (2, 'Dental Lab Handpiece', 'CrownFit', 'Las Piñas Dental Supply', 'Prosthodontics', 'CF-HP-10', 'LP-PROSTHO-001', 'Las Piñas Prostho Room', '2023-04-22', '2026-04-22', 'Available', 5, 10, 25000.00, 1),
      (2, 'Autoclave Sterilizer', 'MediSafe', 'Las Piñas Dental Supply', 'Sterilization', 'MS-AUTO-50', 'LP-AUTO-001', 'Las Piñas Sterilization Area', '2023-05-30', '2028-05-30', 'Available', NULL, 10, 85000.00, 1)
    `
  );

  // Cross-branch equipment — ensures all kit items resolve at both branches
  await pool.query(
    `
    INSERT INTO equipment
      (branch_id, equipment_name, brand, supplier, category, model_number, serial_number, location, purchase_date, warranty_date, maintenance_status, assigned_to, quantity, price_per_item, low_stock_threshold)
    VALUES
      -- Orthodontics, Endodontics, Cosmetic equipment for Branch 2
      (2, 'Orthodontic Pliers Set',    'OrthoFlex',  'Las Piñas Dental Supply', 'Orthodontics',      'OF-PLIER-SET', 'LP-ORTHO-001',   'Las Piñas Ortho Cabinet',    '2023-08-01', '2026-08-01', 'Available', NULL, 10,  12000.00, 1),
      (2, 'Root Canal Motor',          'EndoMax',    'Las Piñas Dental Supply', 'Endodontics',       'EM-500',       'LP-ENDO-001',    'Las Piñas Operatory 2',       '2023-06-20', '2027-06-20', 'Available', NULL, 10,  65000.00, 1),
      (2, 'LED Teeth Whitening Lamp',  'BrightLite', 'Las Piñas Dental Supply', 'Cosmetic Dentistry','BL-900',       'LP-WHITE-001',   'Las Piñas Cosmetic Room',     '2023-07-05', '2027-07-05', 'Available', NULL, 10,  75000.00, 1),

      -- Periodontics, Implants, Prosthodontics equipment for Branch 1
      (1, 'Ultrasonic Scaler',         'UltraClean', 'Makati Dental Depot',     'Periodontics',      'UC-300',       'MK-SCALER-001',  'Makati Cleaning Room',        '2023-02-12', '2026-02-12', 'Available', NULL, 10,  28000.00, 1),
      (1, 'Implant Surgical Kit',      'ImplantPro', 'Makati Dental Depot',     'Implants',          'IP-KIT-700',   'MK-IMPLANT-001', 'Makati Surgery Room',         '2023-09-14', '2028-09-14', 'Available', NULL, 10,  95000.00, 1),
      (1, 'Dental Lab Handpiece',      'CrownFit',   'Makati Dental Depot',     'Prosthodontics',    'CF-HP-10',     'MK-PROSTHO-001', 'Makati Prostho Room',         '2023-04-22', '2026-04-22', 'Available', NULL, 10,  25000.00, 1)
    `
  );

  // =========================
  // Service kits
  // service_id must match the services inserted above.
  // service_kit_items uses item_name, not item_id, based on your schema.
  // =========================
  await pool.query(
    `
    INSERT INTO service_kits (service_id, notes)
    VALUES
      (1, 'Default materials and equipment for braces installation or adjustment.'),
      (2, 'Default materials for clear aligner consultation and fitting.'),
      (3, 'Default materials and medicine for root canal treatment.'),
      (4, 'Default materials for cosmetic smile makeover planning.'),
      (5, 'Default materials and equipment for teeth whitening.'),
      (6, 'Default materials for veneers preparation and placement.'),
      (7, 'Default materials and equipment for deep scaling.'),
      (8, 'Default materials for porcelain jacket crown preparation.'),
      (9, 'Default materials for complete or removable partial dentures.'),
      (10, 'Default materials and equipment for dental implant procedure.'),
      (11, 'Default materials and equipment for consultation.')
    `
  );

  await pool.query(
    `
    INSERT INTO service_kit_items
      (service_kit_id, category, item_name, default_quantity)
    VALUES
      -- 1 Braces
      (1, 'supply', 'Orthodontic Brackets', 1),
      (1, 'supply', 'Orthodontic Archwires', 1),
      (1, 'supply', 'Elastic Ligature Ties', 1),
      (1, 'equipment', 'Orthodontic Pliers Set', 1),

      -- 2 Clear Aligners
      (2, 'supply', 'Clear Aligner Case', 1),
      (2, 'equipment', 'Intraoral Camera', 1),

      -- 3 Root Canal Treatment
      (3, 'medicine', 'Lidocaine Anesthetic', 2),
      (3, 'medicine', 'Calcium Hydroxide Paste', 1),
      (3, 'medicine', 'Sodium Hypochlorite Solution', 1),
      (3, 'equipment', 'Root Canal Motor', 1),

      -- 4 Smile Makeovers
      (4, 'supply', 'Shade Guide Card', 1),
      (4, 'supply', 'Composite Veneer Kit', 1),
      (4, 'equipment', 'Intraoral Camera', 1),

      -- 5 Teeth Whitening
      (5, 'supply', 'Whitening Gel Syringe', 1),
      (5, 'equipment', 'LED Teeth Whitening Lamp', 1),
      (5, 'medicine', 'Topical Anesthetic Gel', 1),

      -- 6 Veneers
      (6, 'supply', 'Composite Veneer Kit', 1),
      (6, 'supply', 'Shade Guide Card', 1),
      (6, 'medicine', 'Lidocaine Anesthetic', 1),

      -- 7 Deep Scaling
      (7, 'supply', 'Scaling Tips', 1),
      (7, 'supply', 'Prophy Brush', 1),
      (7, 'medicine', 'Chlorhexidine Mouthwash', 1),
      (7, 'equipment', 'Ultrasonic Scaler', 1),

      -- 8 Porcelain Jacket Crowns
      (8, 'supply', 'Crown Impression Trays', 1),
      (8, 'equipment', 'Dental Lab Handpiece', 1),
      (8, 'medicine', 'Lidocaine Anesthetic', 1),

      -- 9 Complete and Removable Partial Dentures
      (9, 'supply', 'Denture Impression Material', 1),
      (9, 'supply', 'Crown Impression Trays', 1),
      (9, 'equipment', 'Dental Lab Handpiece', 1),

      -- 10 Dental Implants
      (10, 'supply', 'Implant Surgical Drapes', 1),
      (10, 'medicine', 'Lidocaine Anesthetic', 2),
      (10, 'medicine', 'Amoxicillin', 1),
      (10, 'medicine', 'Ibuprofen', 1),
      (10, 'equipment', 'Implant Surgical Kit', 1),

      -- 11 Consultation
      (11, 'supply', 'Dental Bibs', 1),
      (11, 'supply', 'Disposable Cups', 1),
      (11, 'equipment', 'Intraoral Camera', 1)
    `
  );

  // =========================
  // Website CMS — Content
  // Matches hardcoded defaults in website/index.html and website/js/HomePage.js
  // section + field_key must align with getContent() key format: `${section}_${field_key}`
  // =========================
  await pool.query(
    `
    INSERT INTO website_content (section, field_key, field_value)
    VALUES
      ('hero', 'eyebrow',       'Smile with confidence. Shine with us.'),
      ('hero', 'heading',       'Let''s illuminate your smile journey together!'),
      ('hero', 'description',   'Smile Empress Dental Hub delivers gentle and modern dental care focused on keeping every patient comfortable while achieving healthier, brighter, and more confident smiles.'),
      ('hero', 'stat1_value',   '10+'),
      ('hero', 'stat1_label',   'Dental Services'),
      ('hero', 'stat2_value',   '98%'),
      ('hero', 'stat2_label',   'Happy & Satisfied Patients'),
      ('hero', 'stat3_value',   '20+'),
      ('hero', 'stat3_label',   'Years of Dental Experience'),
      ('hero', 'dentist_name',  'Dra. Twinky D. Belino'),
      ('hero', 'dentist_title', 'Cosmetic Dentist'),
      ('about', 'paragraph1',   'Smile Empress Dental Hub is built on friendly, gentle, and quality dental care for every patient.'),
      ('about', 'paragraph2',   'Our clinic provides preventive care, cosmetic treatments, orthodontics, root canal treatment, dentures, crowns, veneers, clear aligners, and dental implants.'),
      ('about', 'paragraph3',   'Whether you need dental cleaning, a smile make-over, or complete oral care, our team is ready to help you achieve a healthier and brighter smile.'),
      ('hours', 'weekdays',     'Monday to Saturday'),
      ('hours', 'weekday_time', '10:00 AM - 7:00 PM'),
      ('hours', 'sunday',       'Sunday'),
      ('hours', 'sunday_note',  'By Appointment'),
      ('contact', 'tagline',      'Your Smile, Our Priority'),
      ('contact', 'phone1',       '0977-066-5269'),
      ('contact', 'phone2',       '0916-525-8468'),
      ('contact', 'email',        'smileempressdentalhub@gmail.com'),
      ('contact', 'facebook_url', 'https://www.facebook.com/Thesmileempressdentalhub'),
      ('footer',  'brand_name',   'Smile Empress Dental Hub')
    `
  );

  // =========================
  // Website CMS — FAQs
  // Matches the 5 FAQ items hardcoded in website/index.html #faq-list
  // =========================
  await pool.query(
    `
    INSERT INTO website_faqs (question, answer, sort_order, status)
    VALUES
      ('What services do you offer?',
       'We offer deep scaling, teeth whitening, veneers, crowns, dentures, root canal treatment, braces, clear aligners, and dental implants.',
       1, 'active'),
      ('Do I need to make an appointment?',
       'Yes. Booking an appointment helps us prepare your schedule and service properly.',
       2, 'active'),
      ('Do you accept walk-ins?',
       'Walk-ins may be accepted depending on clinic availability.',
       3, 'active'),
      ('What is your clinic schedule?',
       'We are open Monday to Saturday, 10:00 AM to 7:00 PM. Sunday is by appointment.',
       4, 'active'),
      ('How can I contact the clinic?',
       'You may contact us at 0977-066-5269 or 0916-525-8468, or email us at smileempressdentalhub@gmail.com.',
       5, 'active')
    `
  );

  // =========================
  // Website CMS — Services
  // Matches the 10 service cards and modals hardcoded in website/index.html
  // image_path is relative to website/index.html (served by the static website folder)
  // slug matches the ?service= query param used by website/Services.html
  // =========================
  await pool.query(
    `
    INSERT INTO website_services (name, image_path, description, slug, sort_order, status)
    VALUES
      ('Deep Scaling',
       './images/deep-scaling.webp',
       'Deep scaling removes plaque, tartar, and buildup from teeth and gum areas. It helps improve gum health, freshen breath, and prevent dental problems caused by bacteria.',
       'scaling', 1, 'active'),

      ('Smile Make-Overs',
       './images/smile-makeover.jpg',
       'Smile make-overs improve the look of your smile through customized cosmetic dental treatments. It may include whitening, veneers, crowns, and other treatments based on your dental needs.',
       'smilemakeovers', 2, 'active'),

      ('Teeth Whitening',
       './images/teeth-whitening.jpg',
       'Teeth whitening helps reduce stains and discoloration for a cleaner and brighter smile. It is a simple cosmetic treatment that improves tooth color safely.',
       'whitening', 3, 'active'),

      ('Veneers',
       './images/veneers.jpg',
       'Veneers are thin covers placed on the front part of the teeth. They help improve tooth shape, color, spacing, and overall smile appearance.',
       'veneers', 4, 'active'),

      ('Porcelain Jacket Crowns',
       './images/crowns.jpeg',
       'Porcelain jacket crowns protect and restore damaged teeth. They improve strength, appearance, and natural function for better chewing and smiling.',
       'crowns', 5, 'active'),

      ('Dentures',
       './images/dentures.jpg',
       'Dentures replace missing teeth and support chewing, speaking, and smiling. They are made to fit comfortably and restore daily oral function.',
       'dentures', 6, 'active'),

      ('Root Canal Treatment',
       './images/root-canal.jpg',
       'Root canal treatment helps save infected or damaged teeth. It removes infection inside the tooth and helps reduce pain while keeping the natural tooth.',
       'rootcanal', 7, 'active'),

      ('Braces',
       './images/braces.jpg',
       'Braces help align crooked teeth and correct bite problems. This treatment improves smile appearance, oral function, and long-term dental health.',
       'braces', 8, 'active'),

      ('Clear Aligners',
       './images/clear-aligner.webp',
       'Clear aligners are removable trays that straighten teeth in a comfortable and discreet way. They are ideal for patients who want a cleaner orthodontic look.',
       'aligners', 9, 'active'),

      ('Dental Implants',
       './images/dental-implant.jpg',
       'Dental implants replace missing teeth with strong and natural-looking support. They help restore comfort, chewing ability, and confidence when smiling.',
       'implants', 10, 'active')
    `
  );

  console.log('');
  console.log('Seed complete.');
  console.log('Password for all seeded users: password123');
  console.log('');
  console.log('Dentist accounts:');
  console.log('  twinky.belino@test.com     -> Dr. Twinky Belino, Cosmetic Dentistry');
  console.log('  maureen.datu@test.com      -> Dr. Maureen Datu, Root Canal Treatment');
  console.log('  tourmand.morteza@test.com  -> Dr. Tourmand Morteza, General Dentistry');
  console.log('  adrian.santos@test.com     -> Dr. Adrian Santos, Orthodontics');
  console.log('  camille.reyes@test.com     -> Dr. Camille Reyes, Prosthodontics');
  console.log('  nathan.cruz@test.com       -> Dr. Nathan Cruz, Dental Implants');
  console.log('');
  console.log('Receptionist accounts:');
  console.log('  recep.makati@test.com      -> Makati branch');
  console.log('  recep.laspinas@test.com    -> Las Piñas branch');
  console.log('');
  console.log('No admin account was seeded.');
  console.log('No patient account was seeded.');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});