const styles = {
    container: {
        padding: '24px',
        maxWidth: '1100px',
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

    layout: {
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '16px',
        height: 'calc(100vh - 220px)',
        minHeight: '480px'
    },

    threadList: {
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'auto'
    },
    threadRow: {
        padding: '12px 14px',
        borderBottom: '1px solid #edf2f7',
        cursor: 'pointer',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    threadRowActive: {
        background: '#ebf8ff'
    },
    threadInitial: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: '#bee3f8',
        color: '#2c5282',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '600',
        flexShrink: 0
    },
    threadBody: {
        flex: 1,
        minWidth: 0
    },
    threadName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1a365d',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    threadPreview: {
        fontSize: '12px',
        color: '#718096',
        marginTop: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    threadMeta: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        flexShrink: 0
    },
    threadTime: {
        fontSize: '10px',
        color: '#a0aec0'
    },
    unreadBadge: {
        background: '#3182ce',
        color: '#fff',
        fontSize: '10px',
        fontWeight: '600',
        padding: '2px 7px',
        borderRadius: '999px',
        minWidth: '18px',
        textAlign: 'center'
    },

    chatPane: {
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    chatHeader: {
        padding: '14px 18px',
        borderBottom: '1px solid #edf2f7',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    chatHeaderName: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1a365d'
    },
    chatHeaderMeta: {
        fontSize: '11px',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    chatMessages: {
        flex: 1,
        overflow: 'auto',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    bubble: {
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: '14px',
        fontSize: '14px',
        lineHeight: '1.4',
        wordBreak: 'break-word'
    },
    bubbleSelf: {
        alignSelf: 'flex-end',
        background: '#3182ce',
        color: '#fff',
        borderBottomRightRadius: '4px'
    },
    bubbleOther: {
        alignSelf: 'flex-start',
        background: '#edf2f7',
        color: '#2d3748',
        borderBottomLeftRadius: '4px'
    },
    bubbleTime: {
        fontSize: '10px',
        opacity: 0.75,
        marginTop: '3px'
    },

    composer: {
        padding: '12px 18px',
        borderTop: '1px solid #edf2f7',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end'
    },
    composerInput: {
        flex: 1,
        minHeight: '40px',
        maxHeight: '120px',
        padding: '10px 12px',
        border: '1px solid #cbd5e0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'none',
        outline: 'none'
    },
    sendBtn: {
        background: '#3182ce',
        color: '#fff',
        border: 'none',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        height: '40px'
    },
    sendBtnDisabled: {
        background: '#a0aec0',
        cursor: 'not-allowed'
    },

    emptyState: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#a0aec0',
        fontSize: '14px'
    },
    loading: {
        color: '#718096',
        fontSize: '13px',
        padding: '16px'
    },
    empty: {
        color: '#a0aec0',
        fontSize: '13px',
        textAlign: 'center',
        padding: '24px',
        fontStyle: 'italic'
    },
    error: {
        background: '#fed7d7',
        color: '#9b2c2c',
        padding: '10px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        margin: '0 18px 12px'
    }
};

export default styles;