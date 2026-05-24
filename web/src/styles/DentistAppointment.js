const createDentistAppointmentStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
} = {}) => {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : 230;

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      background: '#f5f7fb',
      fontFamily: 'Arial, sans-serif',
      color: '#172033',
      display: 'flex',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },

    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      width: sidebarWidth,
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      padding: isMobile ? '18px 10px' : '22px 16px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: 22,
      marginBottom: 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isMobile ? 55 : 125,
      height: 'auto',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: 12,
      padding: '13px 14px',
      borderRadius: 14,
      textDecoration: 'none',
      color: '#475569',
      transition: '0.2s ease',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    menuItemIcon: {
      marginRight: isMobile ? 0 : 12,
      fontSize: 18,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile ? 'none' : 'inline',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.24)',
    },

    logoutSection: {
      marginTop: 'auto',
      paddingTop: isTablet ? 14 : 18,
      borderTop: '1px solid #e5e7eb',
    },

    logoutItem: {
      color: '#dc2626',
    },

    mainContainer: {
      marginLeft: sidebarWidth,
      minHeight: '100vh',
      width: `calc(100% - ${sidebarWidth}px)`,
      maxWidth: `calc(100% - ${sidebarWidth}px)`,
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },

    topHeader: {
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      height: 78,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isMobile ? '0 14px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: '100%',
    },

    doctorProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 13,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarIcon: {
      fontSize: 18,
    },

    doctorInfo: {
      display: isMobile ? 'none' : 'block',
    },

    doctorName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
    },

    doctorSpecialization: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
    },

    mainContent: {
      padding: isMobile ? '96px 14px 22px' : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroCard: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 170 : 225,
      borderRadius: isMobile ? 22 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 20 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: 'left',
      boxSizing: 'border-box',
      boxShadow: '0 18px 40px rgba(185, 140, 20, 0.22)',
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 16,
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 23 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
    },

    heroIcon: {
      width: isMobile ? 70 : 90,
      height: isMobile ? 70 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isMobile ? 32 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    appointmentLayout: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '390px 1fr',
      gap: 22,
      alignItems: 'start',
      width: '100%',
      boxSizing: 'border-box',
    },

    calendarCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      padding: isMobile ? 14 : 22,
      height: 'fit-content',
      minHeight: isSmallScreen ? 'auto' : 520,
      boxSizing: 'border-box',
    },

    calendarHeader: {
      marginBottom: 18,
    },

    cardTitle: {
      fontSize: isMobile ? 16 : 18,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    cardSubtitle: {
      fontSize: 13,
      color: '#64748b',
      marginTop: 3,
      marginBottom: 0,
      fontFamily: 'Arial, sans-serif',
    },

    controls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isMobile ? 8 : 10,
    },

    calendarNav: {
      width: isMobile ? 36 : 40,
      height: isMobile ? 36 : 40,
      border: 'none',
      borderRadius: 13,
      background: '#eff6ff',
      color: '#2563eb',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    calendarSelects: {
      display: 'flex',
      gap: 10,
      flex: isMobile ? 1 : 'initial',
    },

    calendarSelect: {
      height: 40,
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      background: '#ffffff',
      padding: '0 10px',
      color: '#334155',
      outline: 'none',
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    currentMonthLabel: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: '#2563eb',
      margin: '22px 0 18px',
      fontFamily: 'Arial, sans-serif',
    },

    calendarTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: isMobile ? 3 : 5,
      tableLayout: 'fixed',
    },

    calendarTh: {
      fontSize: isMobile ? 12 : 13,
      color: '#64748b',
      paddingBottom: 8,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },

    calendarTd: {
      height: isMobile ? 36 : 42,
      textAlign: 'center',
      borderRadius: isMobile ? 10 : 13,
      cursor: 'pointer',
      fontSize: isMobile ? 12 : 14,
      color: '#334155',
      transition: '0.2s ease',
      fontFamily: 'Arial, sans-serif',
    },

    calendarDisabled: {
      color: '#cbd5e1',
      cursor: 'not-allowed',
    },

    calendarToday: {
      background: '#dbeafe',
      color: '#2563eb',
      fontWeight: 700,
    },

    calendarSelected: {
      background: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
    },

    appointmentContent: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 18,
      minWidth: 0,
      boxSizing: 'border-box',
    },

    statusGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 18,
    },

    statusCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      minHeight: 95,
      padding: isMobile ? 14 : 18,
      boxSizing: 'border-box',
    },

    confirmedCard: {
      borderLeft: '5px solid #22c55e',
    },

    waitingCard: {
      borderLeft: '5px solid #f59e0b',
    },

    noShowCard: {
      borderLeft: '5px solid #ef4444',
    },

    statusCardLabel: {
      fontSize: 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    statusCardValue: {
      fontSize: 31,
      marginTop: 7,
      marginBottom: 0,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      padding: isMobile ? 14 : 22,
      minWidth: 0,
      minHeight: 360,
      boxSizing: 'border-box',
    },

    tableHeader: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
      gap: 15,
      flexDirection: isMobile ? 'column' : 'row',
    },

    dropdownStatus: {
      height: 40,
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      background: '#ffffff',
      padding: '0 12px',
      color: '#334155',
      outline: 'none',
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    doctorTable: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 820,
    },

    tableHead: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontSize: 14,
      color: '#64748b',
      fontWeight: 700,
      background: '#f8fafc',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableCell: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontSize: 14,
      color: '#334155',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableRow: {
      background: '#ffffff',
    },

    statusPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: 50,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    statusPillConfirmed: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusPillWaiting: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusPillNoShow: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    reviewKitButton: {
      border: '1px solid #bfdbfe',
      background: '#eff6ff',
      color: '#2563eb',
      borderRadius: 10,
      padding: '7px 12px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    noActionText: {
      color: '#94a3b8',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    noteButton: {
      border: '1px solid #bbf7d0',
      background: '#f0fdf4',
      color: '#15803d',
      borderRadius: 10,
      padding: '7px 12px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    noteButtonDisabled: {
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      color: '#94a3b8',
      cursor: 'not-allowed',
      opacity: 0.8,
    },

    emptyRow: {
      textAlign: 'center',
      color: '#64748b',
      padding: 17,
      fontSize: 14,
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
    },

    pageBtn: {
      width: isMobile ? 33 : 35,
      height: isMobile ? 33 : 35,
      border: '1px solid #dbeafe',
      borderRadius: 11,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },

    pageBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

    pageInfo: {
      minWidth: 100,
      textAlign: 'center',
      fontSize: isMobile ? 13 : 14,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '92%' : 380,
      maxWidth: 380,
      background: '#ffffff',
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? '24px 18px' : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    modalIcon: {
      width: 70,
      height: 70,
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: '#fee2e2',
      color: '#dc2626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalIconText: {
      fontSize: 28,
    },

    modalTitle: {
      fontSize: 21,
      color: '#0f172a',
      marginBottom: 8,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    modalText: {
      fontSize: 15,
      color: '#64748b',
      marginBottom: 24,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    modalActions: {
      display: 'flex',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    modalButton: {
      flex: 1,
      border: 'none',
      borderRadius: 12,
      padding: 12,
      cursor: 'pointer',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: 'black',
      fontWeight: 'bold',
    },

    noteModalContent: {
      width: isMobile ? '94%' : 520,
      maxWidth: 520,
      background: '#ffffff',
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 18 : 24,
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    noteModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 14,
      marginBottom: 18,
    },

    noteModalTitle: {
      margin: 0,
      fontSize: isMobile ? 18 : 21,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    noteModalSubtitle: {
      marginTop: 5,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    noteModalClose: {
      width: 34,
      height: 34,
      borderRadius: 10,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      color: '#334155',
      cursor: 'pointer',
      fontSize: 22,
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'Arial, sans-serif',
    },

    noteDetailsBox: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #edf0f5',
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
      boxSizing: 'border-box',
    },

    noteDetailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
    },

    noteDetailLabel: {
      fontSize: 12,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    noteDetailValue: {
      fontSize: 13,
      color: '#0f172a',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    noteLabel: {
      display: 'block',
      fontSize: 13,
      fontWeight: 700,
      color: '#334155',
      marginBottom: 8,
      fontFamily: 'Arial, sans-serif',
    },

    noteTextarea: {
      width: '100%',
      minHeight: 140,
      resize: 'vertical',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: 12,
      color: '#0f172a',
      outline: 'none',
      fontSize: 14,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    noteModalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 18,
      flexDirection: isMobile ? 'column' : 'row',
    },

    noteActionButton: {
      border: 'none',
      borderRadius: 12,
      padding: '11px 16px',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    noteCancelBtn: {
      background: '#f1f5f9',
      color: '#0f172a',
    },

    noteSaveBtn: {
      background: '#2563eb',
      color: '#ffffff',
    },

    notificationBadge: {
      marginLeft: 'auto',
      background: '#dc2626',
      color: '#ffffff',
      borderRadius: 999,
      padding: '2px 7px',
      fontSize: 11,
      fontWeight: 700,
      display: isMobile || isTablet ? 'none' : 'inline-flex',
    },
        serviceKitToolbar: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    kitNoteText: {
      margin: 0,
      fontSize: 12,
      color: '#64748b',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    kitAddButton: {
      border: '1px solid #bfdbfe',
      background: '#eff6ff',
      color: '#2563eb',
      borderRadius: 10,
      padding: '8px 12px',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    kitManualPanel: {
      background: '#f8fafc',
      border: '1px solid #edf0f5',
      borderRadius: 16,
      padding: 14,
      marginBottom: 14,
      boxSizing: 'border-box',
    },

    kitManualGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1.4fr 90px auto',
      gap: 10,
      alignItems: 'end',
    },

    kitManualField: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0,
    },

    kitManualLabel: {
      fontSize: 12,
      color: '#334155',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    kitManualSelect: {
      width: '100%',
      height: 38,
      border: '1px solid #dbe3ef',
      borderRadius: 10,
      background: '#ffffff',
      padding: '0 10px',
      color: '#334155',
      outline: 'none',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    kitQtyInput: {
      width: '100%',
      height: 38,
      border: '1px solid #dbe3ef',
      borderRadius: 10,
      background: '#ffffff',
      padding: '0 10px',
      color: '#334155',
      outline: 'none',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    kitInlineError: {
      margin: '10px 0 0',
      color: '#ef4444',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    kitManualBadge: {
      display: 'inline-flex',
      marginLeft: 8,
      padding: '2px 7px',
      borderRadius: 999,
      background: '#e0f2fe',
      color: '#0369a1',
      fontSize: 10,
      fontWeight: 700,
      verticalAlign: 'middle',
      fontFamily: 'Arial, sans-serif',
    },
  };
};

export default createDentistAppointmentStyles;