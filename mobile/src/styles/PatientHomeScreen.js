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
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    logout: {
        color: '#fff',
        fontSize: 14
    },

    body: {
        flex: 1,
        padding: 20
    },
    welcome: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1a365d'
    },
    email: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 20
    },

    placeholder: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    placeholderTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d3748'
    },
    placeholderText: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4
    },
    bookCard: {
        backgroundColor: '#1a365d',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    bookCardLeft: {
        flex: 1
    },
    bookCardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    bookCardSubtitle: {
        color: '#cbd5e0',
        fontSize: 12,
        marginTop: 4
    },
    bookCardArrow: {
        color: '#fff',
        fontSize: 22,
        marginLeft: 12
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4a5568',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 8
    },

    apptCard: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    apptTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    apptDateTime: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a365d'
    },
    apptStatus: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999
    },
    apptDetails: {
        fontSize: 13,
        color: '#4a5568',
        marginTop: 4
    },
    apptBranch: {
        fontSize: 11,
        color: '#718096',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    apptCancelLink: {
        marginTop: 10,
        alignSelf: 'flex-start'
    },
    apptCancelLinkText: {
        color: '#9b2c2c',
        fontSize: 12,
        fontWeight: '500'
    },

    emptyAppts: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center'
    },
    emptyApptsText: {
        color: '#718096',
        fontSize: 13,
        textAlign: 'center'
    },

    apptsLoading: {
        color: '#718096',
        fontSize: 13,
        textAlign: 'center',
        padding: 20
    },
    featureCard: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    featureCardTitle: {
        color: '#1a365d',
        fontSize: 15,
        fontWeight: '600'
    },
    featureCardSubtitle: {
        color: '#718096',
        fontSize: 12,
        marginTop: 3
    },
    featureCardArrow: {
        color: '#2c7a7b',
        fontSize: 20,
        marginLeft: 12
    }
});

export default styles;