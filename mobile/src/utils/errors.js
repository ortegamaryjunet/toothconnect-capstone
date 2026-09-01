export function formatErrorText(message) {
  const text = String(message || '').trim();

  if (!text) {
    return '';
  }

  return /[.!?]$/.test(text) ? text : `${text}.`;
}
