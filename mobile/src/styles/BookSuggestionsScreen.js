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
        flex: 1,
        color: '#1f1f1f',
        fontSize: 20,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    keyboardArea: {
        flex: 1
    },

    body: {
        flex: 1,
    },
    bodyContent: {
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 42
    },

    contextCard: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ead7b2',
        marginBottom: 22
    },
    contextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7
    },
    contextLabel: {
        fontSize: 12,
        color: '#777777',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        fontWeight: '800'
    },
    contextValue: {
        fontSize: 15,
        color: '#1f1f1f',
        fontWeight: '700',
        textAlign: 'right',
        flex: 1,
        marginLeft: 14
    },

    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#b47a00',
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.3
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#777777',
        marginBottom: 16,
        fontWeight: '500'
    },

    suggestionCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eeeeee'
    },
    suggestionCardBest: {
        borderColor: '#e4cf88'
    },
    suggestionTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    suggestionMainInfo: {
        flex: 1,
        paddingRight: 12
    },
    suggestionDate: {
        fontSize: 14,
        color: '#1f1f1f',
        fontWeight: '800',
        marginTop: 4
    },
    suggestionTime: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1f1f1f',
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    suggestionDentist: {
        fontSize: 14,
        color: '#333333',
        marginTop: 4,
        fontWeight: '600'
    },

    bestBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#f6efe3',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 999,
        marginBottom: 6
    },
    bestBadgeText: {
        color: '#8a650e',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5
    },

    breakdownPanel: {
        borderTopWidth: 1,
        borderTopColor: '#eeeeee',
        paddingTop: 11,
        marginTop: 3
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 4
    },
    breakdownReason: {
        fontSize: 13,
        color: '#555555',
        flex: 1,
        lineHeight: 18,
        fontWeight: '500'
    },
    pickButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 11,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 14,
        borderWidth: 1,
        borderColor: '#c98904'
    },
    pickButtonBest: {
        backgroundColor: '#c98904',
        borderColor: '#c98904'
    },
    pickButtonText: {
        color: '#b47a00',
        fontSize: 14,
        fontWeight: '900'
    },
    pickButtonTextBest: {
        color: '#ffffff'
    },

    moreSlotsButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        borderRadius: 9,
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 42,
        borderWidth: 1,
        borderColor: '#c98904'
    },
    moreSlotsText: {
        color: '#b47a00',
        fontSize: 14,
        fontWeight: '900'
    },

    preferredCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ead7b2',
        borderRadius: 10,
        padding: 14,
        marginTop: -24,
        marginBottom: 42
    },
    preferredTitle: {
        color: '#1f1f1f',
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 4
    },
    preferredSub: {
        color: '#777777',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 17,
        marginBottom: 12
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10
    },
    inputGroup: {
        flex: 1
    },
    inputLabel: {
        color: '#777777',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 5
    },
    pickerField: {
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 11,
        minHeight: 42,
        justifyContent: 'center'
    },
    pickerFieldText: {
        color: '#1f1f1f',
        fontSize: 13,
        fontWeight: '700'
    },
    slotStatusText: {
        backgroundColor: '#fff3f0',
        borderWidth: 1,
        borderColor: '#f0c6b8',
        borderRadius: 8,
        color: '#993c1d',
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 17,
        paddingVertical: 9,
        paddingHorizontal: 10,
        marginTop: 10
    },
    searchSlotsButton: {
        backgroundColor: '#c98904',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 11,
        marginTop: 12
    },
    searchSlotsButtonDisabled: {
        backgroundColor: '#d9c08c'
    },
    searchSlotsButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900'
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.38)',
        justifyContent: 'flex-end'
    },
    pickerSheet: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 2,
        borderTopColor: '#c88a11',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 26,
        maxHeight: '70%'
    },
    pickerHandle: {
        width: 34,
        height: 4,
        borderRadius: 999,
        backgroundColor: '#e0ddd5',
        alignSelf: 'center',
        marginBottom: 14
    },
    pickerTitle: {
        color: '#1f1f1f',
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'
    },
    calendarHeaderRow: {
        flexDirection: 'row',
        marginBottom: 8
    },
    calendarWeekday: {
        flex: 1,
        textAlign: 'center',
        color: '#777777',
        fontSize: 10,
        fontWeight: '900'
    },
    calendarWeekRow: {
        flexDirection: 'row',
        marginBottom: 7
    },
    calendarDay: {
        flex: 1,
        minHeight: 38,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
        borderWidth: 1,
        borderColor: '#eeeeee',
        borderRadius: 8,
        backgroundColor: '#ffffff'
    },
    calendarDaySelected: {
        borderColor: '#c98904',
        backgroundColor: '#fdf3df'
    },
    calendarDayEmpty: {
        flex: 1,
        minHeight: 38,
        marginHorizontal: 2
    },
    calendarDayText: {
        color: '#333333',
        fontSize: 13,
        fontWeight: '700'
    },
    calendarDayTextSelected: {
        color: '#8a650e',
        fontWeight: '900'
    },
    timePickerRow: {
        flexDirection: 'row',
        gap: 10
    },
    timePickerColumn: {
        flex: 1,
        maxHeight: 250
    },
    timePickerOption: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#eeeeee',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 7,
        alignItems: 'center'
    },
    timePickerOptionSelected: {
        borderColor: '#c98904',
        backgroundColor: '#fdf3df'
    },
    timePickerOptionText: {
        color: '#333333',
        fontSize: 13,
        fontWeight: '700'
    },
    timePickerOptionTextSelected: {
        color: '#8a650e',
        fontWeight: '900'
    },
    timePickerDone: {
        backgroundColor: '#c98904',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 11,
        marginTop: 12
    },
    timePickerDoneText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900'
    },

    loading: {
        color: '#888888',
        fontSize: 13,
        textAlign: 'center',
        paddingVertical: 40,
        fontWeight: '600'
    },
    empty: {
        color: '#777777',
        fontSize: 14,
        textAlign: 'center',
        padding: 28,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eeeeee',
        lineHeight: 21,
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
