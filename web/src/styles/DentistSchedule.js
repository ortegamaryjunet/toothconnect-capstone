export default function createDentistScheduleStyles({ isMobile, isTablet, isSmallScreen }) {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : 230;

  return {
    page: {
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f4f7fb',
      fontFamily: "Arial, sans-serif",
      color: '#0f1b3d',
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

    notificationBadge: {
      marginLeft: 'auto',
      backgroundColor: '#ef4444',
      color: '#fff',
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 7px',
    },

    logoutSection: {
      marginTop: 'auto',
      paddingTop: isTablet ? 14 : 18,
      borderTop: '1px solid #e5e7eb',
    },

    logoutItem: {
      color: '#ef4444',
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
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
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

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px, 0.7fr) minmax(280px, 0.95fr)',
      gap: '12px',
      marginBottom: '16px',
      alignItems: 'stretch',
    },

    infoCard: {
      fontFamily: "Arial, sans-serif",
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '10px 14px',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      minHeight: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },

    infoLabel: {
      fontFamily: "Arial, sans-serif",
      margin: '0 0 4px',
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '600',
    },

    infoValue: {
      fontFamily: "Arial, sans-serif",
      margin: 0,
      fontSize: '15px',
      color: 'black'
    },

    mainGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '14px',
      marginBottom: '14px',
    },

    card: {
      backgroundColor: '#ffffff',
      borderRadius: '18px',
      border: '1px solid #e2e8f0',
      padding: '22px',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
    },

    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },

    sectionTitle: {
      margin: '0 0 16px',
      fontSize: '18px',
      fontWeight: '800',
      color: '#0f1b3d',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },

    th: {
      padding: '13px 14px',
      backgroundColor: '#f1f5fb',
      color: '#0f1b3d',
      fontSize: '12px',
      fontWeight: '800',
      textAlign: 'left',
    },

    tr: {
      borderBottom: '1px solid #e5eaf2',
    },

    td: {
      padding: '12px 14px',
      fontSize: '12px',
      color: '#0f1b3d',
      verticalAlign: 'middle',
    },

    workingText: {
      color: '#16a34a',
      fontWeight: '800',
    },

    offText: {
      color: '#475569',
      fontWeight: '500',
    },

    requestList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },

    requestItem: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '84px 1fr 156px',
      gap: '14px',
      alignItems: 'center',
      padding: '14px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: '7px',
      fontSize: '11px',
      fontWeight: '700',
      width: 'fit-content',
    },

    pendingBadge: {
      backgroundColor: '#fff1cf',
      color: '#b36b00',
    },

    approvedBadge: {
      backgroundColor: '#dff8e7',
      color: '#15803d',
    },

    requestInfo: {
      minWidth: 0,
    },

    requestTitle: {
      margin: '0 0 4px',
      fontSize: '13px',
      fontWeight: '800',
      color: '#0f1b3d',
    },

    requestSubtitle: {
      margin: 0,
      fontSize: '11px',
      color: '#50617c',
    },

    requestDate: {
      textAlign: isMobile ? 'left' : 'right',
      display: 'block',
    },

    requestDateText: {
      margin: '0 0 4px',
      fontSize: '11px',
      color: '#0f1b3d',
      fontWeight: '600',
    },

    requestDuration: {
      margin: 0,
      fontSize: '11px',
      color: '#50617c',
    },

    requestDetailsButton: {
      border: '1px solid #cfe0ff',
      backgroundColor: '#f8fbff',
      color: '#b8860b',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '800',
      padding: '8px 10px',
      cursor: 'pointer',
    },

    requestCount: {
      margin: '16px 0 0',
      textAlign: 'center',
      fontSize: '12px',
      color: '#50617c',
    },

    actionRow: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
    },

    actionCard: {
      backgroundColor: '#ffffff',
      borderRadius: '18px',
      border: '1px solid #e2e8f0',
      padding: '10px 14px',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      textAlign: 'left',
      minHeight: '50px',
      gap: isMobile ? '10px' : 0,
    },

    actionTitle: {
      fontFamily: "Arial, sans-serif",
      margin: '0 0 4px',
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '600',
    },

    actionText: {
      fontFamily: "Arial, sans-serif",
      margin: 0,
      fontSize: '13px',
      color: 'black',
      fontWeight: '500',
    },

    primaryButton: {
      height: '32px',
      border: 'none',
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontSize: '11px',
      fontWeight: '800',
      padding: '0 22px',
      cursor: 'pointer',
      alignSelf: 'center',
      minWidth: isMobile ? '100%' : '148px',
    },

    modal: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15,23,42,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },

    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      padding: '36px 32px',
      width: '340px',
      maxWidth: '90vw',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
    },

    modalIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '16px',
      backgroundColor: '#fff1f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 18px',
    },

    modalIconText: {
      fontSize: '26px',
      color: '#ef4444',
      display: 'flex',
      alignItems: 'center',
    },

    modalTitle: {
      margin: '0 0 10px',
      fontSize: '20px',
      fontWeight: '800',
      color: '#0f1b3d',
    },

    modalText: {
      margin: '0 0 24px',
      fontSize: '14px',
      color: '#50617c',
    },

    modalActions: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },

    modalButton: {
      height: '42px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '700',
      padding: '0 24px',
      cursor: 'pointer',
    },

    logoutBtn: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },

    cancelBtn: {
      backgroundColor: '#f1f5f9',
      color: '#344461',
    },

    detailsModalContent: {
      width: '520px',
      maxWidth: '92vw',
      textAlign: 'left',
      padding: '28px 28px 24px',
    },

    detailsModalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },

    detailsCloseButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '24px',
      color: '#64748b',
      lineHeight: 1,
      padding: 0,
    },

    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '14px 16px',
      marginBottom: '20px',
    },

    detailsField: {
      minWidth: 0,
    },

    detailsFieldFull: {
      gridColumn: isMobile ? 'auto' : '1 / -1',
    },

    detailsLabel: {
      fontSize: '11px',
      fontWeight: '800',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      marginBottom: '6px',
    },

    detailsValue: {
      minHeight: '42px',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      backgroundColor: '#f8fafc',
      padding: '11px 12px',
      boxSizing: 'border-box',
      fontSize: '13px',
      color: '#0f1b3d',
      display: 'flex',
      alignItems: 'center',
    },

    detailsTextarea: {
      minHeight: '112px',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      backgroundColor: '#f8fafc',
      padding: '12px',
      boxSizing: 'border-box',
      fontSize: '13px',
      color: '#0f1b3d',
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
    },
  };
}
