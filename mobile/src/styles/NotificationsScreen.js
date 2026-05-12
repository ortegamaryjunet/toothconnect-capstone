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
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerLeft: {
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
    markAll: {
        color: '#cbd5e0',
        fontSize: 13
    },

    body: {
        flex: 1
    },

    item: {
        backgroundColor: '#fff',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#edf2f7'
    },
    itemUnread: {
        backgroundColor: '#ebf8ff',
        borderLeftWidth: 3,
        borderLeftColor: '#3182ce'
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a365d',
        marginBottom: 3
    },
    itemBody: {
        fontSize: 13,
        color: '#4a5568',
        lineHeight: 18
    },
    itemMeta: {
        fontSize: 11,
        color: '#a0aec0',
        marginTop: 6
    },
    itemTypeTag: {
        fontSize: 10,
        color: '#4a5568',
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6
    },

    empty: {
        color: '#a0aec0',
        textAlign: 'center',
        padding: 40,
        fontSize: 14,
        fontStyle: 'italic'
    },
    loading: {
        color: '#718096',
        textAlign: 'center',
        padding: 40
    }
});

export default styles;