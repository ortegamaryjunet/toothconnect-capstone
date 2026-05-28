-- Align current service-doctor assignments with the official clean booking setup.
-- Data only; no table, column, route, API, or workflow changes.

START TRANSACTION;

UPDATE services SET name = 'Smile Make-overs'
WHERE name IN ('Smile Makeovers', 'Smile Make-Overs');

UPDATE services SET name = 'Veneers (Emax or Zirconia)'
WHERE name IN ('Veneers (Emax / Zirconia)', 'Veneers (Emax or Zirconia)');

UPDATE services SET name = 'Complete & Removable Partial Dentures'
WHERE name IN ('Complete and Removable Partial Dentures', 'Complete & Removable Partial Dentures');

UPDATE services SET name = 'Orthodontics (Braces)'
WHERE name IN ('Braces', 'Orthodontics (Braces)');

DELETE ds
FROM dentist_services ds
JOIN users u ON u.id = ds.dentist_id
WHERE u.email IN (
  'twinky.belino@test.com',
  'maureen.datu@test.com',
  'tourmand.morteza@test.com',
  'adrian.santos@test.com',
  'camille.reyes@test.com',
  'nathan.cruz@test.com'
);

DELETE FROM dentist_services
WHERE dentist_id IN (
  SELECT id FROM users
  WHERE email IN (
    'adrian.santos@test.com',
    'camille.reyes@test.com',
    'nathan.cruz@test.com'
  )
);

INSERT IGNORE INTO dentist_services (dentist_id, service_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN services s
WHERE u.email = 'twinky.belino@test.com'
  AND s.name IN (
    'Deep Scaling (Dental Cleaning)',
    'Smile Make-overs',
    'Teeth Whitening',
    'Veneers (Emax or Zirconia)',
    'Porcelain Jacket Crowns (PFM or Zirconia)',
    'Complete & Removable Partial Dentures',
    'Clear Aligners',
    'Dental Implants'
  );

INSERT IGNORE INTO dentist_services (dentist_id, service_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN services s
WHERE u.email = 'tourmand.morteza@test.com'
  AND s.name = 'Root Canal Treatment';

INSERT IGNORE INTO dentist_services (dentist_id, service_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN services s
WHERE u.email = 'maureen.datu@test.com'
  AND s.name = 'Orthodontics (Braces)';

COMMIT;
