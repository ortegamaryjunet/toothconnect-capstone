import { useEffect, useState } from 'react';
import { getLatestAssessment, getFactorsFull, verifyAssessment } from '../api/riskAssessments';
import { formatDateOnly } from '../utils/datetime';
import styles from '../styles/RiskPanel';

const CATEGORY_LABELS = {
  disease_indicators: 'Disease indicators',
  risk_factors: 'Risk factors',
  protective_factors: 'Protective factors',
};

function levelStyle(level) {
  return {
    low: styles.versionLevelLow,
    moderate: styles.versionLevelModerate,
    high: styles.versionLevelHigh,
  }[level];
}

export default function RiskPanel({ patientId }) {
  const [patientLatest, setPatientLatest] = useState(null);
  const [dentistLatest, setDentistLatest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [factors, setFactors] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLatest();
  }, [patientId]);

  async function loadLatest() {
    try {
      const [p, d] = await Promise.all([
        getLatestAssessment(patientId, 'patient'),
        getLatestAssessment(patientId, 'dentist'),
      ]);
      setPatientLatest(p);
      setDentistLatest(d);
    } catch (err) {
      // patient may have no assessments yet — leave nulls
    }
  }

  async function openModal() {
    try {
      const allFactors = await getFactorsFull();
      setFactors(allFactors);

      const startingCodes = patientLatest?.factor_codes || [];
      setSelected(new Set(startingCodes));
      setError('');
      setModalOpen(true);
    } catch (err) {
      alert('Failed to load factor list');
    }
  }

  function toggle(code) {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelected(next);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await verifyAssessment({
        patient_id: patientId,
        related_assessment_id: patientLatest?.id || null,
        factor_codes: Array.from(selected),
      });
      setModalOpen(false);
      await loadLatest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save verification');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Caries risk assessment (CAMBRA)</h3>
      <div style={styles.subtitle}>
        Patient self-assessment alongside your clinical verification.
      </div>

      <div style={styles.twoCol}>
        <div style={styles.versionCard}>
          <div style={styles.versionLabel}>Patient self-assessment</div>
          {patientLatest ? (
            <>
              <div style={{ ...styles.versionLevel, ...levelStyle(patientLatest.risk_level) }}>
                {patientLatest.risk_level}
              </div>
              <div style={styles.versionScore}>Score: {patientLatest.score}</div>
              <div style={styles.versionMeta}>
                {formatDateOnly(patientLatest.assessed_at)}
              </div>
            </>
          ) : (
            <div style={styles.empty}>Not yet submitted</div>
          )}
        </div>

        <div style={styles.versionCard}>
          <div style={styles.versionLabel}>Your verification</div>
          {dentistLatest ? (
            <>
              <div style={{ ...styles.versionLevel, ...levelStyle(dentistLatest.risk_level) }}>
                {dentistLatest.risk_level}
              </div>
              <div style={styles.versionScore}>Score: {dentistLatest.score}</div>
              <div style={styles.versionMeta}>
                {formatDateOnly(dentistLatest.assessed_at)} · by {dentistLatest.assessor_name}
              </div>
            </>
          ) : (
            <div style={styles.empty}>Not yet verified</div>
          )}
        </div>
      </div>

      <button onClick={openModal} style={styles.verifyBtn}>
        {dentistLatest ? 'Update verification' : 'Verify and adjust'}
      </button>

      {modalOpen && factors && (
        <div style={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Verify CAMBRA assessment</h3>
            <div style={styles.modalSubtitle}>
              Starting from the patient's self-assessment. Toggle clinical observations
              {' '}(highlighted) based on your examination. Save creates a verified record.
            </div>

            {Object.entries(factors).map(([category, items]) => (
              <div key={category}>
                <div style={styles.categoryLabel}>{CATEGORY_LABELS[category]}</div>
                {items.map(f => {
                  const isSelected = selected.has(f.code);
                  const isClinician = f.clinician_only;
                  const rowStyle = isClinician
                    ? (isSelected ? styles.factorRowClinicianSelected : styles.factorRowClinician)
                    : (isSelected ? styles.factorRowSelected : {});
                  return (
                    <div
                      key={f.code}
                      style={{ ...styles.factorRow, ...rowStyle }}
                      onClick={() => toggle(f.code)}
                    >
                      <div
                        style={{
                          ...styles.factorCheckbox,
                          ...(isSelected ? styles.factorCheckboxSelected : {}),
                        }}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                      <div style={styles.factorLabel}>{f.label}</div>
                      {isClinician && (
                        <span style={styles.factorClinicianTag}>Clinical</span>
                      )}
                      <div
                        style={{
                          ...styles.factorWeight,
                          ...(f.weight < 0 ? styles.factorWeightProtective : styles.factorWeightRisk),
                        }}
                      >
                        {f.weight > 0 ? `+${f.weight}` : f.weight}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.actions}>
              <button onClick={() => setModalOpen(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
              >
                {saving ? 'Saving...' : 'Save verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}