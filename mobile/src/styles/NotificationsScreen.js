import { StyleSheet, Platform } from "react-native";

const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f7f4',
    },

    mainWrapper: {
        flex: 1,
        position: 'relative',
    },

    dashboardArea: {
        flex: 1,
    },

    header: {
        height: 58,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: 18,
        backgroundColor: '#ffffff',
    },
    menuButton: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonText: {
        fontSize: 30,
        color: '#b47a00',
        fontWeight: '900',
        lineHeight: 34,
    },
    headerTitle: {
        flex: 1,
        marginLeft: 12,
        fontSize: 23,
        fontWeight: '900',
        fontFamily: SERIF,
        color: '#1f1f1f',
    },
    markAllBtn: {
        paddingHorizontal: 4,
    },
    markAll: {
        color: '#c88a11',
        fontSize: 13,
        fontWeight: '600',
    },
    headerPlaceholder: {
        width: 36,
    },

    body: {
        flex: 1,
    },

    item: {
        backgroundColor: '#ffffff',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e8e0d0'
    },
    itemUnread: {
        backgroundColor: '#fffbf0',
        borderLeftWidth: 3,
        borderLeftColor: '#c88a11'
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f1f1f',
        fontFamily: 'Georgia, serif',
        marginBottom: 3
    },
    itemBody: {
        fontSize: 13,
        color: '#555555',
        lineHeight: 18
    },
    itemMeta: {
        fontSize: 11,
        color: '#999999',
        marginTop: 6
    },
    itemTypeTag: {
        fontSize: 10,
        color: '#b47a00',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6
    },

    unreadBar: {
        backgroundColor: '#fffbf0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e8e0d0',
    },
    unreadBarText: {
        color: '#c88a11',
        fontSize: 13,
        fontWeight: '600',
    },

    empty: {
        color: '#999999',
        textAlign: 'center',
        padding: 40,
        fontSize: 14,
        fontStyle: 'italic'
    },
    loading: {
        color: '#999999',
        textAlign: 'center',
        padding: 40
    }
});

export default styles;
