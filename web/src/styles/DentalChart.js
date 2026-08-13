const styles = {
    chartContainer: {
        width: '100%',
        padding: '4px 0 10px',
        boxSizing: 'border-box'
    },

    chartHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        gap: '15px'
    },

    chartTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#765700'
    },

    chartHint: {
        fontSize: '11px',
        color: '#9a9283'
    },

    chartCard: {
        width: '100%',
        padding: '25px 15px',
        boxSizing: 'border-box',
        background: '#fffdf8',
        border: '1px solid #eee4cf',
        borderRadius: '14px',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.7)'
    },

    arch: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '9px',
        minHeight: '65px'
    },

    archLabel: {
        width: '22px',
        flexShrink: 0,
        fontSize: '10px',
        fontWeight: '700',
        color: '#b0a58f',
        textAlign: 'right',
        letterSpacing: '0.5px'
    },

    archLabelRight: {
        textAlign: 'left'
    },

    midline: {
        width: '1px',
        height: '48px',
        flexShrink: 0,
        background: '#dfd5bf',
        margin: '0 4px'
    },

    archDivider: {
        width: '78%',
        height: '1px',
        margin: '13px auto',
        background: '#e8dfcd'
    },

    tooth: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        borderRadius: '7px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease'
    },

    toothHover: {
        transform: 'translateY(-2px)'
    },

    toothNumber: {
        minHeight: '14px',
        fontSize: '9px',
        color: '#a69c89',
        marginBottom: '2px',
        fontFamily: 'monospace',
        fontWeight: '500'
    },

    toothNumberLower: {
        marginTop: '2px',
        marginBottom: 0
    },

    toothNumberSelected: {
        color: '#806000',
        fontWeight: '700'
    },

    toothSvg: {
        display: 'block',
        transition: 'all 0.15s ease'
    },

    toothSelected: {
        filter: 'drop-shadow(0 2px 4px rgba(196, 154, 34, 0.28))'
    },

    selectedInfo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        marginTop: '13px',
        fontSize: '11px',
        color: '#8a806e'
    },

    selectedDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#c49a22'
    }
};

export default styles;