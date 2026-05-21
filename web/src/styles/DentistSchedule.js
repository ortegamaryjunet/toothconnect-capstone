export default function createDentistScheduleStyles({ isMobile, isTablet, isSmallScreen }) {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : 230;

  return {
    page: {
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f4f7fb',
      fontFamily: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif",
      color: '#0f1b3d',
    },

    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      width: sidebarWidth,
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5eaf2',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '16px 8px' : isTablet ? '18px 10px' : '22px 16px',
      boxSizing: 'border-box',
      zIndex: 200,
    },

    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 0 24px',
      borderBottom: '1px solid #e5eaf2',
      marginBottom: '18px',
    },

    logoImg: {
      width: isMobile ? 46 : isTablet ? 54 : 120,
      height: 'auto',
      objectFit: 'contain',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: isTablet ? '10px' : '8px',
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile || isTablet ? '0' : '10px',
      justifyContent: isMobile || isTablet ? 'center' : 'flex-start',
      height: '44px',
      borderRadius: '12px',
      padding: isMobile ? '13px 8px' : isTablet ? '14px 10px' : '13px 14px',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      color: '#475569',
      textDecoration: 'none',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      transition: '0.2s ease',
      boxSizing: 'border-box',
      width: '100%',
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #0f62f1 0%, #1f7bff 100%)',
      color: '#ffffff',
      boxShadow: '0 10px 20px rgba(15, 98, 241, 0.22)',
    },

    menuItemIcon: {
      marginRight: isMobile || isTablet ? 0 : 12,
      fontSize: isTablet ? 20 : 18,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile || isTablet ? 'none' : 'inline',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
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
      borderTop: '1px solid #e5eaf2',
      paddingTop: '12px',
      marginTop: '8px',
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
      height: isMobile ? 70 : 78,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5eaf2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isMobile ? '0 14px' : isTablet ? '0 18px' : '0 22px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    doctorProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },

    avatar: {
      width: '38px',
      height: '38px',
      borderRadius: '12px',
      backgroundColor: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarIcon: {
      fontSize: '18px',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
    },

    doctorInfo: {
      display: 'flex',
      flexDirection: 'column',
    },

    doctorName: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#0f1b3d',
    },

    doctorSpecialization: {
      fontSize: '11px',
      color: '#64748b',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
    },

    mainContent: {
      padding: isMobile ? '84px 14px 18px' : isTablet ? '94px 16px 18px' : '94px 22px 22px',
      boxSizing: 'border-box',
    },

    heroCard: {
      borderRadius: '22px',
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      color: '#ffffff',
      padding: '26px 30px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '18px',
    },

    heroBadge: {
      display: 'inline-block',
      padding: '7px 16px',
      borderRadius: '999px',
      backgroundColor: 'rgba(255,255,255,0.16)',
      fontSize: '11px',
      fontWeight: '800',
      marginBottom: '14px',
    },

    heroTitle: {
      margin: '0 0 10px',
      fontSize: '22px',
      lineHeight: '1.3',
      fontWeight: '800',
    },

    heroText: {
      margin: 0,
      fontSize: '13px',
      color: '#f2f7ff',
    },

    heroIcon: {
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '64px',
      height: '64px',
      borderRadius: '18px',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },

    heroIconText: {
      fontSize: '30px',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(220px, 0.7fr) minmax(280px, 0.95fr)',
      gap: '12px',
      marginBottom: '16px',
      alignItems: 'stretch',
    },

    infoCard: {
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
      margin: '0 0 4px',
      fontSize: '13px',
      color: '#64748b',
      fontWeight: '600',
    },

    infoValue: {
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
      color: '#0f62f1',
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
      alignItems: 'column',
      textAlign: 'left'
    },

    actionCard: {
      backgroundColor: '#ffffff',
      borderRadius: '18px',
      border: '1px solid #e2e8f0',
      padding: '10px 14px',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between' ,
      alignItems: 'center',
      textAlign: 'center',
      minHeight: '50px',
    },

    actionTitle: {
      margin: '0 0 4px',
      fontSize: '15px',
      fontWeight: '800',
      color: 'black',
    },

    actionText: {
      margin: '0 0 8px',
      fontSize: '13px',
      color: '#64748b',
    },

    primaryButton: {
      height: '32px',
      border: 'none',
      borderRadius: '6px',
      background: 'linear-gradient(135deg, #0f62f1 0%, #126eff 100%)',
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
