import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleHomePath } from '../pages/Login';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../pages/Login';

const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const OTP = lazy(() => import('../pages/OTP'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));

const InventoryPage = lazy(() => import('../pages/InventoryPage'));

const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminPatients = lazy(() => import('../pages/AdminPatients'));
const AdminEmployees = lazy(() => import('../pages/AdminEmployees'));
const AdminLogs = lazy(() => import('../pages/AdminLogs'));
const AdminNotifications = lazy(() => import('../pages/AdminNotifications'));
const AdminReports = lazy(() => import('../pages/AdminReports'));
const AdminTransactions = lazy(() => import('../pages/AdminTransactions'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const AdminEmployeeForm = lazy(() => import('../pages/AdminEmployeeForm'));
const AdminScheduleRequests = lazy(() => import('../pages/AdminScheduleRequests'));

const DentistDashboard = lazy(() => import('../pages/DentistDashboard'));
const DentistAppointment = lazy(() => import('../pages/DentistAppointment'));
const DentistRecords = lazy(() => import('../pages/DentistRecords'));
const DentistViewProfile = lazy(() => import('../pages/DentistViewProfile'));
const DentistNotifications = lazy(() => import('../pages/DentistNotifications'));
const DentistProfile = lazy(() => import('../pages/DentistProfile'));
const DentistSchedule = lazy(() => import('../pages/DentistSchedule'));

const RecepDashboard = lazy(() => import('../pages/RecepDashboard'));
const RecepAppointments = lazy(() => import('../pages/RecepAppointments'));
const RecepRecords = lazy(() => import('../pages/RecepRecords'));
const RecepReceipts = lazy(() => import('../pages/RecepReceipts'));
const RecepPatientAcc = lazy(() => import('../pages/RecepPatientAcc'));
const RecepAppointmentForm = lazy(() => import('../pages/RecepAppointmentForm'));
const RecepMessage = lazy(() => import('../pages/RecepMessage'));
const RecepNotifications = lazy(() => import('../pages/RecepNotifications'));
const RecepPatientProfile = lazy(() => import('../pages/RecepPatientProfile'));
const RecepPatientForm = lazy(() => import('../pages/RecepPatientForm'));
const RecepProfile = lazy(() => import('../pages/RecepProfile'));
const RecepInquiries = lazy(() => import('../pages/RecepInquiries'));

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomePath(user.role)} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
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
            path="/adminTransactions"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>}
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

          <Route
            path="/receptionistInquiries"
            element={<ProtectedRoute allowedRoles={['receptionist']}><RecepInquiries /></ProtectedRoute>}
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
