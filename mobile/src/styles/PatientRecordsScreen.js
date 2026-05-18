import { StyleSheet, Platform } from 'react-native';

const GOLD        = '#b47a00';
const GOLD_BORDER = '#e4cf88';
const GOLD_DARK   = '#c88a11';
const BG          = '#f8f7f4';
const CARD        = '#ffffff';
const TEXT        = '#1f1f1f';
const TEXT_MID    = '#555555';
const TEXT_GRAY   = '#888888';
const DIVIDER     = '#f3e9c6';
const SERIF       = Platform.OS === 'ios' ? 'Georgia' : 'serif';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  mainWrapper: {
    flex: 1,
    position: 'relative',
  },

  dashboardArea: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 18,
    backgroundColor: CARD,
  },
  menuButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 30,
    color: GOLD,
    fontWeight: '900',
    lineHeight: 34,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 23,
    fontWeight: '900',
    color: TEXT,
    fontFamily: SERIF,
  },
  notificationButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 28,
    height: 28,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#e53e3e',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // ── Unread bar ──────────────────────────────────────────
  unreadBar: {
    backgroundColor: '#fffbf0',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0d0',
  },
  unreadBarText: {
    color: '#c88a11',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Scroll ──────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 48,
    rowGap: 12,
  },

  // ── Section card ────────────────────────────────────────
  sectionCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    fontFamily: SERIF,
    flex: 1,
  },
  sectionChevron: {
    fontSize: 13,
    color: GOLD,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: DIVIDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },

  // ── Empty / loading ─────────────────────────────────────
  emptyText: {
    color: TEXT_GRAY,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily: SERIF,
  },
  loadingText: {
    color: TEXT_GRAY,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },

  // ── History items ────────────────────────────────────────
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  historyItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  historyDate: {
    fontSize: 12,
    color: TEXT_GRAY,
    marginBottom: 3,
    fontFamily: SERIF,
  },
  historyService: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 12,
    color: TEXT_MID,
    marginBottom: 7,
  },

  // ── Transaction items ────────────────────────────────────
  txItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  txItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  txDate: {
    fontSize: 12,
    color: TEXT_GRAY,
    flex: 1,
    fontFamily: SERIF,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: GOLD,
    fontFamily: SERIF,
    marginLeft: 10,
  },
  txService: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 5,
  },
  txMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    flexWrap: 'wrap',
  },
  txMethod: {
    fontSize: 12,
    color: TEXT_MID,
  },

  // ── Status / payment badges ──────────────────────────────
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Dental chart ─────────────────────────────────────────
  chartScroll: {
    marginBottom: 4,
  },
  chartInner: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  arch: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 2,
  },
  archLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    width: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  midline: {
    width: 1.5,
    height: 44,
    backgroundColor: '#cbd5e0',
    marginHorizontal: 3,
  },
  archGap: {
    height: 8,
  },
  toothWrap: {
    alignItems: 'center',
    rowGap: 2,
  },
  toothNum: {
    fontSize: 7,
    color: '#94a3b8',
    fontFamily: 'monospace',
    lineHeight: 10,
  },
  toothBox: {
    width: 24,
    height: 32,
    borderWidth: 1.5,
    borderRadius: 3,
  },

  // ── Legend ───────────────────────────────────────────────
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 6,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  legendText: {
    fontSize: 11,
    color: TEXT_MID,
  },

  // ── Tooth modal (bottom sheet) ───────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
    minHeight: 240,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT,
    fontFamily: SERIF,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 20,
    color: TEXT_GRAY,
    lineHeight: 22,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalRowLast: {
    borderBottomWidth: 0,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    width: 100,
    flexShrink: 0,
  },
  modalValue: {
    fontSize: 13,
    color: TEXT,
    flex: 1,
    textAlign: 'right',
  },
  modalEmpty: {
    color: TEXT_GRAY,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 22,
    fontFamily: SERIF,
  },

  // ── Inline tooth detail card (below chart) ───────────────
  toothDetailCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 10,
    backgroundColor: '#fefdf9',
    overflow: 'hidden',
  },
  toothDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    backgroundColor: '#fffef9',
  },
  toothDetailTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT,
    fontFamily: SERIF,
  },
  toothDetailClose: {
    padding: 4,
  },
  toothDetailCloseText: {
    fontSize: 18,
    color: TEXT_GRAY,
    lineHeight: 20,
  },
  toothDetailBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  planDivider: {
    height: 1,
    backgroundColor: GOLD_BORDER,
    marginVertical: 14,
  },
  planIndexLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GOLD_DARK,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 2,
  },
});
