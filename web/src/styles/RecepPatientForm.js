const createRecepPatientFormStyles = ({
  isMobile = false,
  isVerySmall = false,
} = {}) => {
  return {
    pageWrapper: {
      width: '100%',
      minHeight: '100vh',
      padding: isVerySmall ? '24px 12px' : '40px 18px',
      display: 'flex',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #dbeafe, #eef2ff)',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    container: {
      width: '100%',
      maxWidth: 1050,
      background: '#ffffff',
      borderRadius: isVerySmall ? 18 : 24,
      padding: isMobile ? 22 : 28,
      boxShadow: '0 18px 45px rgba(37, 99, 235, 0.14)',
      boxSizing: 'border-box',
    },

    header: {
      position: 'relative',
      textAlign: 'center',
      padding: isVerySmall ? '8px 46px 22px' : '8px 55px 24px',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: 26,
    },

    headerTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 22 : 26,
      color: '#0f172a',
    },

    headerText: {
      margin: '8px 0 0',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#64748b',
      lineHeight: 1.5,
    },

    backBtn: {
      position: 'absolute',
      left: 0,
      top: 8,
      width: 42,
      height: 42,
      border: 'none',
      background: 'transparent',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2563eb',
      fontSize: 20,
      transition: '0.2s ease',
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
      padding: '14px 16px',
      boxSizing: 'border-box',
    },

    sectionTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 15 : 17,
      color: '#1e293b',
      lineHeight: 1.3,
    },

    circleBtn: {
      width: 34,
      height: 34,
      minWidth: 34,
      borderRadius: '50%',
      border: 'none',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: 20,
      lineHeight: 1,
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    content: {
      marginTop: 12,
      padding: isVerySmall ? 16 : 22,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 20,
      boxSizing: 'border-box',
    },

    formGridTwo: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: 18,
      marginBottom: 18,
    },

    formGridThree: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 18,
      marginBottom: 18,
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
    },

    label: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
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
    },

    textarea: {
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '11px 13px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      resize: 'none',
      minHeight: 75,
      transition: '0.2s ease',
      boxSizing: 'border-box',
    },

    radioGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 14,
    },

    inlineOption: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 500,
      color: '#334155',
      margin: 0,
      fontSize: 14,
      cursor: 'pointer',
    },

    checkLine: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 500,
      color: '#334155',
      margin: '4px 0 0',
      fontSize: 14,
      cursor: 'pointer',
    },

    minorBox: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: 'fit-content',
      margin: '8px 0 18px',
      padding: '10px 14px',
      background: '#eff6ff',
      borderRadius: 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 500,
      color: '#334155',
      cursor: 'pointer',
    },

    minorFields: {
      padding: 18,
      borderRadius: 18,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      marginBottom: 18,
      boxSizing: 'border-box',
    },

    subTitle: {
      margin: '4px 0 18px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 17,
      color: '#2563eb',
    },

    noneLine: {
      margin: '8px 0 15px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#1e3a8a',
    },

    disabledFields: {
      opacity: 0.55,
    },

    questionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      marginTop: 18,
    },

    questionItem: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 18,
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      padding: 14,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      boxSizing: 'border-box',
    },

    questionText: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      color: '#334155',
      lineHeight: 1.4,
    },

    choiceBox: {
      marginTop: 18,
      padding: isVerySmall ? 15 : 18,
      borderRadius: 18,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      boxSizing: 'border-box',
    },

    choiceTitle: {
      margin: '0 0 15px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 16,
      color: '#1e293b',
    },

    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 12,
      marginBottom: 15,
    },

    womenGrid: {
      display: 'grid',
      gap: 12,
    },

    conditionGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '12px 18px',
    },

    otherCondition: {
      marginTop: 18,
    },

    submitButton: {
      display: 'block',
      width: isVerySmall ? '100%' : 220,
      margin: '28px auto 0',
      padding: 13,
      border: 'none',
      borderRadius: 14,
      background: '#28a745',
      color: '#ffffff',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 15,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
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
      padding: isVerySmall ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    recordIcon: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      background: '#dbeafe',
      color: '#2563eb',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 34,
    },

    backIcon: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      background: '#fee2e2',
      color: '#ef4444',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 34,
    },

    recordTitle: {
      margin: '0 0 10px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
    },

    backTitle: {
      margin: '0 0 10px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
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
      gap: 14,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    submitModalBtn: {
      flex: 1,
      padding: 12,
      border: 'none',
      borderRadius: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      background: '#2563eb',
      color: '#ffffff',
    },

    cancelModalBtn: {
      flex: 1,
      padding: 12,
      border: 'none',
      borderRadius: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      background: '#f1f5f9',
      color: '#334155',
    },

    confirmYes: {
      flex: 1,
      padding: 12,
      border: 'none',
      borderRadius: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      background: '#ef4444',
      color: '#ffffff',
    },

    confirmNo: {
      flex: 1,
      padding: 12,
      border: 'none',
      borderRadius: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      background: '#f1f5f9',
      color: '#334155',
    },
  };
};

export default createRecepPatientFormStyles;