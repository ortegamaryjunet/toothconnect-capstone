const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function seed() {
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = [
    'refresh_tokens', 'audit_logs', 'inventory', 'notifications', 'messages',
    'payments', 'patient_feedback', 'treatments', 'appointments',
    'dentist_schedules', 'dentist_services', 'services', 'otp_codes', 
    'pending_registrations', 'access_grants', 'user_branches', 'users', 'branches',
  ];
  for (const t of tables) await pool.query(`DELETE FROM ${t}`);
  for (const t of tables) await pool.query(`ALTER TABLE ${t} AUTO_INCREMENT = 1`);
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  await pool.query(
    `INSERT INTO branches (name, address, phone, contact_person, date_opened, operating_hours, years_active, status) VALUES
     ('Las Piñas', '123 Sample St, Las Piñas', '02-1234-5678', 'Anna Santos', '2018-06-15', 'Mon - Sat, 9:00 AM - 5:00 PM', '15+ years', 'Active'),
     ('Makati', '456 Sample Ave, Makati', '02-8765-4321', 'Rica Tan', '2017-04-10', 'Mon - Sat, 9:00 AM - 5:00 PM', '20+ years', 'Active')`
  );

  const users = [
    ['admin',        null, 'Admin User',     'admin@test.com',     hash('password123')],
    ['dentist',      1,    'Dr. Jose Reyes', 'dentist1@test.com',  hash('password123')],
    ['dentist',      2,    'Dr. Maria Cruz', 'dentist2@test.com',  hash('password123')],
    ['receptionist', 1,    'Anna Santos',    'recep1@test.com',    hash('password123')],
    ['receptionist', 2,    'Rica Tan',       'recep2@test.com',    hash('password123')],
    ['patient',      null, 'Liza Mendoza',   'patient1@test.com',  hash('password123')],
    ['patient',      null, 'Juan Dela Cruz', 'patient2@test.com',  hash('password123')],
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (role, home_branch_id, name, email, password_hash, email_verified)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      u
    );
  }

  await pool.query(
    `INSERT INTO user_branches (user_id, branch_id, is_primary) VALUES
     (1, 1, FALSE), (1, 2, FALSE),
     (2, 1, TRUE),
     (3, 2, TRUE),
     (4, 1, TRUE),
     (5, 2, TRUE)`
  );

  await pool.query(
    `INSERT INTO services (name, category, duration_min, price) VALUES
     ('Cleaning', 'General Dentistry', 30, 1500.00),
     ('Tooth extraction', 'Surgery', 45, 2500.00),
     ('Filling', 'General Dentistry', 45, 2000.00),
     ('Root canal', 'General Dentistry', 90, 8000.00),
     ('Consultation', 'General Dentistry', 20, 500.00)`
  );

  await pool.query(
    `INSERT INTO dentist_services (dentist_id, service_id) VALUES
     (2, 1), (2, 2), (2, 3), (2, 5),
     (3, 1), (3, 3), (3, 4), (3, 5)`
  );

  for (const dentistId of [2, 3]) {
    for (const branchId of [1, 2]) {
      for (let weekday = 0; weekday <= 6; weekday++) {
        await pool.query(
          `INSERT INTO dentist_schedules (dentist_id, branch_id, weekday, start_time, end_time)
           VALUES (?, ?, ?, '10:00:00', '19:00:00')`,
          [dentistId, branchId, weekday]
        );
      }
    }
  }

  console.log('Seed complete. Test users (password = password123):');
  console.log('  admin@test.com    -> admin (both branches)');
  console.log('  dentist1@test.com -> dentist at QC');
  console.log('  dentist2@test.com -> dentist at Makati');
  console.log('  recep1@test.com   -> receptionist at QC');
  console.log('  recep2@test.com   -> receptionist at Makati');
  console.log('  patient1@test.com -> patient (mobile)');
  console.log('  patient2@test.com -> patient (mobile)');

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
