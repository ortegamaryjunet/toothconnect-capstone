const createAdminScheduleRequestsStyles = ({
  adminSettingsStyles = {},
  isMobile = false,
  isSmallScreen = false,
} = {}) => {
  return {
    tableCard: {
      ...(adminSettingsStyles.tableCard || {}),
      overflowX: 'visible',
    },

    accountHeader: adminSettingsStyles.accountHeader || {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 20,
    },

    accountTitle: adminSettingsStyles.accountTitle || {
      margin: 0,
      fontSize: 20,
      color: '#0f172a',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    accountSubtitle: adminSettingsStyles.accountSubtitle || {
      margin: '5px 0 0',
      fontSize: 13,
      color: '#64748b',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    totalBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 13px',
      borderRadius: 999,
      background: '#eff6ff',
      color: '#2563eb',
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    tableWrapper: adminSettingsStyles.tableWrapper || {
      width: '100%',
      overflowX: 'auto',
    },

    branchTable: {
      ...(adminSettingsStyles.branchTable || {}),
      minWidth: 1050,
    },

    tableHead: adminSettingsStyles.tableHead || {
      background: '#f8fafc',
      color: '#64748b',
      fontSize: 13,
      textAlign: 'left',
      padding: 15,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
      borderBottom: '1px solid #edf0f5',
    },

    tableCell: adminSettingsStyles.tableCell || {
      padding: 15,
      borderBottom: '1px solid #edf0f5',
      color: '#334155',
      fontSize: 14,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableCellStrong: {
      ...(adminSettingsStyles.tableCell || {}),
      fontWeight: 700,
      color: '#0f172a',
    },

    tableRow: adminSettingsStyles.tableRow || {
      background: '#ffffff',
    },

    emptyRow: adminSettingsStyles.emptyRow || {
      textAlign: 'center',
      color: '#64748b',
      padding: 30,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      borderBottom: '1px solid #edf0f5',
    },

    statusBadge: {
      ...(adminSettingsStyles.statusBadge || {}),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    statusApproved: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusPending: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusRejected: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    viewBtn: {
      ...(adminSettingsStyles.editBtn || {}),
      width: 'auto',
      height: 38,
      padding: '0 16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    pagination: adminSettingsStyles.pagination || {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 20,
      flexWrap: 'nowrap',
    },

    pageBtn: adminSettingsStyles.pageBtn || {
      minWidth: 100,
      height: 40,
      padding: '0 18px',
      borderRadius: 10,
      border: '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: '0.2s ease',
    },

    prevPageBtn: adminSettingsStyles.prevPageBtn || {
      background: '#ffffff',
      color: '#b8860b',
      border: '1px solid #d4af37',
    },

    nextPageBtn: adminSettingsStyles.nextPageBtn || {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#ffffff',
    },

    pageBtnDisabled: adminSettingsStyles.pageBtnDisabled || {
      background: '#f8fafc',
      color: '#94a3b8',
      border: '1px solid #e2e8f0',
      cursor: 'not-allowed',
    },

    pageInfo: adminSettingsStyles.pageInfo || {
      minWidth: 100,
      height: 40,
      padding: '0 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 14 : 24,
      boxSizing: 'border-box',
    },

    detailsModal: {
      width: '100%',
      maxWidth: 760,
      maxHeight: '90vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: isMobile ? 18 : 22,
      border: '1px solid #e5e7eb',
      boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)',
      padding: isMobile ? 18 : 24,
      boxSizing: 'border-box',
    },

    modalHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 18,
    },

    modalTitle: {
      margin: 0,
      fontSize: isMobile ? 18 : 20,
      color: '#0f172a',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    modalSubtitle: {
      margin: '5px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    closeBtn: {
      width: 38,
      height: 38,
      minWidth: 38,
      borderRadius: 12,
      border: 'none',
      outline: 'none',
      background: '#f8fafc',
      color: '#334155',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    },

    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
      marginBottom: 14,
    },

    infoItem: adminSettingsStyles.infoItem || {
      padding: 16,
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      minWidth: 0,
      boxSizing: 'border-box',
    },

    infoLabel: adminSettingsStyles.infoLabel || {
      display: 'block',
      marginBottom: 7,
      fontSize: 12,
      fontWeight: 700,
      color: '#2563eb',
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: adminSettingsStyles.infoValue || {
      display: 'block',
      color: '#0f172a',
      fontSize: 15,
      fontWeight: 700,
      overflowWrap: 'anywhere',
      fontFamily: 'Arial, sans-serif',
    },

    reasonBox: {
      padding: 16,
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      marginBottom: 18,
      boxSizing: 'border-box',
    },

    reasonText: {
      margin: 0,
      color: '#0f172a',
      fontSize: 14,
      lineHeight: 1.6,
      fontFamily: 'Arial, sans-serif',
    },

    modalActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    rejectBtn: {
      ...(adminSettingsStyles.secondaryBtn || {}),
      height: 46,
      padding: '0 18px',
      borderRadius: 14,
      border: '1px solid #fecaca',
      background: '#ffffff',
      color: '#dc2626',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      width: isMobile ? '100%' : 'auto',
    },

    approveBtn: {
      ...(adminSettingsStyles.saveBtn || adminSettingsStyles.primaryBtn || {}),
      height: 46,
      padding: '0 18px',
      borderRadius: 14,
      border: 'none',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      width: isMobile ? '100%' : 'auto',
    },
  };
};

export default createAdminScheduleRequestsStyles;
