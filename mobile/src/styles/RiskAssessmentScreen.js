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

    intro: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16
    },
    introTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a365d',
        marginBottom: 6
    },
    introText: {
        fontSize: 13,
        color: '#4a5568',
        lineHeight: 18
    },
    disclaimer: {
        fontSize: 11,
        color: '#9c4221',
        backgroundColor: '#feebc8',
        padding: 8,
        borderRadius: 6,
        marginTop: 10
    },

    categoryHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a365d',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 16,
        marginBottom: 8
    },

    factorCard: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center'
    },
    factorCardSelected: {
        borderColor: '#2c7a7b',
        backgroundColor: '#e6fffa'
    },
    factorInfo: {
        flex: 1
    },
    factorQuestion: {
        fontSize: 14,
        color: '#2d3748',
        lineHeight: 19
    },
    factorWeight: {
        fontSize: 12,
        marginLeft: 12,
        fontWeight: '600'
    },
    factorWeightProtective: {
        color: '#2c7a7b'
    },
    factorWeightRisk: {
        color: '#9c4221'
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#cbd5e0',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkboxSelected: {
        backgroundColor: '#2c7a7b',
        borderColor: '#2c7a7b'
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700'
    },

    submitBtn: {
        backgroundColor: '#2c7a7b',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12
    },
    submitBtnDisabled: {
        backgroundColor: '#a0aec0'
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600'
    },

    error: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: 10,
        borderRadius: 6,
        fontSize: 13,
        marginTop: 12
    },
    loading: {
        color: '#718096',
        textAlign: 'center',
        padding: 40
    }
});

export default styles;