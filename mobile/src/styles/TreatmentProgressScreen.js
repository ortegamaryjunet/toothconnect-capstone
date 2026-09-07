import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f7f4'
    },

    header: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e4cf88'
    },
    backButton: {
        marginRight: 12
    },
    backButtonText: {
        color: '#b47a00',
        fontSize: 14,
        fontWeight: '800'
    },
    headerTitle: {
        color: '#1f1f1f',
        fontSize: 20,
        fontWeight: '900'
    },

    body: {
        flex: 1,
        padding: 16
    },

    intro: {
        fontSize: 13,
        color: '#4a5568',
        marginBottom: 16
    },

    toothSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        padding: 14,
        borderLeftWidth: 4
    },
    toothHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8
    },
    toothNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a365d',
        fontFamily: 'monospace'
    },
    toothCurrent: {
        fontSize: 12,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    historyItem: {
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: '#edf2f7'
    },
    historyTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    historyCondition: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2d3748'
    },
    historyDate: {
        fontSize: 11,
        color: '#718096'
    },
    historyMeta: {
        fontSize: 11,
        color: '#718096',
        marginTop: 2
    },
    historyNotes: {
        fontSize: 12,
        color: '#4a5568',
        marginTop: 4,
        fontStyle: 'italic'
    },

    loading: {
        color: '#718096',
        textAlign: 'center',
        padding: 40
    },
    empty: {
        color: '#718096',
        textAlign: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 8
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
