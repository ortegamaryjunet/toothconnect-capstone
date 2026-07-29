export const CANCELLATION_LOCK_HOURS = 24;

export function isCancellationLocked(appointment) {
  if (!appointment?.start_time) return false;

  const scheduledAt = new Date(appointment.start_time).getTime();
  if (Number.isNaN(scheduledAt)) return false;

  const hoursUntilAppointment = (scheduledAt - Date.now()) / (60 * 60 * 1000);
  return hoursUntilAppointment <= CANCELLATION_LOCK_HOURS;
}
