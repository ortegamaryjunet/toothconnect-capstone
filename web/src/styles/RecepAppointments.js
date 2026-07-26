const createRecepAppointmentsStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isCalendarCompact = false,
} = {}) => {
  const sidebarWidth = isVerySmall ? 70 : isMobile ? 80 : 250;

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
      paddingTop: 18,
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

    receptProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
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

    receptInfo: {
      display: isMobile ? 'none' : 'block',
    },

    receptName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
    },

    receptPosition: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
    },

    mainContent: {
      padding: isVerySmall
        ? '88px 12px 18px'
        : isMobile
          ? '100px 18px 24px'
          : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    pageHero: {
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

    heroTag: {
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
      fontSize: isVerySmall ? 20 : isMobile ? 23 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: isVerySmall ? 13 : 14,
      lineHeight: 1.5,
    },

    heroIcon: {
      width: 90,
      height: 90,
      minWidth: 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIconText: {
      fontSize: 42,
      color: '#ffffff',
    },

    viewTabs: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: 6,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 18,
      marginBottom: 18,
      width: isSmallScreen ? '100%' : 'fit-content',
      overflowX: 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
    },

    viewTabButton: {
      height: 42,
      padding: '0 18px',
      border: 'none',
      borderRadius: 12,
      background: 'transparent',
      color: '#64748b',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      whiteSpace: 'nowrap',
    },

    viewTabButtonActive: {
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 8px 18px rgba(212, 175, 55, 0.28)',
    },

    queueWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    },

    calendarView: {
      display: 'block',
    },

    dashboardCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall ? 18 : 22,
      padding: isVerySmall ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    appointmentCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall ? 18 : 22,
      padding: isVerySmall ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 18,
      marginBottom: 18,
      flexDirection: isCalendarCompact ? 'column' : 'row',
      width: '100%',
    },

    listHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 18,
      marginBottom: 18,
    },

    cardTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 18,
      color: '#0f172a',
      margin: 0,
    },

    cardSubtitle: {
      marginTop: 3,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
    },

    listCount: {
      minWidth: 34,
      height: 34,
      padding: '0 10px',
      borderRadius: 999,
      background: '#eff6ff',
      color: '#b8860b',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
    },

    filters: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      gap: 15,
      flexDirection: isSmallScreen ? 'column' : 'row',
    },

    leftActions: {
      display: 'flex',
      flex: 1,
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 350,
      height: 43,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 13px',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#b8860b',
    },

    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      minWidth: 0,
    },

    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: isSmallScreen ? '100%' : 'auto',
      flexDirection: isMobile ? 'column' : 'row',
    },

    select: {
      height: 43,
      minWidth: isSmallScreen ? '100%' : 170,
      width: isSmallScreen ? '100%' : 'auto',
      padding: '0 13px',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#ffffff',
      outline: 'none',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },

    addAppt: {
      height: 43,
      padding: '0 16px',
      borderRadius: 14,
      border: '1px solid #d4af37',
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      whiteSpace: 'nowrap',
      textDecoration: 'none',
      width: isMobile ? '100%' : 'auto',
      boxSizing: 'border-box',
    },

    appointmentsRow: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : 'minmax(0, 1.35fr) minmax(360px, 0.85fr)',
      gap: 18,
      alignItems: 'flex-start',
    },

    appointmentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    appointment: {
      border: '1px solid #edf0f5',
      background: '#f8fafc',
      borderRadius: 18,
      padding: 16,
      boxSizing: 'border-box',
    },

    pendingStyle: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 14,
      flexDirection: isMobile ? 'column' : 'row',
    },

    appointmentInfo: {
      display: 'flex',
      gap: 14,
      minWidth: 0,
      width: '100%',
    },

    dateBox: {
      width: 58,
      minWidth: 58,
      borderRadius: 16,
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      color: '#2563eb',
      textAlign: 'center',
      padding: '8px 6px',
      boxSizing: 'border-box',
    },

    week: {
      fontSize: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    day: {
      fontSize: 24,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      lineHeight: 1.1,
    },

    infoContent: {
      minWidth: 0,
      flex: 1,
    },

    patientName: {
      display: 'block',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#0f172a',
      fontSize: 15,
      marginBottom: 10,
    },

    gridInfo: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(2, minmax(0, 1fr))',
      gap: '8px 18px',
    },

    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: '#475569',
      fontSize: 13,
      minWidth: 0,
    },

    infoRowIcon: {
      color: '#b8860b',
      fontSize: 15,
    },

    appointmentType: {
      display: 'inline-flex',
      marginBottom: 8,
      padding: '4px 9px',
      borderRadius: 999,
      background: '#e0f2fe',
      color: '#0369a1',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 11,
    },

    editActions: {
      flexShrink: 0,
    },

    editDropdown: {
      position: 'relative',
    },

    editBtn: {
      minWidth: 92,
      height: 38,
      borderRadius: 12,
      border: '1px solid #bfdbfe',
      background: '#eff6ff',
      color: '#b8860b',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      cursor: 'pointer',
    },

    editDropdownMenu: {
      position: 'absolute',
      top: 46,
      right: 0,
      width: 220,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      boxShadow: '0 18px 35px rgba(15, 23, 42, 0.12)',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxSizing: 'border-box',
    },

    editDropdownItem: {
      padding: '11px 12px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 13,
      color: '#334155',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif',
    },

    editDropdownDanger: {
      color: '#dc2626',
    },

    queueAppointment: {
      background: '#ffffff',
    },

    queueContent: {
      marginBottom: 14,
      overflowWrap: 'anywhere',
    },

    queueSub: {
      marginTop: 6,
      color: '#475569',
      fontSize: 13,
    },

    actions: {
      display: 'flex',
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'stretch',
      width: '100%',
    },

    btn: {
      height: 38,
      padding: '0 14px',
      borderRadius: 12,
      border: 'none',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
      boxSizing: 'border-box',
      whiteSpace: isVerySmall ? 'normal' : 'nowrap',
    },

    btnPay: {
      background: '#fff7ed',
      color: '#ea580c',
      border: '1px solid #fed7aa',
    },

    btnPayEnabled: {
      background: '#ea580c',
      color: '#ffffff',
      border: '1px solid #ea580c',
    },

    btnProceed: {
      background: '#ecfdf5',
      color: '#16a34a',
      border: '1px solid #bbf7d0',
    },

    btnProceedCompleted: {
      background: '#bbf7d0',
      color: '#166534',
      border: '1px solid #86efac',
      cursor: 'not-allowed',
    },

    emptyState: {
      textAlign: 'center',
      padding: '28px 15px',
      color: '#64748b',
      background: '#f8fafc',
      border: '1px dashed #cbd5e1',
      borderRadius: 16,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
      flexWrap: 'wrap',
    },

    pageBtn: {
      width: 35,
      height: 35,
      border: '1px solid #f3d46b',
      borderRadius: 11,
      background: '#fff8e1',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: 0,
    },

    pageBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

    pageInfo: {
      minWidth: 100,
      textAlign: 'center',
      fontSize: 14,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    calendarActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: isCalendarCompact ? '100%' : 'auto',
      justifyContent: isCalendarCompact ? 'space-between' : 'flex-start',
    },

    calendarMonthTitle: {
      minWidth: 160,
      textAlign: 'center',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#0f172a',
      fontSize: 18,
      margin: 0,
    },

    calendarNavBtn: {
      width: 38,
      height: 38,
      border: '1px solid #dbeafe',
      borderRadius: 12,
      background: '#eff6ff',
      color: '#b8860b',
      cursor: 'pointer',
    },

    calendarLayout: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : 'minmax(0, 1.4fr) minmax(330px, 0.6fr)',
      gap: 20,
    },

    calendarPanel: {
      border: '1px solid #edf0f5',
      borderRadius: 18,
      background: '#f8fafc',
      padding: isVerySmall ? 12 : 18,
      boxSizing: 'border-box',
      minWidth: 0,
    },

    schedulePanel: {
      border: '1px solid #edf0f5',
      borderRadius: 18,
      background: '#f8fafc',
      padding: isVerySmall ? 12 : 18,
      boxSizing: 'border-box',
      minWidth: 0,
    },

    calendarWeekdays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: isCalendarCompact ? 6 : 10,
      marginBottom: 10,
      textAlign: 'center',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
      color: '#64748b',
    },

    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: isCalendarCompact ? 6 : 10,
    },

    calendarDay: {
      position: 'relative',
      minHeight: isCalendarCompact ? 54 : 78,
      border: '1px solid #e5e7eb',
      borderRadius: isCalendarCompact ? 12 : 16,
      background: '#ffffff',
      color: '#0f172a',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isCalendarCompact ? 13 : 15,
      cursor: 'pointer',
      textAlign: 'left',
      padding: isCalendarCompact ? 8 : 12,
      boxSizing: 'border-box',
    },

    calendarDayActive: {
      background: '#b8860b',
      borderColor: '#b8860b',
      color: '#ffffff',
    },

    calendarDayMuted: {
      color: '#94a3b8',
      background: '#f1f5f9',
      cursor: 'not-allowed',
    },

    calendarEventDot: {
      position: 'absolute',
      left: 12,
      bottom: 12,
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: '#2563eb',
    },

    calendarEventDotActive: {
      background: '#ffffff',
    },

    schedulePanelHeader: {
      marginBottom: 16,
    },

    schedulePanelTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#0f172a',
      fontSize: 18,
      margin: 0,
    },

    schedulePanelText: {
      marginTop: 4,
      color: '#64748b',
      fontSize: 13,
      marginBottom: 0,
    },

    dentistList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 14,
    },

    dentistCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 16,
      padding: 14,
    },

    dentistLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },

    dentistAvatar: {
      width: 42,
      height: 42,
      borderRadius: 14,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    dentistName: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 15,
      color: '#0f172a',
      marginBottom: 5,
      marginTop: 0,
    },

    dentistStatus: {
      display: 'inline-flex',
      padding: '4px 9px',
      borderRadius: 999,
      fontSize: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    dentistStatusAvailable: {
      background: '#dcfce7',
      color: '#15803d',
    },

    dentistStatusBusy: {
      background: '#fef3c7',
      color: '#b45309',
    },

    dentistStatusUnavailable: {
      background: '#fee2e2',
      color: '#b91c1c',
    },

    bookBtn: {
      height: 36,
      padding: '0 14px',
      border: 'none',
      borderRadius: 11,
      background: '#b8860b',
      color: '#ffffff',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      cursor: 'pointer',
    },

    bookBtnDisabled: {
      background: '#cbd5e1',
      cursor: 'not-allowed',
    },

    dentistScheduleList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    calendarEmptyState: {
      minHeight: 220,
      border: '1px dashed #cbd5e1',
      borderRadius: 16,
      background: '#ffffff',
      color: '#64748b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 22,
      boxSizing: 'border-box',
    },

    calendarEmptyIcon: {
      fontSize: 38,
      color: '#b8860b',
      marginBottom: 12,
    },

    calendarEmptyTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#0f172a',
      marginBottom: 5,
      marginTop: 0,
    },

    calendarEmptyText: {
      margin: 0,
      fontSize: 13,
      color: '#64748b',
    },

    scheduleItem: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 16,
      padding: 14,
    },

    scheduleItemTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 6,
    },

    scheduleTime: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#b8860b',
      fontSize: 14,
      marginBottom: 0,
    },

    scheduleStatusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
      padding: '3px 9px',
      borderRadius: 999,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 11,
      whiteSpace: 'nowrap',
    },

    scheduleStatusUpcoming: {
      background: '#dbeafe',
      color: '#1d4ed8',
    },

    scheduleStatusDone: {
      background: '#dcfce7',
      color: '#15803d',
    },

    scheduleStatusNoShow: {
      background: '#fee2e2',
      color: '#b91c1c',
    },

    scheduleStatusNeutral: {
      background: '#f1f5f9',
      color: '#475569',
    },

    serviceKitCalendarButton: {
      marginTop: 6,
      marginBottom: 6,
      height: 28,
      padding: '0 10px',
      borderRadius: 9,
      border: '1px solid #86efac',
      background: '#f0fdf4',
      color: '#166534',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 11,
      textTransform: 'none',
      cursor: 'pointer',
    },

    scheduleName: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#0f172a',
      fontSize: 15,
      marginBottom: 5,
    },

    scheduleDetail: {
      color: '#64748b',
      fontSize: 13,
      marginTop: 4,
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isVerySmall ? '100%' : 390,
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
      boxSizing: 'border-box',
    },

    modalContentReschedule: {
      width: '100%',
      maxWidth: 980,
      maxHeight: '90vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 18 : 22,
      textAlign: 'left',
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
      boxSizing: 'border-box',
    },

    modalHeaderRow: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 14,
    },

    modalHeaderTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 18 : 22,
      color: '#0f172a',
      margin: 0,
    },

    modalHeaderSub: {
      margin: '6px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.4,
    },

    modalCloseBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#334155',
      flexShrink: 0,
    },

    alertErrorInline: {
      marginBottom: 14,
      color: '#b91c1c',
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: 12,
      padding: '10px 12px',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
    },

    reasonHeaderRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },

    reasonTemplateBtn: {
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      color: '#0f172a',
      height: 30,
      padding: '0 10px',
      borderRadius: 10,
      fontSize: 12,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },

    rescheduleActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 16,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    modalSecondaryBtn: {
      height: 44,
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      cursor: 'pointer',
      padding: '0 16px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
    },

    modalPrimaryBtn: {
      height: 44,
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      cursor: 'pointer',
      padding: '0 18px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
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
      fontSize: 30,
      lineHeight: 1,
    },

    modalTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 22,
      color: '#0f172a',
      marginBottom: 10,
      marginTop: 0,
    },

    modalText: {
      fontSize: 15,
      color: '#64748b',
      marginBottom: 24,
      marginTop: 0,
      lineHeight: 1.5,
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    modalButton: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
      fontWeight: 'bold',
    },
    
    profileDropdownWrapper: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },

    profileDropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '100%',
      minWidth: 170,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: 8,
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
      zIndex: 300,
      boxSizing: 'border-box',
    },

    viewProfileButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: '#eff6ff',
      color: '#2563eb',
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      textDecoration: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
  };
};

export default createRecepAppointmentsStyles;
