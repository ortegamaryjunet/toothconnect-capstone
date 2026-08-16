const createTreatmentPlanStyles = ({ isMobile = false } = {}) => {
  const primary = '#d4af37';
  const primaryDark = '#8b6508';
  const primarySoft = '#fff8df';
  const primaryBorder = '#f3d879';
  const primaryGradient = 'linear-gradient(135deg, #d4af37 0%, #8b6508 100%)';
  const text = '#0f172a';
  const muted = '#64748b';
  const border = '#e2e8f0';

  return {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'Inter, Arial, sans-serif',
    },

    card: {
      background: '#ffffff',
      border: `1px solid ${border}`,
      borderRadius: 18,
      padding: isMobile ? 16 : 24,
      boxSizing: 'border-box',
      boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
    },

    cardTitle: {
      margin: '0 0 5px',
      fontSize: isMobile ? 18 : 20,
      fontWeight: 600,
      textTransform: 'uppercase',
      color: text,
      letterSpacing: '-0.2px',
    },

    chartSubtitle: {
      fontSize: 13,
      color: muted,
      marginBottom: 22,
      lineHeight: 1.5,
    },

    chartBox: {
      overflowX: 'auto',
      padding: isMobile ? '12px 4px 16px' : '18px 8px 20px',
      borderRadius: 14,
      background: '#f8fafc',
      border: `1px solid ${border}`,
    },

    arch: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? 3 : 5,
      minWidth: isMobile ? 500 : 610,
    },

    archLabel: {
      fontSize: 10,
      color: muted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      width: 22,
      textAlign: 'right',
      flexShrink: 0,
      fontWeight: 800,
    },

    archLabelRight: {
      fontSize: 10,
      color: muted,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      width: 22,
      textAlign: 'left',
      flexShrink: 0,
      fontWeight: 800,
    },

    midline: {
      width: 1,
      height: 48,
      background: '#cbd5e1',
      margin: '0 5px',
      flexShrink: 0,
    },

    archGap: {
      height: 16,
    },

    toothWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      gap: 4,
      padding: '2px 0',
      transition: 'transform .18s ease',
    },

    toothNum: {
      fontSize: 10,
      color: muted,
      fontWeight: 700,
      lineHeight: 1,
      minHeight: 9,
    },

    toothBox: {
      width: isMobile ? 25 : 30,
      height: isMobile ? 32 : 38,
      border: '1.5px solid #cbd5e1',
      borderRadius: '46% 46% 38% 38%',
      background: '#ffffff',
      transition: 'all .18s ease',
      boxShadow: '0 2px 5px rgba(15, 23, 42, .05)',
      boxSizing: 'border-box',
    },

    toothBoxPlanned: {
      background: 'linear-gradient(180deg, #fff8df 0%, #f3d879 100%)',
      borderColor: primary,
      boxShadow: '0 0 0 3px rgba(212, 175, 55, .10), 0 3px 8px rgba(139, 101, 8, .14)',
    },

    legendDot: {
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: 999,
      background: '#f3d879',
      border: `1.5px solid ${primary}`,
    },

    legendText: {
      fontSize: 12,
      color: muted,
      fontWeight: 600,
    },

    legend: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
    },

    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    },

    bracesBtn: {
      minHeight: 38,
      padding: '0 16px',
      fontSize: 12,
      fontWeight: 700,
      border: 'none',
      borderRadius: 10,
      background: primaryGradient,
      color: '#ffffff',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: '0 7px 16px rgba(139, 101, 8, .18)',
    },

    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 12px',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 10,
      background: primarySoft,
      fontSize: 12,
      fontWeight: 500,
      color: '#334155',
      cursor: 'pointer',
    },

    checkbox: {
      width: 16,
      height: 16,
      cursor: 'pointer',
      flexShrink: 0,
      accentColor: primary,
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
      border: `1px solid ${border}`,
      borderRadius: 14,
      background: '#ffffff',
    },

    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      minWidth: isMobile ? 760 : 820,
      fontFamily: 'Inter, Arial, sans-serif',
    },

    th: {
      padding: '13px 15px',
      background: '#f8fafc',
      color: '#475569',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '.45px',
      borderBottom: `1px solid ${border}`,
      textAlign: 'left',
      whiteSpace: 'nowrap',
    },

    td: {
      padding: '14px 15px',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9',
      fontSize: 13,
      verticalAlign: 'middle',
      lineHeight: 1.45,
    },

    tableRow: {
      transition: 'background .15s ease',
    },

    tableRowHighlighted: {
      background: '#fff8df',
      transition: 'background .3s ease',
    },

    emptyRow: {
      padding: '64px 20px',
      color: '#94a3b8',
      fontSize: 14,
      textAlign: 'center',
      fontWeight: 500,
    },

    actionGroup: {
      display: 'flex',
      gap: 7,
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    viewBtn: {
      minHeight: 34,
      padding: '0 11px',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 9,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 700,
    },

    attachmentBtn: {
      minHeight: 34,
      padding: '0 11px',
      border: '1px solid #e2e8f0',
      borderRadius: 9,
      background: '#f8fafc',
      color: '#475569',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontSize: 12,
      fontWeight: 700,
    },

    attachmentCount: {
      minWidth: 19,
      height: 19,
      padding: '0 5px',
      borderRadius: 999,
      background: '#e2e8f0',
      color: '#334155',
      fontSize: 10,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    editBtn: {
      minHeight: 40,
      padding: '0 20px',
      fontSize: 13,
      borderRadius: 10,
      border: 'none',
      background: primaryGradient,
      color: '#ffffff',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 6px 14px rgba(139, 101, 8, .16)',
    },

    deleteBtn: {
      minHeight: 40,
      padding: '0 20px',
      fontSize: 13,
      fontWeight: 800,
      border: '1px solid #fecaca',
      borderRadius: 10,
      background: '#fff1f2',
      color: '#dc2626',
      cursor: 'pointer',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5px 9px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    statusPlanned: {
      background: '#fff8df',
      color: '#d4af37',
      border: '1px solid #f3d879',
    },

    statusInProgress: {
      background: '#fff7ed',
      color: '#a16207',
      border: '1px solid #fde68a',
    },

    statusCompleted: {
      background: '#ecfdf5',
      color: '#15803d',
      border: '1px solid #bbf7d0',
    },

    errorBox: {
      padding: '11px 13px',
      background: '#fff1f2',
      border: '1px solid #fecdd3',
      borderRadius: 10,
      color: '#be123c',
      fontSize: 11,
      marginBottom: 12,
    },

    loadingBox: {
      padding: '12px 0',
      color: primaryDark,
      fontSize: 13,
      fontWeight: 700,
    },

    empty: {
      padding: 24,
      color: muted,
      fontSize: 14,
      fontWeight: 600,
    },

    mutedText: {
      fontSize: 13,
      color: muted,
      margin: '0 0 20px',
      lineHeight: 1.6,
    },

    readonlyInput: {
      background: '#f8fafc',
      color: '#475569',
      fontWeight: 700,
    },

    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, .58)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2147483647,
      padding: isMobile ? 14 : 24,
      boxSizing: 'border-box',
      overflow: 'auto',
    },

    modal: {
      position: 'relative',
      background: '#ffffff',
      borderRadius: 18,
      padding: isMobile ? 20 : 26,
      width: '100%',
      maxWidth: 480,
      maxHeight: 'calc(100vh - 32px)',
      overflowY: 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 24px 70px rgba(15, 23, 42, .22)',
      border: `1px solid ${border}`,
    },

    attachmentModal: {
      position: 'relative',
      background: '#ffffff',
      borderRadius: 18,
      padding: isMobile ? 18 : 24,
      width: '100%',
      maxWidth: 700,
      maxHeight: 'calc(100vh - 40px)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      boxShadow: '0 24px 70px rgba(15, 23, 42, .22)',
      border: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
    },

    closeIconBtn: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 32,
      height: 32,
      background: '#f8fafc',
      border: `1px solid ${border}`,
      fontSize: 16,
      color: '#64748b',
      cursor: 'pointer',
      padding: 0,
      lineHeight: 1,
      borderRadius: 9,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalTitle: {
      margin: '0 0 20px',
      paddingRight: 38,
      fontSize: isMobile ? 17 : 19,
      fontWeight: 800,
      color: text,
      letterSpacing: '-.2px',
    },

    attachmentHeader: {
      paddingRight: 38,
      marginBottom: 16,
    },

    attachmentMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      flexWrap: 'wrap',
      color: '#334155',
      fontSize: 13,
    },

    uploadDropzone: {
      border: '1.5px dashed #d4af37',
      borderRadius: 14,
      padding: '22px 18px',
      marginBottom: 16,
      background: '#fffdf7',
      color: primaryDark,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      textAlign: 'center',
      fontSize: 13,
    },

    uploadIcon: {
      fontSize: 25,
      color: primary,
    },

    hiddenInput: {
      display: 'none',
    },

    attachmentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9,
      maxHeight: isMobile ? '40vh' : '46vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: 3,
      minHeight: 0,
    },

    attachmentEmpty: {
      padding: 24,
      border: `1px solid ${border}`,
      borderRadius: 12,
      background: '#f8fafc',
      color: muted,
      fontSize: 13,
      fontWeight: 600,
      textAlign: 'center',
    },

    attachmentItem: {
      display: 'grid',
      gridTemplateColumns: '48px minmax(0, 1fr) 36px 36px',
      alignItems: 'center',
      gap: 10,
      padding: 10,
      border: `1px solid ${border}`,
      borderRadius: 12,
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    attachmentThumb: {
      width: 48,
      height: 48,
      borderRadius: 9,
      objectFit: 'cover',
      border: `1px solid ${border}`,
      background: '#f8fafc',
    },

    fileThumb: {
      width: 48,
      height: 48,
      borderRadius: 9,
      border: `1px solid ${border}`,
      background: '#f8fafc',
      color: primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 19,
    },

    attachmentInfo: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },

    attachmentName: {
      color: text,
      fontSize: 12,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    attachmentSubtext: {
      color: muted,
      fontSize: 11,
    },

    iconActionBtn: {
      width: 34,
      height: 34,
      border: `1px solid ${border}`,
      borderRadius: 9,
      background: '#f8fafc',
      color: '#475569',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
    },

    iconDeleteBtn: {
      borderColor: '#fecaca',
      background: '#fff1f2',
      color: '#dc2626',
    },

    lightboxOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, .78)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2147483646,
      padding: 16,
      boxSizing: 'border-box',
    },

    lightboxContent: {
      position: 'relative',
      width: '100%',
      maxWidth: 920,
      maxHeight: '92vh',
      background: '#ffffff',
      borderRadius: 16,
      padding: 14,
      boxSizing: 'border-box',
      border: `1px solid ${border}`,
      overflow: 'auto',
    },

    lightboxImage: {
      width: '100%',
      maxHeight: '76vh',
      objectFit: 'contain',
      borderRadius: 10,
      background: '#0f172a',
    },

    lightboxFrame: {
      width: '100%',
      height: '76vh',
      border: `1px solid ${border}`,
      borderRadius: 10,
      background: '#ffffff',
    },

    formGroup: {
      marginBottom: 15,
    },

    label: {
      display: 'block',
      fontSize: 12,
      fontWeight: 800,
      color: '#334155',
      marginBottom: 7,
    },

    required: {
      color: '#dc2626',
    },

    input: {
      width: '100%',
      minHeight: 42,
      padding: '9px 12px',
      border: `1px solid #cbd5e1`,
      borderRadius: 10,
      fontSize: 13,
      color: text,
      boxSizing: 'border-box',
      outline: 'none',
      background: '#ffffff',
    },

    select: {
      width: '100%',
      minHeight: 42,
      padding: '9px 12px',
      border: `1px solid #cbd5e1`,
      borderRadius: 10,
      fontSize: 13,
      color: text,
      background: '#ffffff',
      boxSizing: 'border-box',
      outline: 'none',
    },

    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: `1px solid #cbd5e1`,
      borderRadius: 10,
      fontSize: 13,
      color: text,
      resize: 'vertical',
      boxSizing: 'border-box',
      outline: 'none',
      background: '#ffffff',
      lineHeight: 1.5,
    },

    formError: {
      padding: '9px 12px',
      background: '#fff1f2',
      border: '1px solid #fecdd3',
      borderRadius: 9,
      color: '#be123c',
      fontSize: 12,
      marginBottom: 12,
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 9,
      marginTop: 20,
      flexWrap: 'wrap',
    },

    viewModalActions: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'right',
      gap: 13,
      marginTop: 24,
    },

    confirmModal: {
      width: '100%',
      maxWidth: 420,
      background: '#ffffff',
      padding: isMobile ? '24px 18px' : '28px 24px',
      borderRadius: 18,
      textAlign: 'center',
      boxShadow: '0 24px 70px rgba(15, 23, 42, .22)',
      boxSizing: 'border-box',
    },

    confirmIcon: {
      width: 64,
      height: 64,
      margin: '0 auto 15px',
      background: '#fff1f2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#dc2626',
    },

    confirmIconGold: {
      width: 64,
      height: 64,
      margin: '0 auto 15px',
      background: primarySoft,
      border: `1px solid ${primaryBorder}`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: primary,
    },

    confirmIconText: {
      fontSize: 27,
    },

    confirmTitle: {
      margin: '0 0 8px',
      fontSize: 19,
      color: text,
      fontWeight: 800,
    },

    confirmText: {
      margin: '0 0 20px',
      fontSize: 13,
      color: muted,
      lineHeight: 1.55,
    },

    confirmActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
    },

    confirmButton: {
      minWidth: isMobile ? '100%' : 100,
      border: 'none',
      borderRadius: 10,
      padding: '11px 18px',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 13,
    },

    confirmCancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
      border: `1px solid ${border}`,
    },

    confirmDeleteBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    addAppointmentBtn: {
      background: primaryGradient,
      color: '#ffffff',
      boxShadow: '0 7px 16px rgba(139, 101, 8, .18)',
    },

    confirmRows: {
      margin: '0 0 18px',
      border: `1px solid ${border}`,
      borderRadius: 11,
      overflow: 'hidden',
      textAlign: 'left',
    },

    confirmRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '9px 11px',
      borderBottom: `1px solid #f1f5f9`,
      fontSize: 12,
    },

    confirmRowLabel: {
      color: muted,
      flexShrink: 0,
      fontWeight: 600,
    },

    confirmRowValue: {
      color: text,
      textAlign: 'right',
      wordBreak: 'break-word',
    },

    cancelBtn: {
      minHeight: 40,
      padding: '0 16px',
      fontSize: 13,
      fontWeight: 700,
      border: `1px solid ${border}`,
      borderRadius: 10,
      background: '#ffffff',
      color: '#475569',
      cursor: 'pointer',
    },

    saveBtn: {
      minHeight: 40,
      padding: '0 17px',
      fontSize: 13,
      fontWeight: 800,
      border: 'none',
      borderRadius: 10,
      background: primaryGradient,
      color: '#ffffff',
      cursor: 'pointer',
      boxShadow: '0 7px 16px rgba(139, 101, 8, .16)',
    },

    backStyleBtn: {
      minWidth: 90,
      height: 40,
      padding: '0 16px',
      borderRadius: 10,
      border: `1px solid ${border}`,
      background: '#ffffff',
      color: '#334155',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontWeight: 600,
    },

    saveBtnDisabled: {
      background: '#93c5fd',
      cursor: 'not-allowed',
      boxShadow: 'none',
    },

    pagination: {
      display: 'flex',
      justifyContent: isMobile ? 'center' : 'flex-end',
      alignItems: 'center',
      gap: 10,
      padding: '16px 2px 2px',
      flexWrap: 'wrap',
    },

    pageBtn: {
      minWidth: 84,
      height: 38,
      borderRadius: 9,
      border: `1px solid ${border}`,
      background: '#ffffff',
      color: '#334155',
      fontWeight: 700,
      cursor: 'pointer',
    },

    pageBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
    },

    pageInfo: {
      minWidth: 100,
      textAlign: 'center',
      fontSize: 12,
      color: muted,
      fontWeight: 700,
    },

    viewRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '150px minmax(0, 1fr)',
      alignItems: 'start',
      gap: 8,
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9',
    },

    viewLabel: {
      fontSize: 12,
      fontWeight: 700,
      color: muted,
    },

    fieldError: {
      marginTop: 6,
      color: '#dc2626',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.4,
    },

    viewValue: {
      fontSize: 13,
      color: text,
      textAlign: isMobile ? 'left' : 'right',
      lineHeight: 1.5,
      wordBreak: 'break-word',
    },
  };
};

export default createTreatmentPlanStyles; 