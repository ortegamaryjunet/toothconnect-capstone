import { useState, useEffect } from 'react';
import { getTreatmentsByPatient, getConditions } from '../api/treatments';
import { listAppointments } from '../api/appointments';
import { getPatientProfile } from '../api/patients';
import styles from '../styles/DentistPatientProfile';
import DentalChart from '../components/DentalChart';
import ToothPanel from '../components/ToothPanel';

export default function DentistPatientProfile({ patient, onBack }) {
  const [profile, setProfile] = useState(null);
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
      const [tData, conds, patientAppts, profileData] = await Promise.all([
        getTreatmentsByPatient(patient.id),
        getConditions(),
        listAppointments({ patient_id: patient.id }),
        getPatientProfile(patient.id),
      ]);
      setTreatments(tData.by_tooth || {});
      setConditions(conds);
      setAppointments(patientAppts);
      setProfile(profileData);
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

  const displayProfile = profile || {};
  const displayName = displayProfile.full_name || patient.name;
  const displayEmail = displayProfile.email || patient.email;
  const totalAppointments = displayProfile.total_appointments ?? patient.total_appointments;

  function displayValue(value) {
    return value || 'Not provided';
  }

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>Back to patients</button>

      <div style={styles.profileCard}>
        <div style={styles.profileInitial}>{initials(displayName)}</div>
        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{displayName}</h2>
          <div style={styles.profileMeta}>
            {displayEmail} | {totalAppointments} appointment{totalAppointments !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {loading && <div style={styles.loading}>Loading dental chart...</div>}

      {!loading && (
        <>
          <div style={styles.detailsCard}>
            <h3 style={styles.sectionTitle}>Patient information</h3>
            <div style={styles.detailsGrid}>
              <InfoItem label="Contact" value={displayValue(displayProfile.contact_number || patient.phone)} />
              <InfoItem label="Address" value={displayValue(displayProfile.address)} />
              <InfoItem label="Birthday" value={displayValue(displayProfile.birthday)} />
              <InfoItem label="Age" value={displayValue(displayProfile.age)} />
              <InfoItem label="Sex" value={displayValue(displayProfile.sex)} />
              <InfoItem label="Civil status" value={displayValue(displayProfile.civil_status)} />
              <InfoItem label="Nationality" value={displayValue(displayProfile.nationality)} />
              <InfoItem label="Occupation" value={displayValue(displayProfile.occupation)} />
              <InfoItem label="Emergency contact" value={displayValue(displayProfile.emergency_contact_name)} />
              <InfoItem label="Emergency number" value={displayValue(displayProfile.emergency_contact_number)} />
            </div>

            <div style={styles.notesGrid}>
              <InfoItem label="Medical conditions" value={displayValue(displayProfile.medical_conditions)} />
              <InfoItem label="Allergies" value={displayValue(displayProfile.allergies)} />
              <InfoItem label="Medications" value={displayValue(displayProfile.medications)} />
              <InfoItem label="Dental history" value={displayValue(displayProfile.dental_history)} />
            </div>
          </div>
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

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  );
}
