const createForgotPasswordStyles = ({ isMobile = false } = {}) => {
  return {
    page: {
      minHeight: '100vh',
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
      lineHeight: 1.5,
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
      marginBottom: '18px',
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

    error: {
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

    button: {
      width: '100%',
      height: '54px',
      marginTop: '4px',
      border: 'none',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: 900,
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
      paddingTop: '18px',
      borderTop: '1px solid rgba(234, 216, 167, 0.75)',
      textAlign: 'center',
      color: '#8b806d',
      fontSize: '13px',
      fontWeight: 600,
    },

    link: {
      color: '#8b6508',
      fontWeight: 900,
      cursor: 'pointer',
    },

    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(31, 26, 18, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },

    modal: {
      width: '100%',
      maxWidth: '420px',
      padding: '36px 32px 30px',
      background: '#ffffff',
      border: '1px solid rgba(234, 216, 167, 0.9)',
      borderRadius: '28px',
      boxShadow: '0 28px 70px rgba(139, 101, 8, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '"Inter", sans-serif',
    },

    modalTitle: {
      margin: '0 0 8px',
      textAlign: 'center',
      fontSize: '22px',
      fontWeight: 900,
      color: '#8b6508',
      letterSpacing: '-0.5px',
    },

    modalSubtitle: {
      margin: '0 0 22px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 600,
      color: '#5f5442',
    },

    modalEmailBox: {
      width: '100%',
      padding: '14px 18px',
      marginBottom: '26px',
      background: '#fffaf2',
      border: '1px solid #ead8a7',
      borderRadius: '14px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },

    modalEmail: {
      fontSize: '15px',
      fontWeight: 800,
      color: '#1f1a12',
      wordBreak: 'break-all',
    },

    modalRole: {
      fontSize: '13px',
      fontWeight: 700,
      color: '#8b6508',
    },

    modalActions: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },

    modalButtonYes: {
      width: '100%',
      height: '50px',
      border: 'none',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: 900,
      cursor: 'pointer',
      boxShadow: '0 12px 28px rgba(139, 101, 8, 0.22)',
      transition: '0.2s ease',
    },

    modalButtonNo: {
      width: '100%',
      height: '46px',
      border: '1.5px solid #ead8a7',
      borderRadius: '16px',
      background: 'transparent',
      color: '#8b6508',
      fontSize: '15px',
      fontWeight: 800,
      cursor: 'pointer',
      transition: '0.2s ease',
    },
  };
};

export default createForgotPasswordStyles;