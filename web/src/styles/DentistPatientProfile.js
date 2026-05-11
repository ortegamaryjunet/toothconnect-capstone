const styles = {
    container: {
        padding: '24px',
        maxWidth: '1100px',
        margin: '0 auto'
    },

    backButton: {
        background: 'transparent',
        color: '#2c7a7b',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '4px 0',
        marginBottom: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
    },

    profileCard: {
        background: '#fff',
        padding: '20px 24px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    profileInitial: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#bee3f8',
        color: '#2c5282',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: '600'
    },
    profileInfo: {
        flex: 1
    },
    profileName: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1a365d',
        margin: 0
    },
    profileMeta: {
        fontSize: '13px',
        color: '#718096',
        marginTop: '4px'
    },

    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '20px'
    },

    chartCard: {
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a365d',
        margin: 0,
        marginBottom: '4px'
    },
    sectionSubtitle: {
        fontSize: '12px',
        color: '#718096',
        marginBottom: '16px'
    },

    sidePanel: {
        background: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    sidePanelEmpty: {
        color: '#a0aec0',
        fontSize: '13px',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '24px 12px'
    },
    error: {
        background: '#fed7d7',
        color: '#9b2c2c',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        marginBottom: '12px'
    },
    loading: {
        color: '#718096',
        fontSize: '14px',
        padding: '16px',
        textAlign: 'center'
    }
    ,
    legend: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #edf2f7'
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#4a5568'
    },
    legendSwatch: {
        width: 14,
        height: 14,
        borderRadius: '3px',
        border: '1px solid #cbd5e0'
    }

};

export default styles;