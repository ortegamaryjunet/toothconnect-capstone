function normalizeToISO(value) {
  if (!value) return null;
  if (typeof value === 'string' && !value.includes('T')) {
    return value.replace(' ', 'T') + 'Z';
  }
  return value;
}

export function formatDateTime(value) {
  const iso = normalizeToISO(value);
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(value) {
  const iso = normalizeToISO(value);
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeOnly(value) {
  const iso = normalizeToISO(value);
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeDate(value) {
  const iso = normalizeToISO(value);
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dDay = new Date(d);
  dDay.setHours(0, 0, 0, 0);

  if (dDay.getTime() === today.getTime()) return 'Today';
  if (dDay.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return formatDateOnly(value);
}