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
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const availableAppointments = appointments.filter(
        (a) => a.status === 'completed' || a.status === 'scheduled'
    );

    function openModal() {
        setError('');
        setConditionType('');
        setAppointmentId('');
        setNotes('');
        setShowModal(true);
    }

    function closeModal() {
        if (submitting) return;

        setShowModal(false);
        setError('');
        setConditionType('');
        setAppointmentId('');
        setNotes('');
    }

    async function handleSubmit() {
        setError('');

        if (!toothNumber) {
            setError('Tooth number is required.');
            return;
        }

        if (!conditionType) {
            setError('Please select a condition.');
            return;
        }

        const selectedCondition = conditions.find(
            (c) => c.code === conditionType
        );

        if (!selectedCondition) {
            setError('Please select a valid condition.');
            return;
        }

        if (!appointmentId) {
            setError('Please select an appointment.');
            return;
        }

        const selectedAppointment = availableAppointments.find(
            (a) => String(a.id) === String(appointmentId)
        );

        if (!selectedAppointment) {
            setError('Please select a valid appointment.');
            return;
        }

        const parsedAppointmentId = Number(appointmentId);

        if (
            !Number.isInteger(parsedAppointmentId) ||
            parsedAppointmentId <= 0
        ) {
            setError('Invalid appointment selected.');
            return;
        }

        if (notes.trim().length > 1000) {
            setError('Notes must not exceed 1000 characters.');
            return;
        }

        setSubmitting(true);

        try {
            await createTreatment({
                appointment_id: parsedAppointmentId,
                tooth_number: toothNumber,
                condition_type: conditionType,
                notes: notes.trim() || null,
            });

            setShowModal(false);
            setConditionType('');
            setAppointmentId('');
            setNotes('');
            setError('');

            await onChange();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to add treatment.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    function openDeleteModal(id) {
        setDeleteId(id);
    }

    function closeDeleteModal() {
        setDeleteId(null);
    }

    async function handleDelete() {
        if (!deleteId) return;

        try {
            await deleteTreatment(deleteId);
            setDeleteId(null);
            await onChange();
        } catch (err) {
            setDeleteId(null);
            setError(
                err.response?.data?.message ||
                'Failed to delete treatment.'
            );
        }
    }

    return (
        <>
            <div style={styles.container}>
                <div style={styles.panelHeader}>
                    <div style={styles.headerInfo}>
                        <div style={styles.panelEyebrow}>
                            Dental Chart
                        </div>

                        <div style={styles.toothTitleRow}>
                            <div style={styles.toothIcon}>
                                {toothNumber}
                            </div>

                            <div>
                                <div style={styles.toothNumber}>
                                    Tooth #{toothNumber}
                                </div>

                                <div style={styles.toothSubtitle}>
                                    Treatment records and clinical history
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.fdiBadge}>
                        FDI
                    </div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <div style={styles.sectionTitle}>
                                Treatment History
                            </div>

                            <div style={styles.sectionSubtitle}>
                                Previous treatments recorded for this tooth
                            </div>
                        </div>

                        <div style={styles.historyCount}>
                            {treatments?.length || 0}
                        </div>
                    </div>

                    {!treatments || treatments.length === 0 ? (
                        <div style={styles.historyEmpty}>
                            <div style={styles.emptyIcon}>
                                +
                            </div>

                            <div style={styles.emptyTitle}>
                                No treatment records
                            </div>

                            <div style={styles.emptyText}>
                                No treatments have been recorded for tooth #
                                {toothNumber} yet.
                            </div>
                        </div>
                    ) : (
                        <div style={styles.historyList}>
                            {treatments.map((t) => {
                                const cond = conditions.find(
                                    (c) => c.code === t.condition_type
                                );

                                return (
                                    <div
                                        key={t.id}
                                        style={{
                                            ...styles.historyItem,
                                            borderLeftColor:
                                                cond?.color || '#2563eb',
                                        }}
                                    >
                                        <div style={styles.historyTopRow}>
                                            <div style={styles.historyMain}>
                                                <div
                                                    style={{
                                                        ...styles.conditionDot,
                                                        background:
                                                            cond?.color ||
                                                            '#2563eb',
                                                    }}
                                                />

                                                <div>
                                                    <div
                                                        style={
                                                            styles.historyCondition
                                                        }
                                                    >
                                                        {cond?.label ||
                                                            t.condition_type}
                                                    </div>

                                                    <div
                                                        style={
                                                            styles.historyMeta
                                                        }
                                                    >
                                                        {t.dentist_name ||
                                                            'Dentist'}

                                                        {t.service_name
                                                            ? ` · ${t.service_name}`
                                                            : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={styles.historyDate}>
                                                {formatDateOnly(
                                                    t.appointment_date
                                                )}
                                            </div>
                                        </div>

                                        {t.notes && (
                                            <div style={styles.historyNotes}>
                                                {t.notes}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openDeleteModal(t.id)
                                            }
                                            style={styles.deleteBtn}
                                        >
                                            Delete record
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={styles.addTreatmentCard}>
                    <div style={styles.addTreatmentInfo}>
                        <div style={styles.addTreatmentIcon}>
                            +
                        </div>

                        <div>
                            <div style={styles.addTreatmentTitle}>
                                Add Treatment
                            </div>

                            <div style={styles.addTreatmentText}>
                                Record a new treatment for tooth #
                                {toothNumber}.
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openModal}
                        disabled={availableAppointments.length === 0}
                        style={{
                            ...styles.submitBtn,
                            ...(availableAppointments.length === 0
                                ? styles.submitBtnDisabled
                                : {}),
                        }}
                    >
                        + Add Treatment
                    </button>
                </div>

                {availableAppointments.length === 0 && (
                    <div style={styles.noAppointments}>
                        <strong>No appointments available</strong>
                        <span>
                            A treatment must be linked to an appointment.
                        </span>
                    </div>
                )}

                {error && !showModal && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}
            </div>

            {showModal && (
                <div
                    style={styles.modalOverlay}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        style={styles.modal}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div style={styles.modalHeader}>
                            <div>
                                <div style={styles.modalEyebrow}>
                                    New Record
                                </div>

                                <div style={styles.modalTitle}>
                                    Add Treatment
                                </div>

                                <div style={styles.modalSubtitle}>
                                    Tooth #{toothNumber}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.toothPreview}>
                                <div style={styles.toothPreviewIcon}>
                                    {toothNumber}
                                </div>

                                <div>
                                    <div style={styles.previewLabel}>
                                        Tooth
                                    </div>

                                    <div style={styles.previewValue}>
                                        #{toothNumber}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div style={styles.label}>
                                    Condition
                                    <span style={styles.required}>*</span>
                                </div>

                                <select
                                    value={conditionType}
                                    onChange={(e) => {
                                        setConditionType(e.target.value);
                                        setError('');
                                    }}
                                    style={styles.select}
                                >
                                    <option value="">
                                        Select condition
                                    </option>

                                    {conditions.map((c) => (
                                        <option
                                            key={c.code}
                                            value={c.code}
                                        >
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div style={styles.label}>
                                    Appointment
                                    <span style={styles.required}>*</span>
                                </div>

                                <select
                                    value={appointmentId}
                                    onChange={(e) => {
                                        setAppointmentId(e.target.value);
                                        setError('');
                                    }}
                                    style={styles.select}
                                >
                                    <option value="">
                                        Select appointment
                                    </option>

                                    {availableAppointments.map((a) => (
                                        <option
                                            key={a.id}
                                            value={a.id}
                                        >
                                            {formatDateOnly(a.start_time)}
                                            {' · '}
                                            {a.service_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div style={styles.label}>
                                    Clinical Notes
                                </div>

                                <textarea
                                    value={notes}
                                    onChange={(e) => {
                                        setNotes(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Add optional clinical notes..."
                                    maxLength={1000}
                                    style={styles.textarea}
                                />

                                <div style={styles.characterCount}>
                                    {notes.length}/1000
                                </div>
                            </div>

                            {error && (
                                <div style={styles.error}>
                                    {error}
                                </div>
                            )}
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    ...styles.modalSubmitBtn,
                                    ...(submitting
                                        ? styles.submitBtnDisabled
                                        : {}),
                                }}
                            >
                                {submitting
                                    ? 'Saving...'
                                    : 'Save Treatment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div
                    style={styles.modalOverlay}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeDeleteModal();
                        }
                    }}
                >
                    <div
                        style={styles.deleteModal}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div style={styles.deleteIcon}>
                            !
                        </div>

                        <div style={styles.deleteTitle}>
                            Delete Treatment?
                        </div>

                        <div style={styles.deleteText}>
                            This treatment record will be permanently deleted.
                            This action cannot be undone.
                        </div>

                        <div style={styles.deleteActions}>
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                style={styles.cancelBtn}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                style={styles.deleteConfirmBtn}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}