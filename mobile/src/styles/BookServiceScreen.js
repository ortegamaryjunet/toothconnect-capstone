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

    sectionLabel: {
        fontSize: 12,
        color: '#4a5568',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 8
    },

    branchPicker: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20
    },
    branchChip: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e0',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999
    },
    branchChipActive: {
        backgroundColor: '#1a365d',
        borderColor: '#1a365d'
    },
    branchChipText: {
        fontSize: 13,
        color: '#4a5568'
    },
    branchChipTextActive: {
        color: '#fff',
        fontWeight: '500'
    },

    serviceCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center'
    },
    serviceInfo: {
        flex: 1
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a365d'
    },
    serviceMeta: {
        fontSize: 13,
        color: '#718096',
        marginTop: 4
    },
    servicePrice: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c7a7b'
    },

    loading: {
        color: '#718096',
        fontSize: 14,
        textAlign: 'center',
        padding: 40
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