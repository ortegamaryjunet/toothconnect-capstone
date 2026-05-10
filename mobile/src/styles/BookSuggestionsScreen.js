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

    contextCard: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16
    },
    contextLabel: {
        fontSize: 11,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    contextValue: {
        fontSize: 14,
        color: '#2d3748',
        marginTop: 2,
        fontWeight: '500'
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a365d',
        marginBottom: 4
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 14
    },

    suggestionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0'
    },
    suggestionCardBest: {
        borderColor: '#2c7a7b'
    },
    suggestionTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6
    },
    suggestionTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a365d'
    },
    bestBadge: {
        backgroundColor: '#2c7a7b',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 999
    },
    bestBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5
    },
    suggestionDentist: {
        fontSize: 13,
        color: '#4a5568',
        marginBottom: 10
    },

    breakdownLabel: {
        fontSize: 11,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderTopWidth: 1,
        borderTopColor: '#edf2f7'
    },
    breakdownReason: {
        fontSize: 13,
        color: '#4a5568',
        flex: 1
    },
    breakdownPoints: {
        fontSize: 13,
        color: '#2c7a7b',
        fontWeight: '600'
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderTopWidth: 2,
        borderTopColor: '#edf2f7',
        marginTop: 4
    },
    scoreLabel: {
        fontSize: 13,
        color: '#1a365d',
        fontWeight: '600'
    },
    scoreValue: {
        fontSize: 14,
        color: '#2c7a7b',
        fontWeight: '700'
    },

    pickButton: {
        backgroundColor: '#3182ce',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12
    },
    pickButtonBest: {
        backgroundColor: '#2c7a7b'
    },
    pickButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },

    loading: {
        color: '#718096',
        fontSize: 14,
        textAlign: 'center',
        padding: 40
    },
    empty: {
        color: '#718096',
        fontSize: 14,
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