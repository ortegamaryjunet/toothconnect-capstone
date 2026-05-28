-- Align current service-doctor assignments with the configured booking setup.
-- Data only; no table, column, route, API, or workflow changes.
-- Existing extra/new doctors assigned to these services are preserved.

START TRANSACTION;

INSERT IGNORE INTO dentist_services (dentist_id, service_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN services s
WHERE u.name = 'Dr. Twinky Belino'
  AND s.name IN (
    'Deep Scaling (Dental Cleaning)',
    'Smile Makeovers',
    'Teeth Whitening',
    'Veneers (Emax / Zirconia)',
    'Porcelain Jacket Crowns (PFM or Zirconia)',
    'Complete and Removable Partial Dentures',
    'Clear Aligners',
    'Dental Implants'
  );

INSERT IGNORE INTO dentist_services (dentist_id, service_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN services s
WHERE u.name = 'Dr. Tourmand Morteza'
  AND s.name = 'Root Canal Treatment';

INSERT IGNORE INTO dentist_services (dentist_id, service_id)
SELECT u.id, s.id
FROM users u
CROSS JOIN services s
WHERE u.name = 'Dr. Maureen Datu'
  AND s.name = 'Braces';

COMMIT;
