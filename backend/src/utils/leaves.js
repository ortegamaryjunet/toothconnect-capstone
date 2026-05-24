async function getApprovedLeaveForDentistOnDate(pool, dentistId, dateKey) {
  if (!dentistId || !dateKey) return null;
  const [rows] = await pool.query(
    `SELECT id, date_from, date_to, reason
     FROM schedule_requests
     WHERE dentist_id = ?
       AND request_type = 'leave'
       AND status = 'approved'
       AND ? BETWEEN date_from AND date_to
     ORDER BY id DESC
     LIMIT 1`,
    [dentistId, dateKey]
  );
  return rows[0] || null;
}

async function getApprovedLeavesForDentistsInRange(pool, dentistIds, fromDateKey, toDateKey) {
  if (!Array.isArray(dentistIds) || dentistIds.length === 0) return new Map();
  const fromKey = String(fromDateKey || '').slice(0, 10);
  const toKey = String(toDateKey || '').slice(0, 10);
  const [rows] = await pool.query(
    `SELECT dentist_id, date_from, date_to
     FROM schedule_requests
     WHERE request_type = 'leave'
       AND status = 'approved'
       AND dentist_id IN (?)
       AND date_from <= ?
       AND date_to >= ?`,
    [dentistIds, toKey, fromKey]
  );

  const map = new Map();
  for (const r of rows) {
    const dentistId = Number(r.dentist_id);
    if (!map.has(dentistId)) map.set(dentistId, []);
    map.get(dentistId).push({
      from: String(r.date_from).slice(0, 10),
      to: String(r.date_to).slice(0, 10),
    });
  }
  return map;
}

function isDateKeyWithinRanges(dateKey, ranges) {
  if (!dateKey || !Array.isArray(ranges) || ranges.length === 0) return false;
  const k = String(dateKey).slice(0, 10);
  return ranges.some((r) => k >= r.from && k <= r.to);
}

module.exports = {
  getApprovedLeaveForDentistOnDate,
  getApprovedLeavesForDentistsInRange,
  isDateKeyWithinRanges,
};

