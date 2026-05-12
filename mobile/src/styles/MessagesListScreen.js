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
    newBtn: {
        color: '#fff',
        fontSize: 14
    },

    body: {
        flex: 1
    },

    threadRow: {
        backgroundColor: '#fff',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#edf2f7'
    },
    threadInitial: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#bee3f8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    threadInitialText: {
        color: '#2c5282',
        fontSize: 15,
        fontWeight: '600'
    },
    threadInfo: {
        flex: 1
    },
    threadTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2
    },
    threadName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a365d'
    },
    threadTime: {
        fontSize: 11,
        color: '#a0aec0'
    },
    threadBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    threadPreview: {
        fontSize: 13,
        color: '#718096',
        flex: 1,
        marginRight: 8
    },
    unreadBadge: {
        backgroundColor: '#3182ce',
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center'
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700'
    },

    empty: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        color: '#718096',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16
    },
    emptyButton: {
        backgroundColor: '#3182ce',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },

    contactPickerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    contactPicker: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        maxHeight: '70%'
    },
    contactPickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a365d',
        marginBottom: 4
    },
    contactPickerSubtitle: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 16
    },
    contactRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#edf2f7'
    },
    contactName: {
        fontSize: 14,
        color: '#1a365d',
        fontWeight: '500'
    },
    contactMeta: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2
    },
    contactCloseBtn: {
        marginTop: 16,
        alignItems: 'center'
    },
    contactCloseBtnText: {
        color: '#718096',
        fontSize: 13
    },

    loading: {
        color: '#718096',
        textAlign: 'center',
        padding: 40
    }
});

export default styles;