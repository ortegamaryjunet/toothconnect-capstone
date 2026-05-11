const styles = {
    container: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto'
    },

    pageTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1a365d',
        marginBottom: '4px'
    },
    pageSubtitle: {
        fontSize: '13px',
        color: '#718096',
        marginBottom: '20px'
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
    error: {
        background: '#fed7d7',
        color: '#9b2c2c',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px'
    },

    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    card: {
        background: '#fff',
        padding: '14px 18px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        border: '1px solid transparent',
        transition: 'border-color 0.15s'
    },
    cardHover: {
        borderColor: '#2c7a7b'
    },
    cardInitial: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: '#bee3f8',
        color: '#2c5282',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px',
        fontWeight: '600'
    },
    cardInfo: {
        flex: 1
    },
    cardName: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#1a365d'
    },
    cardMeta: {
        fontSize: '12px',
        color: '#718096',
        marginTop: '3px'
    },
    cardStat: {
        fontSize: '12px',
        color: '#4a5568',
        textAlign: 'right'
    },
    cardStatLabel: {
        fontSize: '10px',
        color: '#a0aec0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '2px'
    }
};

export default styles;