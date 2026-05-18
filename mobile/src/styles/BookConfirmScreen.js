import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f7f4'
    },

    header: {
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.2,
        borderBottomColor: '#c88a11',
        paddingHorizontal: 18,
        backgroundColor: '#ffffff'
    },
    backButton: {
        marginRight: 12,
        paddingVertical: 6,
        paddingRight: 4
    },
    backButtonText: {
        color: '#b47a00',
        fontSize: 14,
        fontWeight: '800'
    },
    headerTitle: {
        flex: 1,
        color: '#1f1f1f',
        fontSize: 22,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },

    body: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 24
    },

    reviewText: {
        fontSize: 16,
        color: '#777777',
        lineHeight: 25,
        fontWeight: '500',
        marginBottom: 22
    },

    summaryCard: {
        backgroundColor: '#ffffff',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ead7b2',
        marginBottom: 22
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13
    },
    summaryLabel: {
        width: 128,
        fontSize: 13,
        color: '#1f1f1f',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '900'
    },
    summaryValueArea: {
        flex: 1
    },
    summaryValue: {
        flex: 1,
        fontSize: 16,
        color: '#1f1f1f',
        fontWeight: '600'
    },
    summaryValueBig: {
        fontSize: 17,
        color: '#1f1f1f',
        fontWeight: '900'
    },
    summaryValueTime: {
        fontSize: 27,
        color: '#1f1f1f',
        fontWeight: '900',
        marginTop: 5,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#eeeeee'
    },

    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        marginBottom: 42
    },

    confirmButton: {
        flex: 1,
        backgroundColor: '#c98904',
        paddingVertical: 15,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900',
        textAlign: 'center'
    },
    confirmButtonDisabled: {
        backgroundColor: '#d8c08f'
    },

    cancelLink: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#c98904'
    },
    cancelLinkText: {
        color: '#b47a00',
        fontSize: 14,
        fontWeight: '900',
        textAlign: 'center'
    },

    error: {
        backgroundColor: '#fff3f0',
        color: '#993c1d',
        padding: 12,
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#f0c6b8',
        fontWeight: '600'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.42)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    modalBox: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ead7b2'
    },
    modalTitle: {
        fontSize: 18,
        color: '#1f1f1f',
        fontWeight: '900',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: 8
    },
    modalMessage: {
        fontSize: 14,
        color: '#777777',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 18
    },
    modalOkButton: {
        backgroundColor: '#c98904',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    modalOkButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900'
    },
    modalActionRow: {
        flexDirection: 'row',
        gap: 10
    },
    modalYesButton: {
        flex: 1,
        backgroundColor: '#c98904',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    modalYesButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '900'
    },
    modalNoButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c98904'
    },
    modalNoButtonText: {
        color: '#b47a00',
        fontSize: 14,
        fontWeight: '900'
    }
});

export default styles;