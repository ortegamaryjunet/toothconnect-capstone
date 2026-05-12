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

    levelCard: {
        padding: 24,
        borderRadius: 14,
        marginBottom: 16,
        alignItems: 'center'
    },
    levelCardLow: { backgroundColor: '#c6f6d5' },
    levelCardModerate: { backgroundColor: '#feebc8' },
    levelCardHigh: { backgroundColor: '#fed7d7' },

    levelLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4
    },
    levelLabelLow: { color: '#276749' },
    levelLabelModerate: { color: '#9c4221' },
    levelLabelHigh: { color: '#9b2c2c' },

    levelText: {
        fontSize: 30,
        fontWeight: '700',
        textTransform: 'capitalize'
    },
    levelTextLow: { color: '#276749' },
    levelTextModerate: { color: '#9c4221' },
    levelTextHigh: { color: '#9b2c2c' },

    scoreText: {
        fontSize: 14,
        marginTop: 6
    },
    scoreTextLow: { color: '#276749' },
    scoreTextModerate: { color: '#9c4221' },
    scoreTextHigh: { color: '#9b2c2c' },

    headline: {
        fontSize: 14,
        color: '#2d3748',
        lineHeight: 20,
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#2c7a7b',
        marginBottom: 16
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a365d',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 8
    },

    breakdownCategory: {
        fontSize: 12,
        color: '#718096',
        marginTop: 8,
        marginBottom: 4
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 4
    },
    breakdownLabel: {
        fontSize: 13,
        color: '#4a5568',
        flex: 1
    },
    breakdownWeight: {
        fontSize: 13,
        fontWeight: '600'
    },
    breakdownWeightProtective: { color: '#2c7a7b' },
    breakdownWeightRisk: { color: '#9c4221' },

    emptyBreakdown: {
        fontSize: 12,
        color: '#a0aec0',
        fontStyle: 'italic',
        padding: 8
    },

    recommendationItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 6
    },
    recommendationBullet: {
        color: '#2c7a7b',
        marginRight: 8,
        fontSize: 14,
        fontWeight: '700'
    },
    recommendationText: {
        fontSize: 13,
        color: '#2d3748',
        flex: 1,
        lineHeight: 18
    },

    recallInfo: {
        fontSize: 13,
        color: '#4a5568',
        backgroundColor: '#bee3f8',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        textAlign: 'center'
    },

    doneBtn: {
        backgroundColor: '#1a365d',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    doneBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600'
    }
});

export default styles;