import { useEffect, useState } from 'react';
import { listMyPatients } from '../api/patients';
import { formatDateOnly } from '../utils/datetime';
import styles from '../styles/DentistPatients';

export default function DentistPatients({ onPickPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const data = await listMyPatients();
      setPatients(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageTitle}>Patients</div>
      <div style={styles.pageSubtitle}>
        Patients you've seen in appointments. Click to view their dental chart.
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.loading}>Loading...</div>}

      {!loading && patients.length === 0 && (
        <div style={styles.empty}>No patients yet. Once you have appointments, patients appear here.</div>
      )}

      <div style={styles.list}>
        {patients.map((p) => (
          <div
            key={p.id}
            style={styles.card}
            onClick={() => onPickPatient(p)}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div style={styles.cardInitial}>{initials(p.name)}</div>
            <div style={styles.cardInfo}>
              <div style={styles.cardName}>{p.name}</div>
              <div style={styles.cardMeta}>{p.email}</div>
            </div>
            <div>
              <div style={styles.cardStat}>{formatDateOnly(p.last_visit)}</div>
              <div style={styles.cardStatLabel}>Last visit</div>
            </div>
            <div>
              <div style={styles.cardStat}>{p.total_appointments}</div>
              <div style={styles.cardStatLabel}>{p.total_appointments === 1 ? 'Visit' : 'Visits'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}