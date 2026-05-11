const styles = {
    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '4px'
    },
    toothNumber: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1a365d',
        fontFamily: 'monospace'
    },
    toothLabel: {
        fontSize: '12px',
        color: '#718096'
    },

    section: {
        marginTop: '20px'
    },
    sectionTitle: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#4a5568',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
    },

    historyEmpty: {
        color: '#a0aec0',
        fontSize: '13px',
        fontStyle: 'italic',
        padding: '8px 0'
    },
    historyItem: {
        padding: '10px 12px',
        background: '#f7fafc',
        borderRadius: '6px',
        marginBottom: '8px',
        borderLeft: '3px solid #cbd5e0'
    },
    historyTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '4px'
    },
    historyCondition: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1a365d'
    },
    historyDate: {
        fontSize: '11px',
        color: '#718096'
    },
    historyMeta: {
        fontSize: '11px',
        color: '#718096',
        marginBottom: '4px'
    },
    historyNotes: {
        fontSize: '12px',
        color: '#4a5568',
        marginTop: '4px',
        fontStyle: 'italic'
    },
    deleteBtn: {
        background: 'transparent',
        color: '#9b2c2c',
        border: 'none',
        cursor: 'pointer',
        fontSize: '11px',
        padding: '4px 0',
        marginTop: '4px'
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    label: {
        fontSize: '12px',
        color: '#4a5568',
        marginBottom: '2px'
    },
    input: {
        padding: '8px 10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box'
    },
    select: {
        padding: '8px 10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '13px',
        background: '#fff',
        width: '100%',
        boxSizing: 'border-box'
    },
    textarea: {
        padding: '8px 10px',
        border: '1px solid #cbd5e0',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: '60px',
        width: '100%',
        boxSizing: 'border-box'
    },
    submitBtn: {
        background: '#2c7a7b',
        color: '#fff',
        border: 'none',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '6px'
    },
    submitBtnDisabled: {
        background: '#a0aec0',
        cursor: 'not-allowed'
    },
    error: {
        background: '#fed7d7',
        color: '#9b2c2c',
        padding: '8px 10px',
        borderRadius: '6px',
        fontSize: '12px'
    },
    noAppointments: {
        fontSize: '12px',
        color: '#9c4221',
        background: '#feebc8',
        padding: '10px',
        borderRadius: '6px'
    }
};

export default styles;