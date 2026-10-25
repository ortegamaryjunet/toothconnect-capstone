import { useEffect, useState } from 'react';
import { AuthProvider } from './auth/AuthContext';
import AppRouter from './router/AppRouter';
import api from './api/axios';
import { CLEARED_CLINIC_LOGO } from './utils/clinicLogo';

export default function App() {
  const [, setClinicLogoPath] = useState(() => localStorage.getItem('clinic_logo_path') || '');
  useEffect(() => {
    const syncClinicLogo = () => setClinicLogoPath(localStorage.getItem('clinic_logo_path') || '');
    window.addEventListener('clinic-logo-updated', syncClinicLogo);
    api.get('/system/clinic-logo')
      .then(({ data }) => {
        const logoPath = data?.path;
        if (data?.cleared) localStorage.setItem('clinic_logo_path', CLEARED_CLINIC_LOGO);
        else if (logoPath) localStorage.setItem('clinic_logo_path', logoPath);
        else localStorage.removeItem('clinic_logo_path');
        syncClinicLogo();
      })
      .catch((error) => console.error('Failed to load clinic logo', error));
    return () => window.removeEventListener('clinic-logo-updated', syncClinicLogo);
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
