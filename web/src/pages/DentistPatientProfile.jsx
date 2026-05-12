import { useState, useEffect } from 'react';
import { getTreatmentsByPatient, getConditions } from '../api/treatments';
import { listAppointments } from '../api/appointments';
import styles from '../styles/DentistPatientProfile';
import DentalChart from '../components/DentalChart';
import ToothPanel from '../components/ToothPanel';
import RiskPanel from '../components/RiskPanel';

export default function DentistPatientProfile({ patient, onBack }) {
  const [treatments, setTreatments] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, [patient.id]);

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [tData, conds, allAppts] = await Promise.all([
        getTreatmentsByPatient(patient.id),
        getConditions(),
        listAppointments(),
      ]);
      setTreatments(tData.by_tooth || {});
      setConditions(conds);
      setAppointments(allAppts.filter(a => a.patient_id === patient.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient data');
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

  async function handleTreatmentCreated() {
    await loadAll();
  }

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>← Back to patients</button>

      <div style={styles.profileCard}>
        <div style={styles.profileInitial}>{initials(patient.name)}</div>
        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{patient.name}</h2>
          <div style={styles.profileMeta}>
            {patient.email} · {patient.total_appointments} appointment{patient.total_appointments !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.loading}>Loading dental chart...</div>}

      {!loading && (
        <>
          <RiskPanel patientId={patient.id} />

          <div style={styles.layout}>
            <div style={styles.chartCard}>
              <h3 style={styles.sectionTitle}>Dental chart</h3>
              <div style={styles.sectionSubtitle}>FDI notation. Click a tooth to view or add treatments.</div>
              <DentalChart
                treatmentsByTooth={treatments}
                conditions={conditions}
                selectedTooth={selectedTooth}
                onSelectTooth={setSelectedTooth}
              />

              <div style={styles.legend}>
                {conditions.map((c) => (
                  <div key={c.code} style={styles.legendItem}>
                    <span style={{ ...styles.legendSwatch, backgroundColor: c.color }} />
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.sidePanel}>
              {selectedTooth ? (
                <ToothPanel
                  toothNumber={selectedTooth}
                  treatments={treatments[selectedTooth] || []}
                  conditions={conditions}
                  appointments={appointments}
                  onChange={handleTreatmentCreated}
                />
              ) : (
                <div style={styles.sidePanelEmpty}>Click a tooth to see its history and add a treatment.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}