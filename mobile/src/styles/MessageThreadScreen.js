import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8'
    },

    header: {
        backgroundColor: '#1a365d',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButton: {
        marginRight: 12
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14
    },
    headerInfo: {
        flex: 1
    },
    headerName: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600'
    },
    headerRole: {
        color: '#cbd5e0',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2
    },

    messages: {
        flex: 1,
        padding: 14
    },

    bubble: {
        maxWidth: '78%',
        padding: 10,
        borderRadius: 14,
        marginBottom: 8
    },
    bubbleSelf: {
        alignSelf: 'flex-end',
        backgroundColor: '#3182ce',
        borderBottomRightRadius: 4
    },
    bubbleOther: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    bubbleTextSelf: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 19
    },
    bubbleTextOther: {
        color: '#2d3748',
        fontSize: 14,
        lineHeight: 19
    },
    bubbleTime: {
        fontSize: 10,
        marginTop: 4
    },
    bubbleTimeSelf: {
        color: 'rgba(255,255,255,0.7)'
    },
    bubbleTimeOther: {
        color: '#a0aec0'
    },

    composer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    },
    composerInput: {
        flex: 1,
        backgroundColor: '#f4f6f8',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
        marginRight: 8
    },
    sendBtn: {
        backgroundColor: '#3182ce',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10
    },
    sendBtnDisabled: {
        backgroundColor: '#a0aec0'
    },
    sendBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },

    empty: {
        color: '#a0aec0',
        textAlign: 'center',
        padding: 40,
        fontSize: 13,
        fontStyle: 'italic'
    },
    loading: {
        color: '#718096',
        textAlign: 'center',
        padding: 40
    },
    error: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: 10,
        borderRadius: 6,
        fontSize: 13,
        margin: 10
    }
});

export default styles;