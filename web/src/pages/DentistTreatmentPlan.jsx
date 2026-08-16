import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../auth/AuthContext';
import {
  getTreatmentPlansByPatient,
  createTreatmentPlan,
  createTreatmentPlansBulk,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  getTreatmentPlanAttachments,
  uploadTreatmentPlanAttachments,
  deleteTreatmentPlanAttachment,
} from '../api/treatmentPlans';
import api from '../api/axios';
import createStyles from '../styles/DentistTreatmentPlan';

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

const ALL_TEETH = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT];
const PLAN_ROWS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'planned',     label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
];

const TREATMENT_OPTIONS = [
  'Braces',
  'Root Canal',
  'Filling',
  'Crown',
  'Extraction',
  'Cleaning',
  'Dentures',
  'Other',
];

function emptyForm(toothNumber) {
  return {
    tooth_number: toothNumber || '',
    planned_treatment: '',
    planned_treatment_option: '',
    other_treatment: '',
    status: 'planned',
    notes: '',
    date_completed: '',
    applyToAll: false,
  };
}

export default function TreatmentPlan({ patientId, isMobile = false }) {
  const { user } = useAuth();
  const styles = createStyles({ isMobile });
  const uploadInputRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(emptyForm(null));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPlan, setViewPlan] = useState(null);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentPlan, setAttachmentPlan] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [deleteAttachment, setDeleteAttachment] = useState(null);
  const [planDeleteTarget, setPlanDeleteTarget] = useState(null);
  const [editConfirmPlan, setEditConfirmPlan] = useState(null);
  const [saveEditConfirmOpen, setSaveEditConfirmOpen] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(null);

  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [choiceTooth, setChoiceTooth] = useState(null);
  const [highlightedTooth, setHighlightedTooth] = useState(null);
  const [planPage, setPlanPage] = useState(1);

  useEffect(() => {
    if (patientId) loadPlans();
  }, [patientId]);

  useEffect(() => {
    setPlanPage(1);
  }, [patientId, plans.length]);

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
      planned_treatment_option: TREATMENT_OPTIONS.includes(plan.planned_treatment)
        ? plan.planned_treatment
        : 'Other',
      other_treatment: TREATMENT_OPTIONS.includes(plan.planned_treatment)
        ? ''
        : plan.planned_treatment || '',
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
    setFieldErrors({});
    setSaveEditConfirmOpen(false);
  }

  function closeViewModal() {
    setViewModalOpen(false);
    setViewPlan(null);
  }

  function requestCloseViewModal() {
    if (!viewPlan) {
      closeViewModal();
      return;
    }

    setCloseConfirm({
      title: 'Close Treatment Plan',
      message: `Close this treatment plan for tooth #${viewPlan.tooth_number}?`,
      onConfirm: closeViewModal,
    });
  }

  async function openAttachmentModal(plan) {
    setAttachmentPlan(plan);
    setAttachments(plan.attachments || []);
    setAttachmentError('');
    setAttachmentModalOpen(true);
    setAttachmentsLoading(true);
    try {
      const data = await getTreatmentPlanAttachments(plan.id);
      setAttachments(data);
      setPlans(prev => prev.map(item => (
        item.id === plan.id
          ? { ...item, attachments: data, attachment_count: data.length }
          : item
      )));
    } catch (err) {
      setAttachmentError(err.response?.data?.message || 'Failed to load attachments');
    } finally {
      setAttachmentsLoading(false);
    }
  }

  function closeAttachmentModal() {
    setAttachmentModalOpen(false);
    setAttachmentPlan(null);
    setAttachments([]);
    setAttachmentError('');
    setDeleteAttachment(null);
  }

  function requestCloseModal() {
    setCloseConfirm({
      title: 'Close Treatment Plan',
      message: form.tooth_number
        ? `Close this treatment plan for tooth #${form.tooth_number}?`
        : 'Close this treatment plan?',
      onConfirm: closeModal,
    });
  }

  function requestCloseAttachmentModal() {
    setCloseConfirm({
      title: 'Close Attachments',
      message: attachmentPlan
        ? `Close attachments for tooth #${attachmentPlan.tooth_number}?`
        : 'Close attachments?',
      onConfirm: closeAttachmentModal,
    });
  }

  async function handleAttachmentFiles(files) {
    if (!canEdit || !attachmentPlan || !files || files.length === 0) return;

    setUploadingAttachments(true);
    setAttachmentError('');
    try {
      const data = await uploadTreatmentPlanAttachments(attachmentPlan.id, files);
      setAttachments(data);
      setPlans(prev => prev.map(item => (
        item.id === attachmentPlan.id
          ? { ...item, attachments: data, attachment_count: data.length }
          : item
      )));
    } catch (err) {
      setAttachmentError(err.response?.data?.message || 'Failed to upload attachments');
    } finally {
      setUploadingAttachments(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
    }
  }

  async function confirmDeleteAttachment() {
    if (!deleteAttachment) return;

    try {
      await deleteTreatmentPlanAttachment(deleteAttachment.id);
      const nextAttachments = attachments.filter(item => item.id !== deleteAttachment.id);
      setAttachments(nextAttachments);
      setPlans(prev => prev.map(item => (
        item.id === attachmentPlan.id
          ? { ...item, attachments: nextAttachments, attachment_count: nextAttachments.length }
          : item
      )));
      setDeleteAttachment(null);
    } catch (err) {
      setAttachmentError(err.response?.data?.message || 'Failed to delete attachment');
    }
  }

  function handleFormChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError('');
  }

  async function handleSave() {
    setFormError('');

    const errors = {};

    if (!form.planned_treatment_option) {
      errors.planned_treatment = 'Please select a planned treatment.';
    } else if (form.planned_treatment_option === 'Other') {
      const otherTreatment = String(form.other_treatment || '').trim();

      if (!otherTreatment) {
        errors.other_treatment = 'Other treatment is required.';
      } else if (!/^[A-Za-z ]+$/.test(otherTreatment)) {
        errors.other_treatment =
          'Other treatment must contain letters and spaces only.';
      }
    }

    if (!form.applyToAll && !form.tooth_number) {
      errors.tooth_number = 'Tooth number is required.';
    }

    if (form.status === 'completed' && !form.date_completed) {
      errors.date_completed =
        'Date completed is required when status is Completed.';
    }

    if (form.date_completed) {
      const selectedDate = new Date(`${form.date_completed}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(selectedDate.getTime())) {
        errors.date_completed = 'Please enter a valid completion date.';
      } else if (selectedDate > today) {
        errors.date_completed = 'Date completed cannot be in the future.';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError('Please correct the highlighted fields before saving.');
      return;
    }

    if (editingPlan && !saveEditConfirmOpen) {
      setSaveEditConfirmOpen(true);
      return;
    }

    const plannedTreatment =
      form.planned_treatment_option === 'Other'
        ? String(form.other_treatment || '').trim()
        : String(form.planned_treatment_option || '').trim();

    setSaving(true);

    try {
      if (editingPlan) {
        await updateTreatmentPlan(editingPlan.id, {
          planned_treatment: plannedTreatment,
          status: form.status,
          notes: form.notes.trim() || null,
          date_completed: form.date_completed || null,
        });
      } else if (form.applyToAll) {
        const existingTeeth = new Set(plans.map(p => p.tooth_number));
        const teethToAdd = ALL_TEETH.filter(
          tooth => !existingTeeth.has(tooth)
        );

        if (teethToAdd.length === 0) {
          setFormError('All teeth already have treatment plans.');
          setSaving(false);
          return;
        }

        await createTreatmentPlansBulk({
          patient_id: parseInt(patientId, 10),
          tooth_numbers: teethToAdd,
          planned_treatment: plannedTreatment,
          status: form.status,
          notes: form.notes.trim() || null,
          date_completed: form.date_completed || null,
        });
      } else {
        await createTreatmentPlan({
          patient_id: parseInt(patientId, 10),
          tooth_number: parseInt(form.tooth_number, 10),
          planned_treatment: plannedTreatment,
          status: form.status,
          notes: form.notes.trim() || null,
          date_completed: form.date_completed || null,
        });
      }

      closeModal();
      await loadPlans();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to save plan'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFromView(id) {
    closeViewModal();
    try {
      await deleteTreatmentPlan(id);
      await loadPlans();
      setPlanDeleteTarget(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete plan');
    }
  }

  const canEdit = user?.role === 'dentist';
  const totalPlanPages = Math.max(1, Math.ceil(plans.length / PLAN_ROWS_PER_PAGE));
  const paginatedPlans = plans.slice(
    (planPage - 1) * PLAN_ROWS_PER_PAGE,
    planPage * PLAN_ROWS_PER_PAGE
  );

  if (!patientId) {
    return <div style={styles.empty}>No patient selected.</div>;
  }

  const modalTitle = editingPlan ? `Edit Plan — Tooth #${form.tooth_number}` : form.applyToAll ? 'Add Plan — All Teeth' : `Add Plan — Tooth #${form.tooth_number}`;

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
              Add All Teeth
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
                paginatedPlans.map(plan => (
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
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.viewBtn}
                          title="View treatment plan"
                          onClick={() => openViewModal(plan)}
                        >
                          <i className="fi fi-rr-eye"></i>
                          View
                        </button>
                        <button
                          type="button"
                          style={styles.attachmentBtn}
                          title="View attachments"
                          onClick={() => openAttachmentModal(plan)}
                        >
                          <i className="fi fi-rr-eye"></i>
                          Attachments
                          <span style={styles.attachmentCount}>
                            {plan.attachment_count || plan.attachments?.length || 0}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.pagination}>
          <button
            type="button"
            onClick={() => setPlanPage(prev => Math.max(1, prev - 1))}
            disabled={plans.length === 0 || planPage === 1}
            style={{
              ...styles.pageBtn,
              ...(plans.length === 0 || planPage === 1 ? styles.pageBtnDisabled : {}),
            }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            {plans.length === 0 ? 'Page 0 of 0' : `Page ${planPage} of ${totalPlanPages}`}
          </span>
          <button
            type="button"
            onClick={() => setPlanPage(prev => Math.min(totalPlanPages, prev + 1))}
            disabled={plans.length === 0 || planPage >= totalPlanPages}
            style={{
              ...styles.pageBtn,
              ...(plans.length === 0 || planPage >= totalPlanPages ? styles.pageBtnDisabled : {}),
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Tooth Choice Modal */}
      {choiceModalOpen && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.modal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Tooth #{choiceTooth}</h3>
            <p style={styles.mutedText}>
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
      ), document.body)}

      {/* Add / Edit Modal */}
      {modalOpen && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.modal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{modalTitle}</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tooth</label>
              <input
                style={{ ...styles.input, ...styles.readonlyInput }}
                value={
                  form.applyToAll
                    ? 'All Teeth'
                    : form.tooth_number
                      ? `#${form.tooth_number}`
                      : ''
                }
                readOnly
              />
              {fieldErrors.tooth_number && (
                <div style={{ ...styles.fieldError, color: "#dc2626" }}>{fieldErrors.tooth_number}</div>
              )}
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
                  Apply to all teeth
                </label>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Planned Treatment <span style={styles.required}>*</span>
              </label>
              <select
                style={{ ...styles.select, ...(fieldErrors.planned_treatment ? { borderColor: "#dc2626" } : {}) }}
                value={form.planned_treatment_option}
                onChange={e => {
                  const value = e.target.value;
                  handleFormChange('planned_treatment_option', value);
                  handleFormChange(
                    'planned_treatment',
                    value === 'Other' ? form.other_treatment : value
                  );
                  if (value !== 'Other') {
                    handleFormChange('other_treatment', '');
                  }
                }}
              >
                <option value="">Select planned treatment</option>
                {TREATMENT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {fieldErrors.planned_treatment && (
                <div style={{ ...styles.fieldError, color: "#dc2626" }}>{fieldErrors.planned_treatment}</div>
              )}

              {form.planned_treatment_option === 'Other' && (
                <div style={{ marginTop: 10 }}>
                  <input
                    style={{
                      ...styles.input,
                      ...(fieldErrors.other_treatment
                        ? {
                            borderColor: '#dc2626',
                            borderWidth: 1,
                            borderStyle: 'solid',
                          }
                        : {}),
                    }}
                    value={form.other_treatment}
                    onChange={e => {
                      const value = e.target.value;
                      const trimmedValue = value.trim();

                      setForm(prev => ({
                        ...prev,
                        other_treatment: value,
                        planned_treatment: value,
                      }));

                      setFieldErrors(prev => {
                        const next = { ...prev };

                        if (!trimmedValue) {
                          next.other_treatment = 'Other treatment is required.';
                        } else if (!/^[A-Za-z ]+$/.test(trimmedValue)) {
                          next.other_treatment =
                            'Other treatment must contain letters and spaces only.';
                        } else {
                          delete next.other_treatment;
                        }

                        return next;
                      });

                      setFormError('');
                    }}
                    placeholder="Enter other treatment"
                    maxLength={50}
                  />
                  {fieldErrors.other_treatment && (
                    <div
                      style={{
                        ...styles.fieldError,
                        color: '#dc2626',
                        marginTop: 6,
                      }}
                    >
                      {fieldErrors.other_treatment}
                    </div>
                  )}
                </div>
              )}
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
                style={{ ...styles.input, ...(fieldErrors.date_completed ? { borderColor: "#dc2626" } : {}) }}
                value={form.date_completed}
                onChange={e => handleFormChange('date_completed', e.target.value)}
              />
              {fieldErrors.date_completed && (
                <div style={{ ...styles.fieldError, color: "#dc2626" }}>{fieldErrors.date_completed}</div>
              )}
            </div>

            {formError && <div style={styles.formError}>{formError}</div>}

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={requestCloseModal} disabled={saving}>
                Cancel
              </button>
              <button
                style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : editingPlan ? 'Save Changes' : form.applyToAll
                      ? 'Add for All Teeth'
                      : 'Add Plan'}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {saveEditConfirmOpen && editingPlan && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }} onClick={() => setSaveEditConfirmOpen(false)}>
          <div style={{ ...styles.confirmModal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIconGold}>
              <i className="fi fi-rr-edit" style={styles.confirmIconText}></i>
            </div>
            <h3 style={styles.confirmTitle}>Confirm Changes</h3>
            <p style={styles.confirmText}>Please review the details before saving this treatment plan.</p>
            <div style={styles.confirmRows}>
              {getPlanChangeRows(editingPlan, form).map(([label, value]) => (
                <div key={label} style={styles.confirmRow}>
                  <span style={styles.confirmRowLabel}>{label}</span>
                  <strong style={styles.confirmRowValue}>{value}</strong>
                </div>
              ))}
            </div>
            {formError && <div style={styles.formError}>{formError}</div>}
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmCancelBtn }}
                onClick={() => setSaveEditConfirmOpen(false)}
                disabled={saving}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.addAppointmentBtn }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {viewModalOpen && viewPlan && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.modal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              style={styles.closeIconBtn}
              onClick={requestCloseViewModal}
              aria-label="Close"
            >
              ×
            </button>
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
              <div style={styles.viewModalActions}>
                <button
                  style={styles.deleteBtn}
                  onClick={() => setPlanDeleteTarget(viewPlan)}
                >
                  Delete
                </button>
                <button
                  style={styles.editBtn}
                  onClick={() => setEditConfirmPlan(viewPlan)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      ), document.body)}

      {editConfirmPlan && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.confirmModal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIconGold}>
              <i className="fi fi-rr-edit" style={styles.confirmIconText}></i>
            </div>
            <h3 style={styles.confirmTitle}>Edit Treatment Plan</h3>
            <p style={styles.confirmText}>Do you want to edit this information?</p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmCancelBtn }}
                onClick={() => setEditConfirmPlan(null)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.addAppointmentBtn }}
                onClick={() => {
                  const plan = editConfirmPlan;
                  setEditConfirmPlan(null);
                  closeViewModal();
                  openEditModal(plan);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {attachmentModalOpen && attachmentPlan && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.attachmentModal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <div style={styles.attachmentHeader}>
              <h3 style={styles.modalTitle}>Tooth #{attachmentPlan.tooth_number}</h3>
              <div style={styles.attachmentMeta}>
                <span>{attachmentPlan.planned_treatment}</span>
                <StatusBadge status={attachmentPlan.status} styles={styles} />
              </div>
            </div>

            {canEdit && (
              <div
                style={styles.uploadDropzone}
                onClick={() => uploadInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  handleAttachmentFiles(e.dataTransfer.files);
                }}
              >
                <i className="fi fi-rr-upload" style={styles.uploadIcon}></i>
                <strong>Drop files here or click to upload</strong>
                <span>Images or PDF files, up to 10 MB each</span>
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  style={styles.hiddenInput}
                  onChange={e => handleAttachmentFiles(e.target.files)}
                />
              </div>
            )}

            {attachmentError && <div style={styles.formError}>{attachmentError}</div>}
            {attachmentsLoading && <div style={styles.loadingBox}>Loading attachments...</div>}
            {uploadingAttachments && <div style={styles.loadingBox}>Uploading attachments...</div>}

            <div style={styles.attachmentList}>
              {!attachmentsLoading && attachments.length === 0 ? (
                <div style={styles.attachmentEmpty}>No attachments uploaded.</div>
              ) : (
                attachments.map((attachment) => (
                  <div key={attachment.id} style={styles.attachmentItem}>
                    <AttachmentThumb attachment={attachment} styles={styles} />
                    <div style={styles.attachmentInfo}>
                      <strong style={styles.attachmentName}>{attachment.file_name}</strong>
                      <span style={styles.attachmentSubtext}>
                        {formatUploadDate(attachment.uploaded_at)} · {formatFileSize(attachment.file_size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      style={styles.iconActionBtn}
                      title="Preview attachment"
                      onClick={() => setPreviewAttachment(attachment)}
                    >
                      <i className="fi fi-rr-eye"></i>
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        style={{ ...styles.iconActionBtn, ...styles.iconDeleteBtn }}
                        title="Delete attachment"
                        onClick={() => setDeleteAttachment(attachment)}
                      >
                        <i className="fi fi-rr-trash"></i>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      ), document.body)}

      {previewAttachment && createPortal((
        <div style={{ ...styles.lightboxOverlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.lightboxContent, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{previewAttachment.file_name}</h3>
            {isImageAttachment(previewAttachment) ? (
              <img
                src={attachmentUrl(previewAttachment.file_url)}
                alt={previewAttachment.file_name}
                style={styles.lightboxImage}
              />
            ) : (
              <iframe
                src={attachmentUrl(previewAttachment.file_url)}
                title={previewAttachment.file_name}
                style={styles.lightboxFrame}
              />
            )}
          </div>
        </div>
      ), document.body)}

      {deleteAttachment && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.confirmModal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <i className="fi fi-rr-trash" style={styles.confirmIconText}></i>
            </div>
            <h3 style={styles.confirmTitle}>Delete Attachment</h3>
            <p style={styles.confirmText}>
              Are you sure you want to remove {deleteAttachment.file_name}? This cannot be undone.
            </p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmCancelBtn }}
                onClick={() => setDeleteAttachment(null)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmDeleteBtn }}
                onClick={confirmDeleteAttachment}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {planDeleteTarget && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.confirmModal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <i className="fi fi-rr-trash" style={styles.confirmIconText}></i>
            </div>
            <h3 style={styles.confirmTitle}>Delete Treatment Plan</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete the treatment plan for tooth #{planDeleteTarget.tooth_number}? This cannot be undone.
            </p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmCancelBtn }}
                onClick={() => setPlanDeleteTarget(null)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmDeleteBtn }}
                onClick={() => handleDeleteFromView(planDeleteTarget.id)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ), document.body)}

      {closeConfirm && createPortal((
        <div style={{ ...styles.overlay, position: 'fixed', inset: 0, zIndex: 2147483647 }}>
          <div style={{ ...styles.confirmModal, position: "relative", zIndex: 2147483646 }} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <i className="fi fi-rr-exclamation" style={styles.confirmIconText}></i>
            </div>
            <h3 style={styles.confirmTitle}>{closeConfirm.title}</h3>
            <p style={styles.confirmText}>{closeConfirm.message}</p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmCancelBtn }}
                onClick={() => setCloseConfirm(null)}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmButton, ...styles.confirmDeleteBtn }}
                onClick={() => {
                  const onConfirm = closeConfirm.onConfirm;
                  setCloseConfirm(null);
                  onConfirm();
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
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

function attachmentUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return `${baseUrl}${fileUrl}`;
}

function isImageAttachment(attachment) {
  return String(attachment.mime_type || '').startsWith('image/');
}

function formatUploadDate(value) {
  if (!value) return 'No upload date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No upload date';
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatFileSize(value) {
  const size = Number(value || 0);
  if (!size) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getPlanChangeRows(original, next) {
  const originalDate = original.date_completed ? original.date_completed.slice(0, 10) : '';
  const changedFields = [
    original.planned_treatment !== (
      next.planned_treatment_option === 'Other'
        ? next.other_treatment
        : next.planned_treatment_option
    ) ? 'Planned Treatment' : '',
    original.status !== next.status ? 'Status' : '',
    (original.notes || '') !== (next.notes || '') ? 'Notes' : '',
    originalDate !== (next.date_completed || '') ? 'Date Completed' : '',
  ].filter(Boolean);

  return [
    ['Tooth', `#${next.tooth_number}`],
    ['Planned Treatment',
      next.planned_treatment_option === 'Other'
        ? next.other_treatment || 'N/A'
        : next.planned_treatment_option || 'N/A'
    ],
    ['Status', STATUS_OPTIONS.find(item => item.value === next.status)?.label || next.status || 'N/A'],
    ['Notes', next.notes || 'N/A'],
    ['Date Completed', next.date_completed || 'N/A'],
    ['Changed Fields', changedFields.join(', ') || 'No changes detected'],
  ];
}

function AttachmentThumb({ attachment, styles }) {
  if (isImageAttachment(attachment)) {
    return (
      <img
        src={attachmentUrl(attachment.file_url)}
        alt=""
        style={styles.attachmentThumb}
      />
    );
  }

  return (
    <div style={styles.fileThumb}>
      <i className="fi fi-rr-document"></i>
    </div>
  );
}