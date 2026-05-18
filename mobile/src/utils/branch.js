export function getBranchCity(branch) {
  const address = branch?.address || branch?.branch_address || '';
  const parts = String(address)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return branch?.name || branch?.branch_name || 'Branch';
  }

  const cityPart = parts.find((part) => !/\d/.test(part)) || parts[parts.length - 1];

  return cityPart.replace(/\b(branch|clinic)\b/gi, '').trim() || cityPart;
}
