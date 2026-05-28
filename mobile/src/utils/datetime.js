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
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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
  return formatDateOnly(value);
}
