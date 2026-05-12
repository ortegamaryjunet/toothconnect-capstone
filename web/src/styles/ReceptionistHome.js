const styles = {
    page: {
        fontFamily: 'system-ui, sans-serif',
        minHeight: '100vh',
        background: '#f4f6f8'
    },

    header: {
        background: '#7c2d12',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerUserLabel: {
        marginRight: 16,
        fontSize: 13,
        opacity: 0.85
    },
    logout: {
        background: 'transparent',
        color: '#fff',
        border: '1px solid #fff',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer'
    },

    main: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto'
    },

    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    tabBase: {
        padding: '8px 16px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        borderRadius: '6px',
        marginRight: '8px'
    },
    tabActive: {
        background: '#7c2d12',
        color: '#fff'
    },
    tabInactive: {
        background: '#e2e8f0',
        color: '#4a5568'
    },

    error: {
        background: '#fed7d7',
        color: '#9b2c2c',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px'
    },
    loading: {
        color: '#718096',
        fontSize: '14px',
        padding: '16px'
    },
    empty: {
        color: '#718096',
        fontSize: '14px',
        textAlign: 'center',
        padding: '32px',
        background: '#fff',
        borderRadius: '8px'
    },

    daySection: {
        marginBottom: '24px'
    },
    dayHeader: {
        fontSize: '14px',
        color: '#4a5568',
        fontWeight: '600',
        marginBottom: '8px',
        borderBottom: '1px solid #cbd5e0',
        paddingBottom: '4px'
    },

    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    card: {
        background: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    cardLeft: {
        minWidth: '90px'
    },
    cardMiddle: {
        flex: 1
    },
    cardRight: {
        display: 'flex',
        gap: '8px'
    },

    time: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1a365d'
    },
    branchTag: {
        fontSize: '11px',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '2px'
    },
    patientName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#2d3748'
    },
    detail: {
        fontSize: '12px',
        color: '#718096',
        marginTop: '2px'
    },
    statusRow: {
        marginTop: '4px'
    },
    cancelBtn: {
        background: 'transparent',
        color: '#9b2c2c',
        border: '1px solid #fc8181',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    topNav: {
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        gap: '4px'
    },
    topNavTab: {
        padding: '14px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        fontSize: '14px',
        color: '#718096',
        cursor: 'pointer',
        fontWeight: '500',
        marginBottom: '-1px'
    },
    topNavTabActive: {
        color: '#7c2d12',
        borderBottomColor: '#7c2d12'
    }
};

export default styles;