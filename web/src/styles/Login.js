const createLoginStyles = ({ isMobile = false } = {}) => {
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
    },

    button: {
      width: '100%',
      height: '50px',
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

    note: {
      marginTop: '16px',
      paddingTop: '16px',
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
  };
};

export default createLoginStyles;
