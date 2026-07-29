import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  mainWrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
    position: "relative",
  },

  dashboardArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingHorizontal: 18,
    backgroundColor: "#ffffff",
  },

  menuButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonText: {
    fontSize: 30,
    color: "#b47a00",
    fontWeight: "900",
    lineHeight: 34,
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 23,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  notificationButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: 25,
    height: 25,
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 42,
  },

  greetingSection: {
    marginBottom: 24,
  },

  greetingText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#b47a00",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  branchBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
  },

  branchBadgeLabel: {
    fontSize: 9,
    color: "#cbd5e1",
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 2,
  },

  branchBadgeText: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "800",
  },

  appointmentCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 25,
    minHeight: 140,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  cardSmallTitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  appointmentTitle: {
    fontSize: 22,
    color: "#1f2937",
    fontWeight: "900",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  appointmentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  appointmentInfo: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "700",
  },

  appointmentDot: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "700",
    marginHorizontal: 7,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  sectionHeaderOnly: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 12,
  },

  bullet: {
    fontSize: 20,
    color: "#94a3b8",
    fontWeight: "900",
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 19,
    color: "#1f1f1f",
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  viewHistoryText: {
    fontSize: 12,
    color: "#b47a00",
    fontWeight: "800",
  },

  healthCard: {
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#e4cf88",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  percentCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 9,
    borderColor: "#10a83a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    backgroundColor: "#ffffff",
  },

  percentText: {
    fontSize: 22,
    color: "#000000",
    fontWeight: "900",
  },

  healthTextArea: {
    flex: 1,
  },

  healthStatus: {
    fontSize: 34,
    color: "#10a83a",
    fontWeight: "900",
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  healthDescription: {
    fontSize: 12,
    color: "#1f1f1f",
    fontWeight: "700",
    lineHeight: 18,
  },

  noApptText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 4,
  },

  clinicCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  clinicCardTitle: {
    fontSize: 18,
    color: "#b47a00",
    fontWeight: "900",
    marginTop: 16,
    marginHorizontal: 18,
    marginBottom: 13,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  branchTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },

  branchTab: {
    flex: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4cf88",
    borderRadius: 18,
    minHeight: 40,
    paddingVertical: 9,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  dynamicBranchTab: {
    minWidth: 136,
  },

  activeBranchTab: {
    backgroundColor: "#c98904",
    borderColor: "#c98904",
  },

  branchTabText: {
    fontSize: 13,
    color: "#1f1f1f",
    fontWeight: "800",
    textAlign: "center",
  },

  activeBranchTabText: {
    color: "#ffffff",
  },

  clinicInfo: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e4cf88",
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  clinicLogoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: "#c98904",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  clinicLogoText: {
    fontSize: 20,
    color: "#c98904",
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  clinicDetails: {
    flex: 1,
  },

  clinicName: {
    fontSize: 19,
    color: "#1f1f1f",
    fontWeight: "900",
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  clinicAddress: {
    fontSize: 13,
    color: "#1f1f1f",
    lineHeight: 18,
  },

  clinicTime: {
    fontSize: 13,
    color: "#1f1f1f",
    marginTop: 6,
  },

  clinicStats: {
    flexDirection: "row",
    paddingVertical: 14,
    backgroundColor: "#f7f8fc",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    color: "#b47a00",
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  statLabel: {
    fontSize: 13,
    color: "#1f1f1f",
    fontWeight: "600",
  },

  statDivider: {
    width: 1,
    backgroundColor: "#d6bc70",
  },

  dentistScroll: {
    paddingVertical: 8,
    paddingRight: 18,
  },

  dentistCard: {
    width: 190,
    minHeight: 212,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0ece4",
    borderRadius: 16,
    padding: 18,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  dentistInitialBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#eff3ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  dentistInitial: {
    fontSize: 25,
    color: "#4b6cb7",
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  dentistName: {
    fontSize: 16,
    color: "#1f1f1f",
    fontWeight: "900",
    marginBottom: 6,
    lineHeight: 20,
  },

  dentistSpecialty: {
    fontSize: 13,
    color: "#1f1f1f",
    marginBottom: 10,
    lineHeight: 18,
    fontWeight: "600",
  },

  dentistBranch: {
    fontSize: 12,
    color: "#8a650e",
    marginBottom: 6,
    fontWeight: "700",
    lineHeight: 16,
  },

  dentistSchedule: {
    fontSize: 12,
    color: "#169c45",
    fontWeight: "800",
    lineHeight: 16,
  },

  servicesCard: {
    backgroundColor: "#f0f2f5",
    borderRadius: 10,
    padding: 12,
  },

  serviceItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },

  serviceItemExpanded: {
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: '#fff8e7',
  },

  serviceItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  serviceName: {
    flex: 1,
    fontSize: 15,
    color: "#1f1f1f",
    fontWeight: "800",
  },

  serviceTime: {
    fontSize: 13,
    color: "#8a650e",
    fontWeight: "700",
    marginRight: 8,
  },

  serviceChevron: {
    fontSize: 12,
    color: "#b47a00",
    fontWeight: "900",
  },

  serviceExpandedContent: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0e8cc",
    paddingTop: 12,
  },

  serviceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  serviceDetailLabel: {
    fontSize: 13,
    color: "#8a650e",
    fontWeight: "800",
    flex: 1,
  },

  serviceDetailValue: {
    fontSize: 13,
    color: "#1f1f1f",
    fontWeight: "700",
    flex: 2,
    textAlign: "right",
  },

  serviceDescText: {
    textAlign: "left",
  },

  serviceCollapseBtn: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 7,
    paddingHorizontal: 18,
    backgroundColor: "#e8eaf0",
    borderRadius: 20,
  },

  serviceCollapseBtnText: {
    fontSize: 12,
    color: "#b47a00",
    fontWeight: "800",
  },

  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    elevation: 50,
  },

  darkBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },

  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
    zIndex: 60,
    elevation: 60,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  avatarText: {
    fontSize: 20,
    color: "#b47a00",
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  profileTextArea: {
    flex: 1,
    justifyContent: "center",
  },

  profileName: {
    fontSize: 18,
    color: "#b47a00",
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  profileBranch: {
    fontSize: 13,
    color: "#8a650e",
    marginTop: 4,
  },

  sidebarLine: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 14,
  },

  menuList: {
    flex: 1,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    minHeight: 42,
  },

  activeMenuItem: {
    backgroundColor: "#fff8e7",
  },

  sidebarIcon: {
    width: 20,
    height: 20,
    marginRight: 16,
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    color: "#b47a00",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  activeMenuText: {
    color: "#b47a00",
  },

  signOutSection: {
    marginTop: "auto",
  },

  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 42,
  },

  signOutText: {
    flex: 1,
    fontSize: 15,
    color: "#b47a00",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

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
});

export default styles;
