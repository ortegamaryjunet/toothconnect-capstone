export function formatDateTime(isoOrMysql) {
  if (!isoOrMysql) return '';
  const value = typeof isoOrMysql === 'string' && !isoOrMysql.includes('T')
    ? isoOrMysql.replace(' ', 'T') + 'Z'
    : isoOrMysql;
  const d = new Date(value);
  return d.toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(isoOrMysql) {
  if (!isoOrMysql) return '';
  const value = typeof isoOrMysql === 'string' && !isoOrMysql.includes('T')
    ? isoOrMysql.replace(' ', 'T') + 'Z'
    : isoOrMysql;
  const d = new Date(value);
  return d.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeOnly(isoOrMysql) {
  if (!isoOrMysql) return '';
  const value = typeof isoOrMysql === 'string' && !isoOrMysql.includes('T')
    ? isoOrMysql.replace(' ', 'T') + 'Z'
    : isoOrMysql;
  const d = new Date(value);
  return d.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function todayBoundsUTC() {
  const now = new Date();
  const localDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localDayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    fromUTC: localDayStart.toISOString(),
    toUTC: localDayEnd.toISOString(),
  };
}

export function nextNDaysBoundsUTC(n) {
  const now = new Date();
  const localDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localDayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
  return {
    fromUTC: localDayStart.toISOString(),
    toUTC: localDayEnd.toISOString(),
  };
}