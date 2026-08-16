const styles = {
    container: {
        width: '100%',
        color: '#172033',
    },

    panelHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0 20px',
        borderBottom: '1px solid #e8edf3',
        marginBottom: '18px',
    },

    headerInfo: {
        minWidth: 0,
    },

    panelEyebrow: {
        marginBottom: '8px',
        color: '#718096',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
    },

    toothTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },

    toothIcon: {
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: '12px',
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        color: '#2563eb',
        fontSize: '14px',
        fontWeight: '800',
    },

    toothNumber: {
        color: '#172033',
        fontSize: '20px',
        fontWeight: '750',
        lineHeight: '1.2',
    },

    toothSubtitle: {
        marginTop: '4px',
        color: '#8a94a6',
        fontSize: '11px',
        lineHeight: '1.4',
    },

    fdiBadge: {
        padding: '6px 10px',
        borderRadius: '7px',
        background: '#f5f7fa',
        border: '1px solid #e3e8ef',
        color: '#667085',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.5px',
    },

    section: {
        padding: '18px',
        background: '#ffffff',
        border: '1px solid #e5e9ef',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.035)',
    },

    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px',
    },

    sectionTitle: {
        color: '#172033',
        fontSize: '14px',
        fontWeight: '750',
    },

    sectionSubtitle: {
        marginTop: '4px',
        color: '#8a94a6',
        fontSize: '11px',
    },

    historyCount: {
        minWidth: '28px',
        height: '28px',
        padding: '0 7px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        background: '#eff6ff',
        border: '1px solid #dbeafe',
        color: '#2563eb',
        fontSize: '11px',
        fontWeight: '750',
    },

    historyList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },

    historyEmpty: {
        padding: '28px 18px',
        textAlign: 'center',
        background: '#f8fafc',
        border: '1px dashed #d9e0e8',
        borderRadius: '11px',
    },

    emptyIcon: {
        width: '38px',
        height: '38px',
        margin: '0 auto 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        background: '#eff6ff',
        color: '#2563eb',
        fontSize: '20px',
        fontWeight: '400',
    },

    emptyTitle: {
        color: '#344054',
        fontSize: '12px',
        fontWeight: '700',
    },

    emptyText: {
        maxWidth: '280px',
        margin: '5px auto 0',
        color: '#8a94a6',
        fontSize: '11px',
        lineHeight: '1.5',
    },

    historyItem: {
        padding: '14px',
        background: '#ffffff',
        border: '1px solid #e6eaf0',
        borderLeft: '4px solid #2563eb',
        borderRadius: '10px',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    },

    historyTopRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
    },

    historyMain: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '9px',
        minWidth: 0,
    },

    conditionDot: {
        width: '8px',
        height: '8px',
        marginTop: '5px',
        flexShrink: 0,
        borderRadius: '50%',
    },

    historyCondition: {
        color: '#253047',
        fontSize: '12px',
        fontWeight: '700',
    },

    historyMeta: {
        marginTop: '4px',
        color: '#8a94a6',
        fontSize: '10px',
        lineHeight: '1.4',
    },

    historyDate: {
        flexShrink: 0,
        padding: '4px 7px',
        borderRadius: '6px',
        background: '#f8fafc',
        color: '#7b8494',
        fontSize: '9px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },

    historyNotes: {
        marginTop: '11px',
        padding: '9px 11px',
        background: '#f8fafc',
        border: '1px solid #edf0f4',
        borderRadius: '7px',
        color: '#667085',
        fontSize: '10px',
        lineHeight: '1.5',
    },

    deleteBtn: {
        marginTop: '10px',
        padding: '0',
        background: 'transparent',
        border: 'none',
        color: '#d04444',
        fontSize: '10px',
        fontWeight: '650',
        cursor: 'pointer',
    },

    addTreatmentCard: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginTop: '14px',
        padding: '15px 16px',
        background: '#f8fbff',
        border: '1px solid #dce9f8',
        borderRadius: '12px',
    },

    addTreatmentInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        minWidth: 0,
    },

    addTreatmentIcon: {
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: '9px',
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '400',
    },

    addTreatmentTitle: {
        color: '#24324a',
        fontSize: '12px',
        fontWeight: '750',
    },

    addTreatmentText: {
        marginTop: '3px',
        color: '#8792a5',
        fontSize: '10px',
        lineHeight: '1.4',
    },

    submitBtn: {
        flexShrink: 0,
        height: '38px',
        padding: '0 14px',
        border: 'none',
        borderRadius: '8px',
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 3px 8px rgba(37, 99, 235, 0.18)',
    },

    submitBtnDisabled: {
        background: '#c5ccd6',
        color: '#ffffff',
        cursor: 'not-allowed',
        boxShadow: 'none',
    },

    noAppointments: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        marginTop: '10px',
        padding: '10px 12px',
        background: '#fffaf0',
        border: '1px solid #f4dfb0',
        borderRadius: '8px',
        color: '#946c16',
        fontSize: '10px',
        lineHeight: '1.5',
    },

    error: {
        marginTop: '10px',
        padding: '10px 12px',
        background: '#fff5f5',
        border: '1px solid #f1d0d0',
        borderRadius: '8px',
        color: '#b42318',
        fontSize: '11px',
        lineHeight: '1.4',
    },

    modalOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.52)',
        backdropFilter: 'blur(3px)',
    },

    modal: {
        width: '100%',
        maxWidth: '460px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.20)',
    },

    modalHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '20px 22px 17px',
        borderBottom: '1px solid #edf0f4',
    },

    modalEyebrow: {
        marginBottom: '5px',
        color: '#2563eb',
        fontSize: '9px',
        fontWeight: '750',
        letterSpacing: '1px',
        textTransform: 'uppercase',
    },

    modalTitle: {
        color: '#172033',
        fontSize: '18px',
        fontWeight: '750',
    },

    modalSubtitle: {
        marginTop: '4px',
        color: '#8a94a6',
        fontSize: '10px',
    },

    closeButton: {
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc',
        color: '#667085',
        fontSize: '18px',
        lineHeight: 1,
        cursor: 'pointer',
    },

    modalBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px 22px',
    },

    toothPreview: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '11px',
        background: '#f8fafc',
        border: '1px solid #e7ebf0',
        borderRadius: '9px',
    },

    toothPreviewIcon: {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        background: '#eff6ff',
        color: '#2563eb',
        fontSize: '11px',
        fontWeight: '800',
    },

    previewLabel: {
        color: '#98a2b3',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },

    previewValue: {
        marginTop: '2px',
        color: '#344054',
        fontSize: '12px',
        fontWeight: '700',
    },

    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#344054',
        fontSize: '11px',
        fontWeight: '650',
    },

    required: {
        marginLeft: '3px',
        color: '#d04444',
    },

    select: {
        width: '100%',
        height: '42px',
        padding: '0 12px',
        boxSizing: 'border-box',
        border: '1px solid #d9e0e8',
        borderRadius: '8px',
        outline: 'none',
        background: '#ffffff',
        color: '#344054',
        fontSize: '12px',
        fontFamily: 'inherit',
        cursor: 'pointer',
    },

    textarea: {
        width: '100%',
        minHeight: '95px',
        padding: '10px 12px',
        boxSizing: 'border-box',
        border: '1px solid #d9e0e8',
        borderRadius: '8px',
        outline: 'none',
        background: '#ffffff',
        color: '#344054',
        fontSize: '12px',
        fontFamily: 'inherit',
        lineHeight: '1.5',
        resize: 'vertical',
    },

    characterCount: {
        marginTop: '4px',
        textAlign: 'right',
        color: '#98a2b3',
        fontSize: '9px',
    },

    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '9px',
        padding: '15px 22px 20px',
        borderTop: '1px solid #edf0f4',
    },

    cancelBtn: {
        height: '38px',
        padding: '0 17px',
        border: '1px solid #d9e0e8',
        borderRadius: '8px',
        background: '#ffffff',
        color: '#667085',
        fontSize: '11px',
        fontWeight: '650',
        cursor: 'pointer',
    },

    modalSubmitBtn: {
        height: '38px',
        padding: '0 18px',
        border: 'none',
        borderRadius: '8px',
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 3px 8px rgba(37, 99, 235, 0.18)',
    },

    deleteModal: {
        width: '100%',
        maxWidth: '360px',
        padding: '24px',
        boxSizing: 'border-box',
        background: '#ffffff',
        border: '1px solid #e4e8ee',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.20)',
    },

    deleteIcon: {
        width: '42px',
        height: '42px',
        margin: '0 auto 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: '#fff1f1',
        color: '#d04444',
        fontSize: '19px',
        fontWeight: '750',
    },

    deleteTitle: {
        color: '#253047',
        fontSize: '16px',
        fontWeight: '750',
    },

    deleteText: {
        marginTop: '7px',
        color: '#7b8494',
        fontSize: '11px',
        lineHeight: '1.55',
    },

    deleteActions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '9px',
        marginTop: '20px',
    },

    deleteConfirmBtn: {
        height: '38px',
        padding: '0 18px',
        border: 'none',
        borderRadius: '8px',
        background: '#d04444',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
    },
};

export default styles;