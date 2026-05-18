import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    keyboardView: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },

    mainWrapper: {
        flex: 1,
        backgroundColor: "#F5F6FA",
        position: "relative",
    },

    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },

    scrollContent: {
        paddingBottom: 34,
    },

    headerCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 6,
        marginTop: 6,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 22,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    menuIcon: {
        fontSize: 30,
        color: "#B77A00",
        fontWeight: "800",
        marginRight: 14,
        marginTop: -2,
    },

    headerTitle: {
        flex: 1,
        fontSize: 19,
        fontWeight: "800",
        color: "#1f1f1f",
    },

    editButton: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 7,
        paddingHorizontal: 17,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#C9A64C",

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    editButtonText: {
        fontSize: 12,
        color: "#111111",
        fontWeight: "800",
    },

    buttonDisabled: {
        opacity: 0.55,
    },

    avatarBox: {
        width: 74,
        height: 74,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        alignSelf: "center",
        marginTop: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D4B15D",
    },

    avatarText: {
        fontSize: 28,
        color: "#B77A00",
        fontWeight: "900",
    },

    nameText: {
        textAlign: "center",
        marginTop: 10,
        fontSize: 18,
        color: "#B77A00",
        fontWeight: "900",
    },

    patientSince: {
        textAlign: "center",
        marginTop: 4,
        fontSize: 11,
        color: "#111111",
        fontWeight: "500",
    },

    formCard: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 18,
        marginTop: 18,
        marginBottom: 30,
        paddingHorizontal: 24,
        paddingTop: 21,
        paddingBottom: 26,
        borderRadius: 24,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },

    sectionTitle: {
        textAlign: "center",
        fontSize: 21,
        color: "#B77A00",
        fontWeight: "900",
    },

    titleLine: {
        width: "70%",
        height: 1.5,
        backgroundColor: "#D4A017",
        alignSelf: "center",
        marginTop: 13,
        marginBottom: 25,
    },

    loadingProfile: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: 8,
        marginBottom: 18,
    },

    loadingProfileText: {
        color: "#8A650E",
        fontSize: 13,
        fontWeight: "700",
    },

    inputGroup: {
        marginBottom: 16,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        columnGap: 14,
    },

    halfInputGroup: {
        flex: 1,
        marginBottom: 16,
    },

    label: {
        fontSize: 13,
        color: "#B77A00",
        fontWeight: "900",
        marginBottom: 7,
    },

    input: {
        minHeight: 43,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#CFCFCF",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: "#222222",
    },

    disabledInput: {
        backgroundColor: "#FAFAFA",
        color: "#555555",
    },

    inputError: {
        borderColor: "#D9534F",
        borderWidth: 1.2,
    },

    errorText: {
        color: "#D9534F",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 5,
    },

    addressInput: {
        height: 82,
        paddingTop: 11,
        paddingBottom: 11,
    },

    dropdownInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    dropdownText: {
        fontSize: 14,
        color: "#222222",
        flex: 1,
    },

    placeholderText: {
        color: "#A8A8A8",
    },

    dropdownArrow: {
        fontSize: 18,
        color: "#B77A00",
        fontWeight: "800",
        marginLeft: 8,
    },

    sexChoiceRow: {
        flexDirection: "row",
        columnGap: 8,
    },

    sexButton: {
        flex: 1,
        height: 43,
        borderWidth: 1,
        borderColor: "#CFCFCF",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },

    sexButtonActive: {
        backgroundColor: "#B77A00",
        borderColor: "#B77A00",
    },

    sexButtonText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#B77A00",
    },

    sexButtonTextActive: {
        color: "#FFFFFF",
    },

    disabledChoice: {
        backgroundColor: "#FAFAFA",
    },

    saveButton: {
        backgroundColor: "#B77A00",
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 6,
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.13,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "900",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 25,
    },

    modalCard: {
        width: "100%",
        maxHeight: "75%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 18,
        paddingBottom: 16,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#B77A00",
        textAlign: "center",
        marginBottom: 14,
    },

    nationalityOption: {
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: "#EFE6CF",
    },

    nationalityOptionText: {
        fontSize: 15,
        color: "#222222",
        fontWeight: "600",
    },

    modalCloseButton: {
        marginTop: 14,
        backgroundColor: "#B77A00",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    modalCloseButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "900",
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

    sidebarAvatarBox: {
        width: 52,
        height: 52,
        borderRadius: 11,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 13,
    },

    sidebarAvatarText: {
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
        //justifyContent: "center",
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
});

export default styles;
