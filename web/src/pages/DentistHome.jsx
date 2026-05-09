import { useAuth } from '../auth/AuthContext';

export default function DentistHome() {
  const { user, logout } = useAuth();
  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={{ margin: 0 }}>Dentist Dashboard</h1>
        <button onClick={logout} style={logoutStyle}>Sign out</button>
      </header>
      <main style={mainStyle}>
        <p>Welcome, <strong>{user?.name}</strong>.</p>
        <p>Role: {user?.role}</p>
        <p>Branches you can access: {user?.branches?.join(', ')}</p>
        <p style={{ color: '#718096', marginTop: '24px' }}>
          Day 2: today's appointments and patient list go here. Day 3: dental chart.
        </p>
      </main>
    </div>
  );
}

const pageStyle = { fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f4f6f8' };
const headerStyle = {
  background: '#2c7a7b', color: '#fff', padding: '16px 24px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const mainStyle = { padding: '24px', maxWidth: '720px' };
const logoutStyle = {
  background: 'transparent', color: '#fff', border: '1px solid #fff',
  padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
};