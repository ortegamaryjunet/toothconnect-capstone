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
      minHeight: 30,
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 800,
      border: `1px solid ${primary}`,
      borderRadius: 8,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },

    attachmentBtn: {
      minHeight: 30,
      padding: '5px 10px',
      border: `1px solid ${primary}`,
      borderRadius: 8,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentCount: {
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      borderRadius: 999,
      background: primary,
      color: '#ffffff',
      fontSize: 11,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    },

    editBtn: {
      minHeight: 43,
      padding: '0 16px',
      fontSize: 14,
      fontWeight: 800,
      border: `1px solid ${primary}`,
      borderRadius: 14,
      background: primary,
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    deleteBtn: {
      minHeight: 43,
      padding: '0 16px',
      fontSize: 14,
      fontWeight: 800,
      border: 'none',
      borderRadius: 14,
      background: '#dc2626',
      color: '#ffffff',
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
      padding: isMobile ? 16 : 24,
      boxSizing: 'border-box',
      overflow: 'hidden',
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

    attachmentModal: {
      position: 'relative',
      background: '#ffffff',
      borderRadius: 22,
      padding: isMobile ? 20 : 26,
      width: '100%',
      maxWidth: 680,
      maxHeight: 'calc(100vh - 80px)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      border: `1px solid ${primaryBorder}`,
      display: 'flex',
      flexDirection: 'column',
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

    attachmentHeader: {
      paddingRight: 36,
      marginBottom: 16,
    },

    attachmentMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      color: '#0f172a',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    uploadDropzone: {
      border: `1.5px dashed ${primary}`,
      borderRadius: 16,
      padding: '22px 18px',
      marginBottom: 16,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      textAlign: 'center',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    uploadIcon: {
      fontSize: 24,
    },

    hiddenInput: {
      display: 'none',
    },

    attachmentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxHeight: isMobile ? '42vh' : '48vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: 4,
      minHeight: 0,
    },

    attachmentEmpty: {
      padding: 18,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      background: '#fffdf7',
      color: primaryDark,
      fontSize: 13,
      fontWeight: 700,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },

    attachmentItem: {
      display: 'grid',
      gridTemplateColumns: '48px minmax(0, 1fr) 36px 36px',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    attachmentThumb: {
      width: 48,
      height: 48,
      borderRadius: 8,
      objectFit: 'cover',
      border: `1px solid ${primaryBorder}`,
      background: primarySoft,
    },

    fileThumb: {
      width: 48,
      height: 48,
      borderRadius: 8,
      border: `1px solid ${primaryBorder}`,
      background: primarySoft,
      color: primaryDark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
    },

    attachmentInfo: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },

    attachmentName: {
      color: '#0f172a',
      fontSize: 13,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    attachmentSubtext: {
      color: '#64748b',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    iconActionBtn: {
      width: 34,
      height: 34,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 10,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
    },

    iconDeleteBtn: {
      borderColor: '#fecaca',
      background: '#fee2e2',
      color: '#dc2626',
    },

    lightboxOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: 18,
      boxSizing: 'border-box',
    },

    lightboxContent: {
      position: 'relative',
      width: '100%',
      maxWidth: 900,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: 18,
      padding: 18,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'auto',
    },

    lightboxImage: {
      width: '100%',
      maxHeight: '74vh',
      objectFit: 'contain',
      borderRadius: 12,
      background: '#0f172a',
    },

    lightboxFrame: {
      width: '100%',
      height: '74vh',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      background: '#ffffff',
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

    viewModalActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 20,
    },

    confirmModal: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isMobile ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    confirmIcon: {
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

    confirmIconGold: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      background: primarySoft,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: primaryDark,
    },

    confirmIconText: {
      fontSize: 34,
    },

    confirmTitle: {
      margin: '0 0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      fontWeight: 600,
    },

    confirmText: {
      margin: '0 0 24px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.5,
    },

    confirmActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    confirmButton: {
      minWidth: isMobile ? '100%' : 100,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
    },

    confirmCancelBtn: {
      background: '#e5e7eb',
      color: '#0f172a',
    },

    confirmDeleteBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    addAppointmentBtn: {
      background: primary,
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    confirmRows: {
      margin: '0 0 18px',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      overflow: 'hidden',
      textAlign: 'left',
    },

    confirmRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 10px',
      borderBottom: `1px solid ${primaryBorder}`,
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    confirmRowLabel: {
      color: primaryDark,
      flexShrink: 0,
    },

    confirmRowValue: {
      color: '#3f2f08',
      textAlign: 'right',
      wordBreak: 'break-word',
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

    backStyleBtn: {
      minWidth: 72,
      height: 42,
      padding: '0 16px',
      border: `1px solid ${primary}`,
      borderRadius: 12,
      background: primary,
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 800,
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    saveBtnDisabled: {
      background: '#ead98f',
      cursor: 'not-allowed',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 16,
      fontFamily: 'Arial, sans-serif',
    },

    pageBtn: {
      minWidth: 74,
      height: 38,
      padding: '0 14px',
      borderRadius: 12,
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    pageBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
    },

    pageInfo: {
      fontSize: 13,
      color: primaryDark,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
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
