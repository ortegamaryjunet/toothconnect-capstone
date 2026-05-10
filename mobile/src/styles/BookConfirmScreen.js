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
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },

    body: {
        flex: 1,
        padding: 20
    },

    summaryCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20
    },
    summaryRow: {
        marginBottom: 14
    },
    summaryLabel: {
        fontSize: 11,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4
    },
    summaryValue: {
        fontSize: 16,
        color: '#1a365d',
        fontWeight: '500'
    },
    summaryValueBig: {
        fontSize: 22,
        color: '#1a365d',
        fontWeight: '600'
    },

    confirmButton: {
        backgroundColor: '#2c7a7b',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center'
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600'
    },
    confirmButtonDisabled: {
        backgroundColor: '#a0aec0'
    },
    cancelLink: {
        alignItems: 'center',
        marginTop: 14
    },
    cancelLinkText: {
        color: '#718096',
        fontSize: 13
    },

    error: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: 12,
        borderRadius: 6,
        fontSize: 13,
        marginBottom: 12
    }
});

export default styles;