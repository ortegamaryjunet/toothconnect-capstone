import { useState } from 'react';
import { createTreatment, deleteTreatment } from '../api/treatments';
import { formatDateOnly } from '../utils/datetime';
import styles from '../styles/ToothPanel';

export default function ToothPanel({
  toothNumber,
  treatments,
  conditions,
  appointments,
  onChange,
}) {
  const [conditionType, setConditionType] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const completedAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'scheduled');

  async function handleSubmit() {
    setError('');
    if (!conditionType) { setError('Please pick a condition'); return; }
    if (!appointmentId) { setError('Please pick an appointment'); return; }

    setSubmitting(true);
    try {
      await createTreatment({
        appointment_id: parseInt(appointmentId, 10),
        tooth_number: toothNumber,
        condition_type: conditionType,
        notes: notes.trim() || null,
      });
      setConditionType('');
      setAppointmentId('');
      setNotes('');
      onChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add treatment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this treatment record? This cannot be undone.')) return;
    try {
      await deleteTreatment(id);
      onChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <div>
      <div style={styles.panelHeader}>
        <div style={styles.toothNumber}>#{toothNumber}</div>
        <div style={styles.toothLabel}>FDI</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>History</div>
        {!treatments || treatments.length === 0 ? (
          <div style={styles.historyEmpty}>No treatments on this tooth yet.</div>
        ) : (
          treatments.map((t) => {
            const cond = conditions.find(c => c.code === t.condition_type);
            return (
              <div
                key={t.id}
                style={{ ...styles.historyItem, borderLeftColor: cond ? cond.color : '#cbd5e0' }}
              >
                <div style={styles.historyTopRow}>
                  <div style={styles.historyCondition}>{cond ? cond.label : t.condition_type}</div>
                  <div style={styles.historyDate}>{formatDateOnly(t.appointment_date)}</div>
                </div>
                <div style={styles.historyMeta}>
                  {t.dentist_name} · {t.service_name}
                </div>
                {t.notes && <div style={styles.historyNotes}>"{t.notes}"</div>}
                <button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}>Delete</button>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Add treatment</div>

        {completedAppointments.length === 0 ? (
          <div style={styles.noAppointments}>
            No appointments to attach a treatment to. Treatments must be linked to an appointment with this patient.
          </div>
        ) : (
          <div style={styles.form}>
            <div>
              <div style={styles.label}>Condition</div>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Pick a condition --</option>
                {conditions.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={styles.label}>Appointment</div>
              <select
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Pick an appointment --</option>
                {completedAppointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {formatDateOnly(a.start_time)} · {a.service_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={styles.label}>Notes (optional)</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Distal surface caries, recommend filling next visit"
                style={styles.textarea}
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ ...styles.submitBtn, ...(submitting ? styles.submitBtnDisabled : {}) }}
            >
              {submitting ? 'Saving...' : 'Add treatment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}