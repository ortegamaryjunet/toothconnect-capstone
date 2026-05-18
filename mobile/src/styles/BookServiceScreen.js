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
        color: '#1f1f1f',
        fontSize: 22,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },

    body: {
        flex: 1
    },
    bodyContent: {
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 42
    },

    sectionLabel: {
        fontSize: 10,
        color: '#8a650e',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 4,
        fontWeight: '800'
    },

    branchPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 22
    },
    branchChip: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e4cf88',
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderRadius: 999
    },
    branchChipActive: {
        backgroundColor: '#c98904',
        borderColor: '#c98904'
    },
    branchChipText: {
        fontSize: 12,
        color: '#8a650e',
        fontWeight: '800'
    },
    branchChipTextActive: {
        color: '#ffffff',
        fontWeight: '900'
    },

    serviceCard: {
        backgroundColor: '#ffffff',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 11,
        borderWidth: 1,
        borderColor: '#e4cf88',
        flexDirection: 'row',
        alignItems: 'center'
    },
    serviceInfo: {
        flex: 1
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1f1f1f',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    serviceMeta: {
        fontSize: 13,
        color: '#888888',
        marginTop: 3,
        fontWeight: '600'
    },
    servicePrice: {
        fontSize: 15,
        fontWeight: '900',
        color: '#b47a00'
    },

    loading: {
        color: '#888888',
        fontSize: 13,
        textAlign: 'center',
        paddingVertical: 40,
        fontWeight: '600'
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
    }
});

export default styles;