const createLoginStyles = ({ isMobile = false } = {}) => {
  return {
    page: {
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '18px' : '24px',
      fontFamily: '"Inter", sans-serif',
      background:
        'radial-gradient(circle at 12% 20%, rgba(212, 175, 55, 0.18), transparent 28%),' +
        'radial-gradient(circle at 90% 10%, rgba(139, 101, 8, 0.12), transparent 28%),' +
        'linear-gradient(135deg, #ffffff, #fff3d2)',
    },

    card: {
      width: '100%',
      maxWidth: '430px',
      padding: isMobile ? '34px 24px 28px' : '42px 38px 34px',
      background: 'rgba(255, 255, 255, 0.94)',
      border: '1px solid rgba(234, 216, 167, 0.85)',
      borderRadius: isMobile ? '24px' : '30px',
      boxShadow: '0 22px 60px rgba(139, 101, 8, 0.14)',
      display: 'flex',
      flexDirection: 'column',
    },

    logo: {
      width: '200px',
      height: '150px',
      objectFit: 'contain',
      margin: '0 auto 18px',
      display: 'block',
    },

    title: {
      margin: 0,
      textAlign: 'center',
      fontSize: isMobile ? '28px' : '34px',
      fontWeight: 900,
      color: '#8b6508',
      letterSpacing: '-0.8px',
    },

    subtitle: {
      margin: '8px 0 30px',
      textAlign: 'center',
      color: '#5f5442',
      fontSize: isMobile ? '14px' : '15px',
      fontWeight: 600,
    },

    label: {
      marginBottom: '8px',
      color: '#1f1a12',
      fontSize: '14px',
      fontWeight: 800,
    },

    input: {
      width: '100%',
      height: '54px',
      padding: '0 16px',
      marginBottom: '6px',
      border: '1px solid #ead8a7',
      borderRadius: '16px',
      outline: 'none',
      background: '#fffaf2',
      color: '#1f1a12',
      fontSize: '14px',
      fontWeight: 500,
      transition: '0.25s ease',
      boxSizing: 'border-box',
    },

    inputError: {
      border: '1px solid #dc2626',
      background: '#fff7f7',
    },

    fieldError: {
      margin: '0 0 14px',
      minHeight: '17px',
      color: '#b42318',
      fontSize: '12px',
      fontWeight: 700,
      lineHeight: 1.35,
    },

    error: {
      marginBottom: '16px',
      padding: '12px 14px',
      borderRadius: '14px',
      background: '#fff1f1',
      border: '1px solid #f5b5b5',
      color: '#b42318',
      fontSize: '13px',
      fontWeight: 700,
    },

    button: {
      width: '100%',
      height: '50px',
      border: 'none',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontSize: '21px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 16px 34px rgba(139, 101, 8, 0.24)',
      transition: '0.25s ease',
    },

    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },

    note: {
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(234, 216, 167, 0.75)',
      textAlign: 'center',
      color: '#8b806d',
      fontSize: '13px',
      fontWeight: 600,
    },
    
    link: {
      color: '#8b6508',
      fontWeight: 'bold',
      cursor: 'pointer',
    },

    disabledLink: {
      opacity: 0.45,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },

    forgotPasswordRow: {
      margin: '0 0 18px',
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      gap: 4,
    },

    cooldownText: {
      color: '#b42318',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.35,
      display: 'block',
      marginTop: 4,
    },

    success: {
      marginBottom: '16px',
      padding: '12px 14px',
      borderRadius: '14px',
      background: '#f0fdf4',
      border: '1px solid #86efac',
      color: '#166534',
      fontSize: '13px',
      fontWeight: 700,
      textAlign: 'center',
    },

    errorBanner: {
      marginBottom: '16px',
      padding: '12px 14px',
      borderRadius: '14px',
      background: '#fff1f1',
      border: '1px solid #f5b5b5',
      color: '#b42318',
      fontSize: '13px',
      fontWeight: 700,
      textAlign: 'center',
    },

    modal: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '100%' : 390,
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 22,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.25)',
      boxSizing: 'border-box',
      border: '1px solid rgba(212, 175, 55, 0.22)',
    },

    modalIcon: {
      width: 70,
      height: 70,
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: 'rgba(212, 175, 55, 0.18)',
      color: '#b8860b',
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
      flexDirection: isMobile ? 'column' : 'row',
    },

    modalButton: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 800,
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
    },

    saveBtn: {
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 12px 26px rgba(139, 101, 8, 0.18)',
    },
  };
};

export default createLoginStyles;
