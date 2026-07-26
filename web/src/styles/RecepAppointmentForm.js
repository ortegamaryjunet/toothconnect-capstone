const createRecepAppointmentFormStyles = ({
  isMobile = false,
  isVerySmall = false,
} = {}) => {
  return {
    pageWrapper: {
      width: '100%',
      minHeight: '100vh',
      padding: isVerySmall ? '24px 12px' : '28px 18px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      background:
        'radial-gradient(circle at 12% 20%, rgba(212, 175, 55, 0.16), transparent 28%),' +
        'radial-gradient(circle at 90% 10%, rgba(139, 101, 8, 0.10), transparent 28%),' +
        'linear-gradient(135deg, #ffffff, #fff8e1)',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    container: {
      width: '100%',
      maxWidth: 1180,
      background: '#ffffff',
      borderRadius: isVerySmall ? 18 : 22,
      padding: isMobile ? 20 : 26,
      boxShadow: '0 18px 45px rgba(139, 101, 8, 0.14)',
      boxSizing: 'border-box',
    },

    header: {
      position: 'relative',
      textAlign: 'center',
      padding: isVerySmall ? '4px 82px 20px' : '0 86px 24px',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: 28,
    },

    headerTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 22 : 28,
      color: '#0f172a',
      fontWeight: 800,
    },

    headerText: {
      margin: '8px 0 0',
      fontFamily: 'Arial, sans-serif',
      color: '#64748b',
      fontSize: 15,
      lineHeight: 1.5,
    },

    backBtn: {
      position: 'absolute',
      left: 0,
      top: 0,
      minWidth: 72,
      height: 42,
      padding: '0 16px',
      border: '1px solid #d4af37',
      background: '#d4af37',
      borderRadius: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: '0.2s ease',
      color: '#ffffff',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    backIcon: {
      fontSize: 23,
    },

    formSection: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1.05fr',
      gap: 26,
    },

    alertBox: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 18,
      padding: '13px 14px',
      border: '1px solid #fca5a5',
      borderRadius: 10,
      background: '#fff7ed',
      color: '#b91c1c',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      boxSizing: 'border-box',
    },

    formPanel: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 18,
      padding: isVerySmall ? 18 : 24,
      boxSizing: 'border-box',
    },

    panelTitle: {
      margin: '0 0 22px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 19,
      color: '#0f172a',
      fontWeight: 800,
    },

    field: {
      position: 'relative',
      marginBottom: 18,
    },

    label: {
      display: 'block',
      marginBottom: 8,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      fontSize: 14,
      fontWeight: 700,
    },

    required: {
      color: '#ef4444',
      fontWeight: 700,
    },

    helperText: {
      margin: '8px 0 0',
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    patientResults: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 74,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      padding: 6,
      background: '#ffffff',
      border: '1px solid #ead8a7',
      borderRadius: 12,
      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.14)',
      boxSizing: 'border-box',
    },

    patientResultItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 3,
      width: '100%',
      padding: '10px 11px',
      border: 'none',
      borderRadius: 9,
      background: '#ffffff',
      color: '#0f172a',
      cursor: 'pointer',
      textAlign: 'left',
      boxSizing: 'border-box',
    },

    patientResultName: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
    },

    patientResultContact: {
      color: '#64748b',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    input: {
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      padding: '12px 14px',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      transition: '0.2s ease',
      boxSizing: 'border-box',
    },

    inputError: {
      borderColor: '#dc2626',
      background: '#fff7f7',
    },

    fieldError: {
      margin: '7px 0 0',
      color: '#dc2626',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    inputWithIcon: {
      width: '100%',
      minHeight: 44,
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },

    inputInsideIcon: {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: '12px 14px',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: 'transparent',
      boxSizing: 'border-box',
    },

    inputIcon: {
      display: 'none',
    },

    leftInputIcon: {
      display: 'none',
    },

    inputInsideLeftIcon: {
      flex: 1,
      border: 'none',
      outline: 'none',
      padding: '12px 14px',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: 'transparent',
      boxSizing: 'border-box',
    },

    textarea: {
      height: 145,
      resize: 'vertical',
    },

    calendarContainer: {
      background: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      padding: isVerySmall ? 14 : 18,
      boxSizing: 'border-box',
    },

    calendar: {
      display: 'flex',
      flexDirection: 'column',
    },

    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      gap: 10,
    },

    calendarNav: {
      minWidth: 64,
      height: 38,
      padding: '0 14px',
      border: '1px solid #ead8a7',
      borderRadius: 12,
      background: '#fff8e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#8b6508',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
      flexShrink: 0,
    },

    calendarDropdowns: {
      display: 'flex',
      gap: 12,
      flex: 1,
      justifyContent: 'center',
    },

    calendarSelect: {
      minWidth: isVerySmall ? 100 : 130,
      padding: '9px 12px',
      borderRadius: 10,
      border: '1px solid #cbd5e1',
      background: '#ffffff',
      color: '#0f172a',
      outline: 'none',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      boxSizing: 'border-box',
    },

    currentMonthLabel: {
      textAlign: 'center',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 18,
      color: '#b8860b',
      marginBottom: 14,
      fontWeight: 800,
    },

    calendarTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 7px',
      tableLayout: 'fixed',
    },

    calendarTh: {
      fontFamily: 'Arial, sans-serif',
      color: '#334155',
      fontSize: 13,
      paddingBottom: 6,
      textAlign: 'center',
      fontWeight: 700,
    },

    calendarTd: {
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      width: 38,
      height: 38,
      padding: 0,
      borderRadius: 8,
      cursor: 'pointer',
      color: '#0f172a',
      transition: 'background 0.2s ease, color 0.2s ease',
      fontSize: isVerySmall ? 13 : 14,
      background: 'transparent',
      boxShadow: 'none',
      boxSizing: 'border-box',
      lineHeight: '38px',
      verticalAlign: 'middle',
    },

    calendarTdEmpty: {
      cursor: 'default',
      color: 'transparent',
      background: 'transparent',
      boxShadow: 'none',
      pointerEvents: 'none',
    },

    calendarTdDisabled: {
      color: '#94a3b8',
      cursor: 'not-allowed',
      background: 'transparent',
      boxShadow: 'none',
    },

    calendarTdToday: {
      background: '#fde68a',
      color: '#92400e',
      fontWeight: 800,
      boxShadow: 'none',
    },

    calendarTdSelected: {
      background: '#f59e0b',
      color: '#ffffff',
      fontWeight: 800,
      boxShadow: 'none',
    },

    calendarDivider: {
      height: 1,
      background: '#e5e7eb',
      margin: '12px 0 16px',
    },

    timeSection: {
      marginTop: 0,
    },

    timePickerRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      flexWrap: 'wrap',
    },

    timeInput: {
      width: isVerySmall ? '100%' : 220,
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      padding: '11px 12px',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
    },

    timeFieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },

    timeLabel: {
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    timeSelect: {
      width: isVerySmall ? 100 : 120,
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      padding: '11px 12px',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
    },

    timeColon: {
      paddingBottom: 12,
      color: '#0f172a',
      fontSize: 18,
      fontWeight: 700,
    },

    periodBox: {
      minWidth: 64,
      height: 42,
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      background: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      boxSizing: 'border-box',
      marginTop: 19,
    },

    warningBox: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      marginTop: 14,
      padding: '13px 14px',
      border: '1px solid #fca5a5',
      borderRadius: 10,
      background: '#fff7ed',
      boxSizing: 'border-box',
    },

    warningIcon: {
      color: '#ef4444',
      fontSize: 22,
      flexShrink: 0,
    },

    warningTitle: {
      display: 'block',
      color: '#dc2626',
      fontSize: 14,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      marginBottom: 3,
    },

    warningText: {
      margin: 0,
      color: '#475569',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    slotActionRow: {
      display: 'flex',
      gap: 8,
      marginTop: 6,
      flexWrap: 'wrap',
    },

    slotSuggestionBtn: {
      padding: '5px 14px',
      background: '#d4af37',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      fontWeight: 600,
    },

    slotNextBtn: {
      padding: '5px 14px',
      background: '#475569',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      fontWeight: 600,
    },

    suggestedWrapper: {
      marginTop: 14,
    },

    suggestedTitle: {
      margin: '0 0 10px',
      color: '#0f172a',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 800,
    },

    suggestedSlots: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
    },

    suggestedSlotBtn: {
      minWidth: 92,
      padding: '9px 14px',
      border: '1px solid #ead8a7',
      borderRadius: 8,
      background: '#ffffff',
      color: '#8b6508',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    slotGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
      marginBottom: 4,
    },

    slotChip: {
      padding: '8px 14px',
      border: 'none',
      borderRadius: 8,
      background: '#fff8e1',
      color: '#8b6508',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.15s ease, border-color 0.15s ease',
    },

    slotChipSelected: {
      background: '#d4af37',
      color: '#ffffff',
    },

    slotChipBlocked: {
      background: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed',
      textDecoration: 'line-through',
    },

    slotLoadingText: {
      margin: '10px 0 4px',
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    slotEmptyText: {
      margin: '10px 0 4px',
      color: '#94a3b8',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'italic',
    },

    infoRows: {
      marginTop: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    },

    infoRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    },

    infoIconBlue: {
      color: '#b8860b',
      fontSize: 17,
      marginTop: 2,
    },

    infoIconGray: {
      color: '#64748b',
      fontSize: 17,
      marginTop: 2,
    },

    infoText: {
      margin: 0,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
    },

    infoSubText: {
      margin: '4px 0 0',
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
    },

    buttonRow: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 14,
      marginTop: 28,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    clearBtn: {
      width: isVerySmall ? '100%' : 190,
      padding: 13,
      border: '1px solid #ead8a7',
      borderRadius: 10,
      background: '#ffffff',
      color: '#8b6508',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    submitBtn: {
      width: isVerySmall ? '100%' : 240,
      padding: 13,
      border: 'none',
      borderRadius: 10,
      background: '#d4af37',
      color: '#ffffff',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      transition: '0.2s ease',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    buttonDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      zIndex: 9999,
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: '#ffffff',
      padding: isVerySmall ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    backModalContent: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isVerySmall ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    modalIcon: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      backgroundColor: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#ef4444',
    },

    backModalIcon: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      background: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#dc2626',
    },

    modalIconText: {
      fontSize: 34,
    },

    modalTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      margin: '0 0 10px',
    },

    backModalTitle: {
      margin: '0 0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      fontWeight: 600,
    },

    modalText: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      margin: '0 0 24px',
      lineHeight: 1.5,
    },

    backModalText: {
      margin: '0 0 24px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.5,
    },

    modalDetailList: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 18,
    },

    modalDetailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 14,
      padding: '7px 0',
      borderBottom: '1px solid #f1f5f9',
      fontSize: 13,
      textAlign: 'left',
    },

    modalDetailLabel: {
      color: '#64748b',
      flexShrink: 0,
    },

    modalDetailValue: {
      color: '#0f172a',
      textAlign: 'right',
      wordBreak: 'break-word',
    },

    modalActions: {
      display: 'flex',
      gap: 14,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    backModalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    backModalButton: {
      minWidth: isVerySmall ? '100%' : 100,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
    },

    backCancelBtn: {
      background: '#e5e7eb',
      color: '#0f172a',
    },

    backConfirmBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    confirmNo: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      border: 'none',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      backgroundColor: '#f1f5f9',
      color: '#334155',
    },

    confirmYes: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      border: 'none',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },

    confirmSubmit: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      border: 'none',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      backgroundColor: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },
  };
};

export default createRecepAppointmentFormStyles;
