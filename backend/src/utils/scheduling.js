const { toMySQLDateTime } = require('./dates');

const APPOINTMENT_BUFFER_MINUTES = 30;
const LUNCH_START_HOUR = 12;
const LUNCH_END_HOUR = 13;

function jsWeekday(date) {
  return date.getUTCDay();
}

function parseISOToDate(value) {
  if (value instanceof Date) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return d;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function isInsideLunch(slotStart, slotEnd) {
  const startHour = slotStart.getUTCHours() + slotStart.getUTCMinutes() / 60;
  const endHour = slotEnd.getUTCHours() + slotEnd.getUTCMinutes() / 60;
  return startHour < LUNCH_END_HOUR && endHour > LUNCH_START_HOUR;
}

function generateCandidateSlots({ workStart, workEnd, durationMin, stepMin = 15 }) {
  const slots = [];
  let cursor = new Date(workStart);
  while (true) {
    const slotEnd = addMinutes(cursor, durationMin);
    if (slotEnd > workEnd) break;
    slots.push({ start: new Date(cursor), end: new Date(slotEnd) });
    cursor = addMinutes(cursor, stepMin);
  }
  return slots;
}

function combineDateAndTime(dateOnly, timeStr) {
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  const d = new Date(dateOnly);
  d.setUTCHours(hh, mm, ss || 0, 0);
  return d;
}

function startOfUTCDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function* eachUTCDayInRange(startDate, endDate) {
  let cursor = startOfUTCDay(startDate);
  const lastDay = startOfUTCDay(endDate);
  while (cursor <= lastDay) {
    yield new Date(cursor);
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
}

module.exports = {
  LUNCH_START_HOUR,
  LUNCH_END_HOUR,
  APPOINTMENT_BUFFER_MINUTES,
  jsWeekday,
  parseISOToDate,
  addMinutes,
  rangesOverlap,
  isInsideLunch,
  generateCandidateSlots,
  combineDateAndTime,
  startOfUTCDay,
  eachUTCDayInRange,
  toMySQLDateTime,
};
