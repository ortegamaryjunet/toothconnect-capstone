import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../pages/Login';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import OTP from '../pages/OTP';
import ResetPassword from '../pages/ResetPassword';

import InventoryPage from '../pages/InventoryPage';

import AdminDashboard from '../pages/AdminDashboard';
import AdminPatients from '../pages/AdminPatients';
import AdminEmployees from '../pages/AdminEmployees';
import AdminLogs from '../pages/AdminLogs';
import AdminNotifications from '../pages/AdminNotifications';
import AdminReports from '../pages/AdminReports';
import AdminSettings from '../pages/AdminSettings';
import AdminEmployeeForm from '../pages/AdminEmployeeForm';
import AdminScheduleRequests from '../pages/AdminScheduleRequests';

import DentistDashboard from '../pages/DentistDashboard';
import DentistAppointment from '../pages/DentistAppointment';
import DentistRecords from '../pages/DentistRecords';
import DentistViewProfile from '../pages/DentistViewProfile';
import DentistNotifications from '../pages/DentistNotifications';
import DentistProfile from '../pages/DentistProfile';
import DentistSchedule from '../pages/DentistSchedule';

import RecepDashboard from '../pages/RecepDashboard';
import RecepAppointments from '../pages/RecepAppointments';
import RecepRecords from '../pages/RecepRecords';
import RecepReceipts from '../pages/RecepReceipts';
import RecepPatientAcc from '../pages/RecepPatientAcc';
import RecepAppointmentForm from '../pages/RecepAppointmentForm';
import RecepMessage from '../pages/RecepMessage';
import RecepNotifications from '../pages/RecepNotifications';
import RecepPatientProfile from '../pages/RecepPatientProfile';
import RecepPatientForm from '../pages/RecepPatientForm';
import RecepProfile from '../pages/RecepProfile';

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
        <Route path="/register" element={<Register/>} />
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
        <Route path="/otp" element={<OTP/>} />
        <Route path="/resetpassword" element={<ResetPassword/>} />

        {/*ADMIN*/}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/adminPatients"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminPatients /></ProtectedRoute>}
        />
        <Route
          path="/adminPatients/:patientId"
          element={<ProtectedRoute allowedRoles={['admin']}><DentistViewProfile /></ProtectedRoute>}
        />
        <Route
          path="/adminEmployees"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployees /></ProtectedRoute>}
        />
        <Route
          path="/adminEmployeeForm"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployeeForm /></ProtectedRoute>}
        />
        <Route
          path="/adminInventory"
          element={<ProtectedRoute allowedRoles={['admin']}><InventoryPage /></ProtectedRoute>}
        />
        <Route
          path="/adminLogs"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>}
        />
        <Route
          path="/adminNotif"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminNotifications /></ProtectedRoute>}
        />
        <Route
          path="/adminReports"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>}
        />
        <Route
          path="/adminSettings"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>}
        />
        <Route
          path="/adminScheduleRequests"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminScheduleRequests /></ProtectedRoute>}
        />

        {/*DENTIST*/}
        <Route
          path="/dentist"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dentistAppointment"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistAppointment /></ProtectedRoute>}
        />
        <Route
          path="/dentistRecords"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistRecords /></ProtectedRoute>}
        />
        <Route
          path="/dentistRecords/:patientId"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistViewProfile /></ProtectedRoute>}
        />
        <Route
          path="/dentistNotif"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistNotifications /></ProtectedRoute>}
        />
        <Route
          path="/dentistProfile"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistProfile /></ProtectedRoute>}
        />

        <Route
          path="/dentistSchedule"
          element={<ProtectedRoute allowedRoles={['dentist']}><DentistSchedule /></ProtectedRoute>}
        />

        {/*RECEPTIONIST*/}
        <Route
          path="/receptionist"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepDashboard /></ProtectedRoute>}
        />

        <Route
          path="/receptionistAppointments"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepAppointments /></ProtectedRoute>}
        />

        <Route
          path="/receptionistAppointmentForm"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepAppointmentForm /></ProtectedRoute>}
        />

        <Route
          path="/receptionistRecords"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepRecords /></ProtectedRoute>}
        />

        <Route
          path="/receptionistReceipts"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepReceipts /></ProtectedRoute>}
        />

        <Route
          path="/receptionistPatientAcc"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepPatientAcc /></ProtectedRoute>}
        />

        <Route
          path="/receptionistInventory"
          element={<ProtectedRoute allowedRoles={['receptionist']}><InventoryPage /></ProtectedRoute>}
        />

        <Route
          path="/receptionistMessage"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepMessage /></ProtectedRoute>}
        />

        <Route
          path="/receptionistNotif"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepNotifications /></ProtectedRoute>}
        />

        <Route
          path="/receptionistPatientProfile"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepPatientProfile /></ProtectedRoute>}
        />

        <Route
          path="/receptionistPatientForm"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepPatientForm /></ProtectedRoute>}
        />

        <Route
          path="/receptionistProfile"
          element={<ProtectedRoute allowedRoles={['receptionist']}><RecepProfile /></ProtectedRoute>}
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
