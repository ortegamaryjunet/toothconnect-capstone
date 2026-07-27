const createTreatmentPlanStyles = ({ isMobile = false } = {}) => {
  const primary = '#d4af37';
  const primaryDark = '#8b6508';
  const primarySoft = '#fff8df';
  const primaryBorder = '#f3d879';
  const primaryGradient = 'linear-gradient(135deg, #8b6508, #d4af37)';

  return {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      width: '100%',
      boxSizing: 'border-box',
    },

    card: {
      background: '#ffffff',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 22,
      padding: isMobile ? 14 : 20,
      boxSizing: 'border-box',
      boxShadow: '0 10px 26px rgba(139, 101, 8, 0.07)',
    },

    cardTitle: {
      margin: '0 0 4px',
      fontSize: 16,
      fontWeight: 800,
      color: primaryDark,
      fontFamily: 'Arial, sans-serif',
    },

    chartSubtitle: {
      fontSize: 12,
      color: '#9b7a1d',
      marginBottom: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
    },

    chartBox: {
      overflowX: 'auto',
      paddingBottom: 8,
    },

    /* Arches */
    arch: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      minWidth: 560,
    },

    archLabel: {
      fontSize: 10,
      color: primaryDark,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      width: 20,
      textAlign: 'right',
      flexShrink: 0,
      fontFamily: 'monospace',
    },

    archLabelRight: {
      fontSize: 10,
      color: primaryDark,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      width: 20,
      textAlign: 'left',
      flexShrink: 0,
      fontFamily: 'monospace',
    },

    midline: {
      width: 1,
      height: 44,
      background: primaryBorder,
      margin: '0 4px',
      flexShrink: 0,
    },

    archGap: {
      height: 10,
    },

    /* Tooth */
    toothWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      gap: 2,
    },

    toothNum: {
      fontSize: 9,
      color: primaryDark,
      fontFamily: 'monospace',
      lineHeight: 1,
    },

    toothBox: {
      width: 26,
      height: 34,
      border: `1.5px solid ${primaryBorder}`,
      borderRadius: 4,
      background: '#fffdf7',
      transition: 'border-color 0.15s, background 0.15s',
    },

    toothBoxPlanned: {
      background: primarySoft,
      borderColor: primary,
      boxShadow: 'inset 0 0 0 2px rgba(212, 175, 55, 0.2)',
    },

    /* Legend */
    legend: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
    },

    legendDot: {
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: 3,
      background: primarySoft,
      border: `1.5px solid ${primary}`,
    },

    legendText: {
      fontSize: 11,
      color: primaryDark,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
    },

    /* Card header row */
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    bracesBtn: {
      padding: '6px 12px',
      fontSize: 12,
      fontWeight: 800,
      border: `1px solid ${primary}`,
      borderRadius: 10,
      background: primaryGradient,
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.16)',
    },

    /* Checkbox */
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 500,
      color: primaryDark,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    checkbox: {
      width: 16,
      height: 16,
      cursor: 'pointer',
      flexShrink: 0,
    },

    /* Table */
    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 16,
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 540,
      fontFamily: 'Arial, sans-serif',
    },

    th: {
      padding: '12px 14px',
      background: primarySoft,
      borderBottom: `1px solid ${primaryBorder}`,
      color: primaryDark,
      fontSize: 13,
      fontWeight: 700,
      textAlign: 'left',
      whiteSpace: 'nowrap',
    },

    td: {
      padding: '14px',
      borderBottom: '1px solid #f8ead0',
      color: '#1e293b',
      fontSize: 14,
      verticalAlign: 'middle',
    },

    tableRow: {
      transition: 'background 0.1s',
    },

    tableRowHighlighted: {
      background: primarySoft,
      transition: 'background 0.5s',
    },

    emptyRow: {
      padding: '24px 14px',
      color: primaryDark,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: 700,
    },

    /* Action group */
    actionGroup: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    viewBtn: {
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 800,
      border: `1px solid ${primary}`,
      borderRadius: 8,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    editBtn: {
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 800,
      border: `1px solid ${primary}`,
      borderRadius: 8,
      background: primaryGradient,
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    deleteBtn: {
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 600,
      border: '1px solid #fca5a5',
      borderRadius: 6,
      background: '#fff1f2',
      color: '#dc2626',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    /* Status badges */
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    statusPlanned: {
      background: primarySoft,
      color: primaryDark,
    },

    statusInProgress: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusCompleted: {
      background: '#dcfce7',
      color: '#15803d',
    },

    /* Misc */
    errorBox: {
      padding: '10px 14px',
      background: '#fef2f2',
      border: '1px solid #fca5a5',
      borderRadius: 8,
      color: '#dc2626',
      fontSize: 13,
      marginBottom: 12,
      fontFamily: 'Arial, sans-serif',
    },

    loadingBox: {
      padding: '12px 0',
      color: primaryDark,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
    },

    empty: {
      padding: 24,
      color: primaryDark,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
    },

    mutedText: {
      fontSize: 14,
      color: primaryDark,
      margin: '0 0 20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.5,
    },

    readonlyInput: {
      background: primarySoft,
      color: primaryDark,
      fontWeight: 700,
    },

    /* Modal overlay */
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },

    modal: {
      position: 'relative',
      background: '#ffffff',
      borderRadius: 22,
      padding: 28,
      width: '100%',
      maxWidth: 440,
      boxSizing: 'border-box',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      border: `1px solid ${primaryBorder}`,
    },

    closeIconBtn: {
      position: 'absolute',
      top: 12,
      right: 14,
      background: primarySoft,
      border: `1px solid ${primaryBorder}`,
      fontSize: 18,
      color: primaryDark,
      cursor: 'pointer',
      padding: '2px 6px',
      lineHeight: 1,
      borderRadius: 8,
      fontFamily: 'Arial, sans-serif',
    },

    modalTitle: {
      margin: '0 0 20px',
      fontSize: 17,
      fontWeight: 800,
      color: primaryDark,
      fontFamily: 'Arial, sans-serif',
    },

    formGroup: {
      marginBottom: 14,
    },

    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: primaryDark,
      marginBottom: 5,
      fontFamily: 'Arial, sans-serif',
    },

    required: {
      color: '#dc2626',
    },

    input: {
      width: '100%',
      padding: '9px 12px',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 10,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      boxSizing: 'border-box',
      outline: 'none',
      background: '#fffdf7',
    },

    select: {
      width: '100%',
      padding: '9px 12px',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 10,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: '#fffdf7',
      boxSizing: 'border-box',
      outline: 'none',
    },

    textarea: {
      width: '100%',
      padding: '9px 12px',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 10,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      resize: 'vertical',
      boxSizing: 'border-box',
      outline: 'none',
      background: '#fffdf7',
    },

    formError: {
      padding: '8px 12px',
      background: '#fef2f2',
      border: '1px solid #fca5a5',
      borderRadius: 7,
      color: '#dc2626',
      fontSize: 13,
      marginBottom: 12,
      fontFamily: 'Arial, sans-serif',
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 20,
    },

    cancelBtn: {
      padding: '9px 18px',
      fontSize: 14,
      fontWeight: 700,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    saveBtn: {
      padding: '9px 18px',
      fontSize: 14,
      fontWeight: 700,
      border: 'none',
      borderRadius: 12,
      background: primaryGradient,
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    saveBtnDisabled: {
      background: '#ead98f',
      cursor: 'not-allowed',
    },

    /* View modal rows */
    viewRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f8ead0',
    },

    viewLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: primaryDark,
      flexShrink: 0,
      fontFamily: 'Arial, sans-serif',
    },

    viewValue: {
      fontSize: 14,
      color: '#0f172a',
      textAlign: 'right',
      fontFamily: 'Arial, sans-serif',
    },
  };
};

export default createTreatmentPlanStyles;
