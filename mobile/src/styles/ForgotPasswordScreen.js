import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  keyboardWrapper: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 18,
  },

  logo: {
    width: 125,
    height: 125,
    marginBottom: 4,
  },

  appTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#b47a00",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  appSubtitle: {
    fontSize: 13,
    color: "#1f1f1f",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  titleLine: {
    width: 195,
    height: 2,
    backgroundColor: "#c88a11",
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#e4cf88",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 34,
    paddingTop: 48,
    paddingBottom: 46,
    minHeight: 360,
    position: "relative",
  },

  backButton: {
    position: "absolute",
    top: 10,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#c98904",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  backButtonText: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 25,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#c78300",
    textAlign: "center",
    marginBottom: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  screenSubtitle: {
    fontSize: 12,
    color: "#1f1f1f",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 20,
  },

  formDivider: {
    height: 1.2,
    backgroundColor: "#b98212",
    marginBottom: 18,
    width: "100%",
  },

  label: {
    fontSize: 19,
    color: "#ffffff",
    fontWeight: "900",
    marginBottom: 6,
    marginTop: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  input: {
    backgroundColor: "#ffffff",
    borderWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2f2f2f",
    marginBottom: 4,
    minHeight: 46,
  },

  passwordWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2f2f2f",
    minHeight: 46,
  },

  eyeButton: {
    paddingHorizontal: 12,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  eyeText: {
    color: "#b77c00",
    fontSize: 12,
    fontWeight: "900",
  },

  otpInput: {
    backgroundColor: "#ffffff",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    color: "#2f2f2f",
    fontWeight: "900",
    letterSpacing: 14,
    minHeight: 54,
    marginHorizontal: 4,
    marginTop: 2,
  },

  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 22,
  },

  resendQuestion: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  resendText: {
    color: "#b77c00",
    fontSize: 14,
    fontWeight: "900",
  },

  error: {
    backgroundColor: "#fff0f0",
    color: "#9b2c2c",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 12,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#c98904",
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "86%",
    marginTop: 26,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});

export default styles;
