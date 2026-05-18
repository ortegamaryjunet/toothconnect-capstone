const createTreatmentPlanStyles = ({ isMobile = false } = {}) => {
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
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: isMobile ? 14 : 20,
      boxSizing: 'border-box',
    },

    cardTitle: {
      margin: '0 0 4px',
      fontSize: 16,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    chartSubtitle: {
      fontSize: 12,
      color: '#94a3b8',
      marginBottom: 16,
      fontFamily: 'Arial, sans-serif',
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
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      width: 20,
      textAlign: 'right',
      flexShrink: 0,
      fontFamily: 'monospace',
    },

    archLabelRight: {
      fontSize: 10,
      color: '#94a3b8',
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
      background: '#cbd5e0',
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
      color: '#94a3b8',
      fontFamily: 'monospace',
      lineHeight: 1,
    },

    toothBox: {
      width: 26,
      height: 34,
      border: '1.5px solid #cbd5e0',
      borderRadius: 4,
      background: '#f8fafc',
      transition: 'border-color 0.15s, background 0.15s',
    },

    toothBoxPlanned: {
      background: '#bfdbfe',
      borderColor: '#3b82f6',
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
      background: '#bfdbfe',
      border: '1.5px solid #3b82f6',
    },

    legendText: {
      fontSize: 11,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
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
      fontWeight: 600,
      border: '1px solid #a855f7',
      borderRadius: 7,
      background: '#faf5ff',
      color: '#7e22ce',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    /* Checkbox */
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 500,
      color: '#374151',
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
      border: '1px solid #e5e7eb',
      borderRadius: 10,
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 540,
      fontFamily: 'Arial, sans-serif',
    },

    th: {
      padding: '12px 14px',
      background: '#f8fafc',
      borderBottom: '1px solid #e5e7eb',
      color: '#334155',
      fontSize: 13,
      fontWeight: 700,
      textAlign: 'left',
      whiteSpace: 'nowrap',
    },

    td: {
      padding: '14px',
      borderBottom: '1px solid #f1f5f9',
      color: '#1e293b',
      fontSize: 14,
      verticalAlign: 'middle',
    },

    tableRow: {
      transition: 'background 0.1s',
    },

    tableRowHighlighted: {
      background: '#fef9c3',
      transition: 'background 0.5s',
    },

    emptyRow: {
      padding: '24px 14px',
      color: '#94a3b8',
      fontSize: 14,
      textAlign: 'center',
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
      fontWeight: 600,
      border: '1px solid #cbd5e0',
      borderRadius: 6,
      background: '#f8fafc',
      color: '#334155',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    editBtn: {
      padding: '5px 10px',
      fontSize: 12,
      fontWeight: 600,
      border: '1px solid #3b82f6',
      borderRadius: 6,
      background: '#eff6ff',
      color: '#2563eb',
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
      background: '#dbeafe',
      color: '#2563eb',
    },

    statusInProgress: {
      background: '#fef9c3',
      color: '#a16207',
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
      color: '#94a3b8',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    empty: {
      padding: 24,
      color: '#94a3b8',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    /* Modal overlay */
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },

    modal: {
      position: 'relative',
      background: '#ffffff',
      borderRadius: 14,
      padding: 28,
      width: '100%',
      maxWidth: 440,
      boxSizing: 'border-box',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    },

    closeIconBtn: {
      position: 'absolute',
      top: 12,
      right: 14,
      background: 'none',
      border: 'none',
      fontSize: 18,
      color: '#94a3b8',
      cursor: 'pointer',
      padding: '2px 6px',
      lineHeight: 1,
      borderRadius: 4,
      fontFamily: 'Arial, sans-serif',
    },

    modalTitle: {
      margin: '0 0 20px',
      fontSize: 17,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    formGroup: {
      marginBottom: 14,
    },

    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: '#374151',
      marginBottom: 5,
      fontFamily: 'Arial, sans-serif',
    },

    required: {
      color: '#dc2626',
    },

    input: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #d1d5db',
      borderRadius: 7,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      boxSizing: 'border-box',
      outline: 'none',
    },

    select: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #d1d5db',
      borderRadius: 7,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: '#fff',
      boxSizing: 'border-box',
      outline: 'none',
    },

    textarea: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #d1d5db',
      borderRadius: 7,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      resize: 'vertical',
      boxSizing: 'border-box',
      outline: 'none',
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
      fontWeight: 600,
      border: '1px solid #d1d5db',
      borderRadius: 8,
      background: '#f8fafc',
      color: '#374151',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    saveBtn: {
      padding: '9px 18px',
      fontSize: 14,
      fontWeight: 700,
      border: 'none',
      borderRadius: 8,
      background: '#2563eb',
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    saveBtnDisabled: {
      background: '#93c5fd',
      cursor: 'not-allowed',
    },

    /* View modal rows */
    viewRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f1f5f9',
    },

    viewLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: '#64748b',
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
