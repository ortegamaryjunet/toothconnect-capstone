const styles = {
    chartContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px 0'
    },

    arch: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
    },
    archLabel: {
        fontSize: '10px',
        color: '#a0aec0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        width: 40,
        textAlign: 'right'
    },
    archLabelRight: {
        textAlign: 'left'
    },

    midline: {
        width: 1,
        height: 40,
        background: '#cbd5e0',
        margin: '0 4px'
    },

    tooth: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
    },
    toothNumber: {
        fontSize: '10px',
        color: '#a0aec0',
        marginBottom: '2px',
        fontFamily: 'monospace'
    },
    toothSvg: {
        display: 'block'
    },
    toothNumberLower: {
        marginBottom: 0,
        marginTop: '2px'
    },
    toothSelected: {
        outline: '2px solid #2c7a7b',
        outlineOffset: '2px',
        borderRadius: '4px'
    }
};

export default styles;