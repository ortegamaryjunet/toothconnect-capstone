import { StyleSheet, Platform } from 'react-native';

const GOLD = '#c98b00';
const GOLD_DARK = '#b47a00';
const TEXT = '#171717';
const MUTED = '#6f6f6f';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  mainWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },

  dashboardArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  pageKeyboard: {
    flex: 1,
  },

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 18,
    backgroundColor: '#ffffff',
  },

  menuButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuButtonText: {
    fontSize: 30,
    color: GOLD_DARK,
    fontWeight: '900',
    lineHeight: 34,
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 22,
    fontWeight: '900',
    color: TEXT,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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

  page: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 22,
    paddingTop: 18,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  branchCirclesScroll: {
    height: 92,
    marginBottom: 22,
    flexGrow: 0,
    flexShrink: 0,
  },

  branchCircles: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  branchItem: {
    width: 78,
    alignItems: 'center',
    marginRight: 16,
  },

  branchCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 4,
  },

  branchCircleText: {
    color: GOLD_DARK,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  branchCircleDisabled: {
    backgroundColor: '#f2f2f2',
    elevation: 0,
    shadowOpacity: 0,
  },

  branchCircleTextDisabled: {
    color: '#c0c0c0',
  },

  branchLabel: {
    marginTop: 8,
    fontSize: 11,
    color: TEXT,
    textAlign: 'center',
    width: 78,
  },

  branchLabelDisabled: {
    color: '#c0c0c0',
  },

  searchBox: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  searchIcon: {
    fontSize: 22,
    color: '#7f7f7f',
    marginRight: 10,
    marginTop: -2,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
    paddingVertical: 0,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  filterButton: {
    minWidth: 92,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  filterButtonActive: {
    backgroundColor: GOLD,
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: TEXT,
  },

  filterButtonTextActive: {
    color: '#ffffff',
  },

  body: {
    flex: 1,
  },

  threadRow: {
    minHeight: 84,
    backgroundColor: '#fffaf0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  threadInitial: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 4,
  },

  threadInitialText: {
    color: GOLD_DARK,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  threadInfo: {
    flex: 1,
  },

  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  threadName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: TEXT,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginRight: 8,
  },

  threadTime: {
    fontSize: 12,
    color: GOLD_DARK,
  },

  threadBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  threadPreview: {
    flex: 1,
    fontSize: 13,
    color: '#2f2f2f',
    marginRight: 8,
  },

  unreadBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  noResults: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 13,
    marginTop: 28,
  },

  empty: {
    paddingTop: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  emptyButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  contactPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    zIndex: 80,
    elevation: 80,
  },

  contactPicker: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '70%',
  },

  contactPickerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT,
    marginBottom: 4,
  },

  contactPickerSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 16,
  },

  contactRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },

  contactRowDisabled: {
    opacity: 0.55,
  },

  contactName: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '700',
  },

  contactNameDisabled: {
    color: MUTED,
    fontWeight: '400',
  },

  contactMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
  },

  contactMetaUnavailable: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 3,
    fontStyle: 'italic',
  },

  contactCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
  },

  contactCloseBtnText: {
    color: GOLD_DARK,
    fontSize: 13,
    fontWeight: '700',
  },

  loading: {
    color: MUTED,
    textAlign: 'center',
    padding: 40,
  },

  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    elevation: 50,
  },

  darkBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },

  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
    zIndex: 60,
    elevation: 60,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  avatarText: {
    fontSize: 20,
    color: GOLD_DARK,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  profileTextArea: {
    flex: 1,
    justifyContent: 'center',
  },

  profileName: {
    fontSize: 18,
    color: GOLD_DARK,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  profileBranch: {
    fontSize: 13,
    color: '#8a650e',
    marginTop: 4,
  },

  sidebarLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 14,
  },

  menuList: {
    flex: 1,
    //justifyContent: 'center',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    minHeight: 42,
  },

  activeMenuItem: {
    backgroundColor: '#fff8e7',
  },

  menuUnreadBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 999,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuUnreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },

  sidebarIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    color: GOLD_DARK,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  activeMenuText: {
    color: GOLD_DARK,
  },

  signOutSection: {
    marginTop: 'auto',
  },

  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 42,
  },

  signOutText: {
    flex: 1,
    fontSize: 15,
    color: GOLD_DARK,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default styles;
