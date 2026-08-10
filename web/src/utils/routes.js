export function roleHomePath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'dentist') return '/dentist';
  if (role === 'receptionist') return '/receptionist';
  return '/login';
}
