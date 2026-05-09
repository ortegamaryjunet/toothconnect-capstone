import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../pages/Login';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../pages/Login';
import AdminHome from '../pages/AdminHome';
import DentistHome from '../pages/DentistHome';
import ReceptionistHome from '../pages/ReceptionistHome';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomePath(user.role)} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminHome /></ProtectedRoute>}
        />
        <Route
          path="/dentist"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistHome /></ProtectedRoute>}
        />
        <Route
          path="/receptionist"
          element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistHome /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}