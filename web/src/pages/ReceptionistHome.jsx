import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { listAppointments, cancelAppointment } from '../api/appointments';
import { formatTimeOnly, formatDateOnly, todayBoundsUTC, nextNDaysBoundsUTC } from '../utils/datetime';
import styles from '../styles/ReceptionistHome';
import ReceptionistMessages from './ReceptionistMessages';

export default function ReceptionistHome() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('appointments');

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Receptionist Dashboard</h1>
        <div>
          <span style={styles.headerUserLabel}>{user?.name}</span>
          <button onClick={logout} style={styles.logout}>Sign out</button>
        </div>
      </header>

      <nav style={styles.topNav}>
        <button
          onClick={() => setTab('appointments')}
          style={{ ...styles.topNavTab, ...(tab === 'appointments' ? styles.topNavTabActive : {}) }}
        >
          Appointments
        </button>
        <button
          onClick={() => setTab('messages')}
          style={{ ...styles.topNavTab, ...(tab === 'messages' ? styles.topNavTabActive : {}) }}
        >
          Messages
        </button>
      </nav>

      {tab === 'appointments' && <AppointmentsView />}
      {tab === 'messages' && <ReceptionistMessages />}
    </div>
  );
}

function AppointmentsView() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('today');

  useEffect(() => {
    fetchAppointments();
  }, [view]);

  async function fetchAppointments() {
    setLoading(true);
    setError('');
    try {
      const bounds = view === 'today' ? todayBoundsUTC() : nextNDaysBoundsUTC(30);
      const data = await listAppointments({ from: bounds.fromUTC, to: bounds.toUTC });
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  }

  const grouped = groupByDay(appointments);

  return (
    <main style={styles.main}>
      <div style={styles.controls}>
        <div>
          <button
            onClick={() => setView('today')}
            style={{ ...styles.tabBase, ...(view === 'today' ? styles.tabActive : styles.tabInactive) }}
          >
            Today
          </button>
          <button
            onClick={() => setView('week')}
            style={{ ...styles.tabBase, ...(view === 'week' ? styles.tabActive : styles.tabInactive) }}
          >
            Next 30 days
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.loading}>Loading appointments...</div>}

      {!loading && appointments.length === 0 && (
        <div style={styles.empty}>No appointments in this range.</div>
      )}

      {!loading && Object.entries(grouped).map(([day, dayAppts]) => (
        <section key={day} style={styles.daySection}>
          <h3 style={styles.dayHeader}>{formatDateOnly(dayAppts[0].start_time)}</h3>
          <div style={styles.list}>
            {dayAppts.map((a) => (
              <div key={a.id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <div style={styles.time}>{formatTimeOnly(a.start_time)}</div>
                  <div style={styles.branchTag}>{a.branch_name}</div>
                </div>
                <div style={styles.cardMiddle}>
                  <div style={styles.patientName}>{a.patient_name}</div>
                  <div style={styles.detail}>
                    {a.service_name} · {a.duration_min} min · with {a.dentist_name}
                  </div>
                  <div style={styles.statusRow}>
                    <span style={statusBadgeStyle(a.status)}>{a.status}</span>
                  </div>
                </div>
                <div style={styles.cardRight}>
                  {a.status === 'scheduled' && (
                    <button onClick={() => handleCancel(a.id)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function groupByDay(appointments) {
  const groups = {};
  for (const a of appointments) {
    const key = a.start_time.slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  return groups;
}

function statusBadgeStyle(status) {
  const colors = {
    scheduled: { bg: '#bee3f8', fg: '#2c5282' },
    completed: { bg: '#c6f6d5', fg: '#276749' },
    cancelled: { bg: '#fed7d7', fg: '#9b2c2c' },
    no_show: { bg: '#feebc8', fg: '#9c4221' },
  };
  const c = colors[status] || { bg: '#e2e8f0', fg: '#4a5568' };
  return {
    display: 'inline-block', padding: '2px 8px', borderRadius: '999px',
    background: c.bg, color: c.fg, fontSize: '11px', fontWeight: '500',
  };
}