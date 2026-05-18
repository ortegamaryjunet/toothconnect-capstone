import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  getTreatmentPlansByPatient,
  createTreatmentPlan,
  createTreatmentPlansBulk,
  updateTreatmentPlan,
  deleteTreatmentPlan,
} from '../api/treatmentPlans';
import createStyles from '../styles/DentistTreatmentPlan';

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const ALL_TEETH = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT];

const STATUS_OPTIONS = [
  { value: 'planned',     label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

function emptyForm(toothNumber) {
  return {
    tooth_number: toothNumber || '',
    planned_treatment: '',
    status: 'planned',
    notes: '',
    date_completed: '',
    applyToAll: false,
  };
}

export default function TreatmentPlan({ patientId, isMobile = false }) {
  const { user } = useAuth();
  const styles = createStyles({ isMobile });

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyForm(null));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPlan, setViewPlan] = useState(null);

  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [choiceTooth, setChoiceTooth] = useState(null);
  const [highlightedTooth, setHighlightedTooth] = useState(null);

  useEffect(() => {
    if (patientId) loadPlans();
  }, [patientId]);

  async function loadPlans() {
    setLoading(true);
    setError('');
    try {
      const data = await getTreatmentPlansByPatient(patientId);
      setPlans(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load treatment plans');
    } finally {
      setLoading(false);
    }
  }

  function planForTooth(toothNumber) {
    return plans.find(p => p.tooth_number === toothNumber);
  }

  function toothHasPlan(toothNumber) {
    return plans.some(p => p.tooth_number === toothNumber);
  }

  function openAddModal(toothNumber) {
    const existing = planForTooth(toothNumber);
    if (existing) {
      setChoiceTooth(toothNumber);
      setChoiceModalOpen(true);
    } else {
      setEditingPlan(null);
      setForm(emptyForm(toothNumber));
      setFormError('');
      setModalOpen(true);
    }
  }

  function handleChoiceAddNew() {
    setChoiceModalOpen(false);
    setEditingPlan(null);
    setForm(emptyForm(choiceTooth));
    setFormError('');
    setModalOpen(true);
  }

  function handleChoiceView() {
    setChoiceModalOpen(false);
    const plan = planForTooth(choiceTooth);
    if (!plan) return;
    setHighlightedTooth(plan.tooth_number);
    setTimeout(() => {
      const el = document.getElementById(`plan-row-${plan.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    setTimeout(() => setHighlightedTooth(null), 3000);
  }

  function openBracesModal() {
    setEditingPlan(null);
    setForm({ ...emptyForm(null), applyToAll: true });
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(plan) {
    setEditingPlan(plan);
    setForm({
      tooth_number: plan.tooth_number,
      planned_treatment: plan.planned_treatment || '',
      status: plan.status || 'planned',
      notes: plan.notes || '',
      date_completed: plan.date_completed ? plan.date_completed.slice(0, 10) : '',
      applyToAll: false,
    });
    setFormError('');
    setModalOpen(true);
  }

  function openViewModal(plan) {
    setViewPlan(plan);
    setViewModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPlan(null);
    setFormError('');
  }

  function closeViewModal() {
    setViewModalOpen(false);
    setViewPlan(null);
  }

  function handleFormChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setFormError('');
    if (!form.planned_treatment.trim()) {
      setFormError('Planned treatment is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingPlan) {
        await updateTreatmentPlan(editingPlan.id, {
          planned_treatment: form.planned_treatment.trim(),
          status: form.status,
          notes: form.notes.trim() || null,
          date_completed: form.date_completed || null,
        });
      } else if (form.applyToAll) {
        const existingTeeth = new Set(plans.map(p => p.tooth_number));
        const teethToAdd = ALL_TEETH.filter(t => !existingTeeth.has(t));
        if (teethToAdd.length === 0) {
          setFormError('All teeth already have treatment plans.');
          setSaving(false);
          return;
        }
        await createTreatmentPlansBulk({
          patient_id: parseInt(patientId, 10),
          tooth_numbers: teethToAdd,
          planned_treatment: form.planned_treatment.trim(),
          status: form.status,
          notes: form.notes.trim() || null,
          date_completed: form.date_completed || null,
        });
      } else {
        await createTreatmentPlan({
          patient_id: parseInt(patientId, 10),
          tooth_number: parseInt(form.tooth_number, 10),
          planned_treatment: form.planned_treatment.trim(),
          status: form.status,
          notes: form.notes.trim() || null,
          date_completed: form.date_completed || null,
        });
      }
      closeModal();
      await loadPlans();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFromView(id) {
    if (!window.confirm('Delete this treatment plan? This cannot be undone.')) return;
    closeViewModal();
    try {
      await deleteTreatmentPlan(id);
      await loadPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete plan');
    }
  }

  const canEdit = user?.role === 'dentist';

  if (!patientId) {
    return <div style={styles.empty}>No patient selected.</div>;
  }

  const modalTitle = editingPlan
    ? `Edit Plan — Tooth #${form.tooth_number}`
    : form.applyToAll
      ? 'Add Plan — All Teeth (Braces / Aligners)'
      : `Add Plan — Tooth #${form.tooth_number}`;

  return (
    <div style={styles.wrapper}>
      {/* Dental Chart Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Dental Chart</h3>
        <div style={styles.chartSubtitle}>
          FDI notation · {canEdit ? 'Click a tooth to add or edit a plan' : 'Click a tooth to view its plan'}
        </div>

        <div style={styles.chartBox}>
          {/* Upper arch */}
          <div style={styles.arch}>
            <div style={styles.archLabel}>R</div>
            {UPPER_RIGHT.map(n => (
              <ToothButton
                key={n}
                num={n}
                isUpper
                hasPlan={toothHasPlan(n)}
                styles={styles}
                onClick={() => canEdit ? openAddModal(n) : openViewModal(planForTooth(n))}
              />
            ))}
            <div style={styles.midline} />
            {UPPER_LEFT.map(n => (
              <ToothButton
                key={n}
                num={n}
                isUpper
                hasPlan={toothHasPlan(n)}
                styles={styles}
                onClick={() => canEdit ? openAddModal(n) : openViewModal(planForTooth(n))}
              />
            ))}
            <div style={styles.archLabelRight}>L</div>
          </div>

          <div style={styles.archGap} />

          {/* Lower arch */}
          <div style={styles.arch}>
            <div style={styles.archLabel}>R</div>
            {LOWER_RIGHT.map(n => (
              <ToothButton
                key={n}
                num={n}
                isUpper={false}
                hasPlan={toothHasPlan(n)}
                styles={styles}
                onClick={() => canEdit ? openAddModal(n) : openViewModal(planForTooth(n))}
              />
            ))}
            <div style={styles.midline} />
            {LOWER_LEFT.map(n => (
              <ToothButton
                key={n}
                num={n}
                isUpper={false}
                hasPlan={toothHasPlan(n)}
                styles={styles}
                onClick={() => canEdit ? openAddModal(n) : openViewModal(planForTooth(n))}
              />
            ))}
            <div style={styles.archLabelRight}>L</div>
          </div>
        </div>

        <div style={styles.legend}>
          <span style={styles.legendDot} />
          <span style={styles.legendText}>Tooth has a plan</span>
        </div>
      </div>

      {/* Treatment Plan Table Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={{ ...styles.cardTitle, margin: 0 }}>Treatment Plan</h3>
          {canEdit && (
            <button style={styles.bracesBtn} onClick={openBracesModal}>
              + All Teeth
            </button>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {loading && <div style={styles.loadingBox}>Loading...</div>}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tooth</th>
                <th style={styles.th}>Planned Treatment</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Notes</th>
                <th style={styles.th}>Date Completed</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && plans.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.emptyRow}>
                    No treatment plans yet.{canEdit ? ' Click a tooth to add one.' : ''}
                  </td>
                </tr>
              ) : (
                plans.map(plan => (
                  <tr
                    key={plan.id}
                    id={`plan-row-${plan.id}`}
                    style={{
                      ...styles.tableRow,
                      ...(highlightedTooth === plan.tooth_number ? styles.tableRowHighlighted : {}),
                    }}
                  >
                    <td style={styles.td}>#{plan.tooth_number}</td>
                    <td style={styles.td}>{plan.planned_treatment}</td>
                    <td style={styles.td}>
                      <StatusBadge status={plan.status} styles={styles} />
                    </td>
                    <td style={styles.td}>{plan.notes || '—'}</td>
                    <td style={styles.td}>
                      {plan.date_completed ? plan.date_completed.slice(0, 10) : '—'}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => openViewModal(plan)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tooth Choice Modal */}
      {choiceModalOpen && (
        <div style={styles.overlay} onClick={() => setChoiceModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeIconBtn} onClick={() => setChoiceModalOpen(false)}>✕</button>
            <h3 style={styles.modalTitle}>Tooth #{choiceTooth}</h3>
            <p style={{ fontSize: 14, color: '#374151', marginBottom: 20, margin: '0 0 20px', fontFamily: 'Arial, sans-serif' }}>
              This tooth already has a treatment plan. What would you like to do?
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={handleChoiceAddNew}>
                Add New Plan
              </button>
              <button style={styles.saveBtn} onClick={handleChoiceView}>
                View Existing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeIconBtn} onClick={closeModal}>✕</button>
            <h3 style={styles.modalTitle}>{modalTitle}</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tooth</label>
              <input
                style={{ ...styles.input, background: '#f1f5f9', color: '#64748b' }}
                value={
                  form.applyToAll
                    ? 'All Teeth (Braces / Aligners)'
                    : form.tooth_number
                      ? `#${form.tooth_number}`
                      : ''
                }
                readOnly
              />
            </div>

            {!editingPlan && (
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.applyToAll}
                    onChange={e => handleFormChange('applyToAll', e.target.checked)}
                    style={styles.checkbox}
                  />
                  Apply to all teeth (braces, aligners, etc.)
                </label>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Planned Treatment <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                value={form.planned_treatment}
                onChange={e => handleFormChange('planned_treatment', e.target.value)}
                placeholder="e.g. Braces, Root Canal, Filling, Crown..."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                style={styles.select}
                value={form.status}
                onChange={e => handleFormChange('status', e.target.value)}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={styles.textarea}
                value={form.notes}
                onChange={e => handleFormChange('notes', e.target.value)}
                placeholder="Optional clinical notes..."
                rows={3}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date Completed</label>
              <input
                type="date"
                style={styles.input}
                value={form.date_completed}
                onChange={e => handleFormChange('date_completed', e.target.value)}
              />
            </div>

            {formError && <div style={styles.formError}>{formError}</div>}

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button
                style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingPlan
                    ? 'Save Changes'
                    : form.applyToAll
                      ? 'Add for All Teeth'
                      : 'Add Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && viewPlan && (
        <div style={styles.overlay} onClick={closeViewModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeIconBtn} onClick={closeViewModal}>✕</button>
            <h3 style={styles.modalTitle}>Treatment Plan — Tooth #{viewPlan.tooth_number}</h3>

            <div style={styles.viewRow}>
              <span style={styles.viewLabel}>Planned Treatment</span>
              <span style={styles.viewValue}>{viewPlan.planned_treatment}</span>
            </div>
            <div style={styles.viewRow}>
              <span style={styles.viewLabel}>Status</span>
              <StatusBadge status={viewPlan.status} styles={styles} />
            </div>
            <div style={styles.viewRow}>
              <span style={styles.viewLabel}>Notes</span>
              <span style={styles.viewValue}>{viewPlan.notes || '—'}</span>
            </div>
            <div style={styles.viewRow}>
              <span style={styles.viewLabel}>Date Completed</span>
              <span style={styles.viewValue}>
                {viewPlan.date_completed ? viewPlan.date_completed.slice(0, 10) : '—'}
              </span>
            </div>
            <div style={styles.viewRow}>
              <span style={styles.viewLabel}>Added by</span>
              <span style={styles.viewValue}>{viewPlan.dentist_name || '—'}</span>
            </div>

            {canEdit && (
              <div style={styles.modalActions}>
                <button
                  style={styles.editBtn}
                  onClick={() => { closeViewModal(); openEditModal(viewPlan); }}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteFromView(viewPlan.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToothButton({ num, isUpper, hasPlan, styles, onClick }) {
  return (
    <div style={styles.toothWrap} onClick={onClick}>
      {isUpper && <div style={styles.toothNum}>{num}</div>}
      <div style={{ ...styles.toothBox, ...(hasPlan ? styles.toothBoxPlanned : {}) }} title={`Tooth ${num}`} />
      {!isUpper && <div style={styles.toothNum}>{num}</div>}
    </div>
  );
}

function StatusBadge({ status, styles }) {
  const styleMap = {
    planned:     styles.statusPlanned,
    in_progress: styles.statusInProgress,
    completed:   styles.statusCompleted,
  };
  const labelMap = {
    planned:     'Planned',
    in_progress: 'In Progress',
    completed:   'Completed',
  };
  return (
    <span style={{ ...styles.statusBadge, ...(styleMap[status] || styles.statusPlanned) }}>
      {labelMap[status] || status}
    </span>
  );
}
