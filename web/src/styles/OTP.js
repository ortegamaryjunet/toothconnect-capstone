const createOTPStyles = ({ isMobile = false } = {}) => {
  return {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '0' : '36px',
      padding: isMobile ? '18px' : '24px',
      fontFamily: '"Inter", sans-serif',
      background:
        'radial-gradient(circle at 12% 20%, rgba(212, 175, 55, 0.18), transparent 28%),' +
        'radial-gradient(circle at 90% 10%, rgba(139, 101, 8, 0.12), transparent 28%),' +
        'linear-gradient(135deg, #ffffff, #fff3d2)',
      flexWrap: 'wrap',
    },

    card: {
      width: '100%',
      maxWidth: '520px',
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

    otpWrapper: {
      display: 'flex',
      justifyContent: 'center',
      gap: isMobile ? '7px' : '10px',
      margin: '8px 0 20px',
    },

    otpInput: {
      width: isMobile ? '42px' : '54px',
      height: isMobile ? '50px' : '58px',
      border: '1.5px solid #ead8a7',
      borderRadius: '14px',
      textAlign: 'center',
      fontSize: '22px',
      fontWeight: 900,
      color: '#8b6508',
      outline: 'none',
      background: '#fffaf2',
      boxSizing: 'border-box',
    },

    timer: {
      margin: '10px 0 0',
      textAlign: 'center',
      color: '#5f5442',
      fontSize: '14px',
      fontWeight: 600,
    },

    timerStrong: {
      color: '#8b6508',
      fontWeight: 900,
    },

    resendText: {
      margin: '18px 0 0',
      textAlign: 'center',
      color: '#5f5442',
      fontSize: '14px',
      fontWeight: 600,
    },

    link: {
      color: '#8b6508',
      fontWeight: 900,
      cursor: 'pointer'
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
      height: '50px',
      marginTop: '28px',
      border: 'none',
      borderRadius: '18px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontSize: '25px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 16px 34px rgba(139, 101, 8, 0.24)',
      transition: '0.25s ease',
    },

    buttonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },

    modalPreviewArea: {
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      maxWidth: '360px',
    },

    modalBox: {
      position: 'relative',
      width: '100%',
      padding: '34px 28px 28px',
      background: 'rgba(255, 255, 255, 0.96)',
      border: '1px solid rgba(234, 216, 167, 0.85)',
      borderRadius: '24px',
      boxShadow: '0 22px 60px rgba(139, 101, 8, 0.14)',
      textAlign: 'center',
    },

    closeButton: {
      position: 'absolute',
      top: '14px',
      right: '18px',
      border: 'none',
      background: 'transparent',
      color: '#5f5442',
      fontSize: '26px',
      lineHeight: 1,
      cursor: 'pointer',
    },

    modalTitle: {
      margin: '10px 0 12px',
      color: '#1f1a12',
      fontSize: '24px',
      fontWeight: 900,
    },

    modalText: {
      margin: '0 0 24px',
      color: '#5f5442',
      fontSize: '15px',
      fontWeight: 600,
      lineHeight: 1.5,
    },

    modalButton: {
      width: '100%',
      height: '48px',
      border: 'none',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 900,
      cursor: 'pointer',
      boxShadow: '0 12px 24px rgba(139, 101, 8, 0.18)',
    },

    backButton: {
      marginTop: '20px',
      width: '100%',
      height: '44px',
      border: '1.5px solid #ead8a7',
      borderRadius: '16px',
      background: 'transparent',
      color: '#8b6508',
      fontSize: '14px',
      fontWeight: 800,
      cursor: 'pointer',
      transition: '0.2s ease',
    },
  };
};

export default createOTPStyles;