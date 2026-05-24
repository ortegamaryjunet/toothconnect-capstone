const CLINIC_TIMEZONE_OFFSET_MINUTES = 8 * 60; // Philippines (UTC+8)

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Convert a UTC Date (stored in DB as UTC) into the clinic-local calendar date key (YYYY-MM-DD).
// Uses a fixed UTC+8 offset to match the rest of the scheduling logic in this repo.
function clinicDateKeyFromUtcDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const shifted = new Date(d.getTime() + CLINIC_TIMEZONE_OFFSET_MINUTES * 60 * 1000);
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
}

module.exports = {
  CLINIC_TIMEZONE_OFFSET_MINUTES,
  clinicDateKeyFromUtcDate,
};

