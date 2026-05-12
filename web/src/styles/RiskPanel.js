const styles = {
    panel: {
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: '16px'
    },
    title: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a365d',
        margin: 0,
        marginBottom: '4px'
    },
    subtitle: {
        fontSize: '12px',
        color: '#718096',
        marginBottom: '16px'
    },

    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
    },
    versionCard: {
        padding: '14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    versionLabel: {
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#718096',
        marginBottom: '4px'
    },
    versionLevel: {
        fontSize: '18px',
        fontWeight: '700',
        textTransform: 'capitalize',
        marginBottom: '2px'
    },
    versionLevelLow: { color: '#276749' },
    versionLevelModerate: { color: '#9c4221' },
    versionLevelHigh: { color: '#9b2c2c' },
    versionScore: {
        fontSize: '12px',
        color: '#4a5568'
    },
    versionMeta: {
        fontSize: '11px',
        color: '#a0aec0',
        marginTop: '6px'
    },

    empty: {
        fontSize: '13px',
        color: '#a0aec0',
        fontStyle: 'italic',
        padding: '8px 0'
    },

    verifyBtn: {
        background: '#2c7a7b',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    },

    modalBackdrop: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    modal: {
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        width: 'min(600px, 92vw)',
        maxHeight: '85vh',
        overflow: 'auto'
    },
    modalTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1a365d',
        margin: 0,
        marginBottom: '4px'
    },
    modalSubtitle: {
        fontSize: '13px',
        color: '#718096',
        marginBottom: '20px'
    },

    categoryLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#1a365d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '16px',
        marginBottom: '8px'
    },

    factorRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 10px',
        background: '#f7fafc',
        borderRadius: '6px',
        marginBottom: '6px',
        cursor: 'pointer',
        border: '2px solid transparent'
    },
    factorRowSelected: {
        background: '#e6fffa',
        borderColor: '#2c7a7b'
    },
    factorRowClinician: {
        background: '#fffaf0',
        borderColor: '#feebc8'
    },
    factorRowClinicianSelected: {
        background: '#fef5e7',
        borderColor: '#dd6b20'
    },
    factorCheckbox: {
        width: 18,
        height: 18,
        borderRadius: '4px',
        border: '2px solid #cbd5e0',
        marginRight: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff'
    },
    factorCheckboxSelected: {
        background: '#2c7a7b',
        borderColor: '#2c7a7b',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '700'
    },
    factorLabel: {
        fontSize: '13px',
        color: '#2d3748',
        flex: 1
    },
    factorClinicianTag: {
        fontSize: '10px',
        color: '#9c4221',
        background: '#feebc8',
        padding: '2px 6px',
        borderRadius: '999px',
        marginRight: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    factorWeight: {
        fontSize: '12px',
        fontWeight: '600'
    },
    factorWeightProtective: { color: '#2c7a7b' },
    factorWeightRisk: { color: '#9c4221' },

    actions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '20px'
    },
    cancelBtn: {
        background: 'transparent',
        color: '#4a5568',
        border: '1px solid #cbd5e0',
        padding: '10px 18px',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer'
    },
    saveBtn: {
        background: '#2c7a7b',
        color: '#fff',
        border: 'none',
        padding: '10px 18px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    saveBtnDisabled: {
        background: '#a0aec0',
        cursor: 'not-allowed'
    },

    error: {
        background: '#fed7d7',
        color: '#9b2c2c',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        marginTop: '10px'
    }
};

export default styles;