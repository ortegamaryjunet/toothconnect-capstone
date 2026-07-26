const createAdminEmployeeFormStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
} = {}) => {
  return {
    pageWrapper: {
      width: '100%',
      minHeight: '100vh',
      padding: isMobile ? '24px 12px' : '40px 18px',
      display: 'flex',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dbeafe, #eef2ff)',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    },

    employeeForm: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      boxSizing: 'border-box',
    },

    container: {
      width: '100%',
      maxWidth: 1080,
      background: '#ffffff',
      borderRadius: isMobile ? 20 : 24,
      padding: isMobile ? 18 : 28,
      boxShadow: '0 18px 45px rgba(37, 99, 235, 0.14)',
      boxSizing: 'border-box',
    },

    header: {
      position: 'relative',
      textAlign: 'center',
      padding: isMobile ? '8px 45px 22px' : '8px 55px 24px',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: 26,
      boxSizing: 'border-box',
    },

    backBtn: {
      position: 'absolute',
      left: 0,
      top: 8,
      minWidth: isMobile ? 72 : 84,
      height: isMobile ? 38 : 42,
      padding: '0 16px',
      borderRadius: 14,
      background: '#d4af37',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: '0.2s ease',
      fontSize: 14,
      color: '#ffffff',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    backBtnHover: {
      background: '#d4af37',
      color: '#ffffff',
    },

    headerTitle: {
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 22 : 26,
      color: '#0f172a',
      fontWeight: 600,
    },

    headerText: {
      margin: '8px 0 0',
      color: '#64748b',
      fontSize: isMobile ? 13 : 14,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    radioGroup: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isMobile ? 12 : 28,
      margin: '10px 0 28px',
      flexWrap: 'wrap',
    },

    employeeTypeLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 14 : 15,
      color: '#334155',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontWeight: 600,
    },

    radioInput: {
      width: 'auto',
      accentColor: '#2563eb',
      cursor: 'pointer',
    },

    checkboxInput: {
      width: 'auto',
      accentColor: '#2563eb',
      cursor: 'pointer',
    },

    formSection: {
      display: 'block',
    },

    section: {
      marginBottom: 18,
    },

    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 18,
      padding: isMobile ? '12px 13px' : '14px 16px',
      boxSizing: 'border-box',
    },

    sectionTitle: {
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 15 : 17,
      color: '#1e293b',
      fontWeight: 700,
    },

    circleBtn: {
      width: isMobile ? 31 : 34,
      height: isMobile ? 31 : 34,
      minWidth: isMobile ? 31 : 34,
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #b8860b, #d4af37)',
      color: '#ffffff',
      fontSize: 20,
      cursor: 'pointer',
      transition: '0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      fontFamily: 'Arial, sans-serif',
    },

    content: {
      display: 'block',
      marginTop: 12,
      padding: isMobile ? 16 : 22,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 20,
      boxSizing: 'border-box',
    },

    rowTwo: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)',
      gap: 18,
      marginBottom: 18,
    },

    rowThree: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)',
      gap: 18,
      marginBottom: 18,
    },

    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      minWidth: 0,
    },

    label: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#334155',
    },

    input: {
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '11px 13px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      transition: '0.2s ease',
      boxSizing: 'border-box',
      minHeight: 43,
    },

    phoneInputContainer: {
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      zIndex: 20,
    },

    phoneInput: {
      width: '100%',
      minHeight: 43,
      height: 43,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      paddingLeft: 54,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
    },

    phoneButton: {
      height: 43,
      border: '1px solid #cbd5e1',
      borderRadius: '12px 0 0 12px',
      background: '#f8fafc',
    },

    phoneInputError: {
      borderColor: '#dc2626',
      borderWidth: 2,
    },

    phoneDropdown: {
      fontFamily: 'Arial, sans-serif',
      borderRadius: 12,
      overflow: 'auto',
      zIndex: 100000,
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
    },

    phoneSearch: {
      width: '90%',
      height: 34,
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      fontFamily: 'Arial, sans-serif',
    },

    readOnlyInput: {
      background: '#f1f5f9',
      color: '#64748b',
      cursor: 'not-allowed',
    },

    checkboxGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 14,
      alignItems: 'center',
    },

    radioInlineGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 14,
      alignItems: 'center',
      minHeight: 43,
    },

    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 500,
      color: '#334155',
      margin: 0,
      cursor: 'pointer',
    },

    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 500,
      color: '#334155',
      margin: 0,
      cursor: 'pointer',
      fontSize: 14,
    },

    subTitle: {
      margin: '24px 0 14px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 17,
      color: '#2563eb',
      fontWeight: 800,
    },

    workItem: {
      padding: isMobile ? 14 : 18,
      marginBottom: 18,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 18,
      boxSizing: 'border-box',
    },

    timeGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
    },

    separator: {
      fontSize: 14,
      fontWeight: 700,
      color: '#64748b',
      whiteSpace: 'nowrap',
    },

    scheduleGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: 11,
      padding: 14,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      boxSizing: 'border-box',
    },

    workItemHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    removeWorkBtn: {
      width: 28,
      height: 28,
      minWidth: 28,
      borderRadius: '50%',
      border: 'none',
      background: '#fee2e2',
      color: '#dc2626',
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      lineHeight: 1,
      flexShrink: 0,
    },

    addWork: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 10,
    },

    addWorkBtn: {
      border: 'none',
      borderRadius: 12,
      background: '#2563eb',
      color: '#ffffff',
      padding: '11px 18px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    formSubmit: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 28,
    },

    submitBtn: {
      width: isMobile ? '100%' : 220,
      padding: 13,
      border: 'none',
      borderRadius: 14,
      background: '#28a745',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 15,
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    emptyState: {
      textAlign: 'center',
      padding: isMobile ? 22 : 28,
      border: '1px dashed #cbd5e1',
      borderRadius: 18,
      background: '#f8fafc',
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      zIndex: 9999,
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isMobile ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    modalIcon: {
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
      margin: '0 0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      fontWeight: 600,
    },

    modalText: {
      margin: '0 0 24px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.5,
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    modalButton: {
      minWidth: isMobile ? '100%' : 100,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
    },

    confirmBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    cancelBtn: {
      background: '#e5e7eb',
      color: '#0f172a',
    },
  };
};

export default createAdminEmployeeFormStyles;
