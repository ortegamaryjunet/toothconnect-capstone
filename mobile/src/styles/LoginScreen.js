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
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 96,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 26,
  },

  logo: {
    width: 135,
    height: 135,
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#b47a00",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  subtitle: {
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

  loginCard: {
    backgroundColor: "#e4cf88",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 34,
    paddingTop: 20,
    paddingBottom: 34,
    minHeight: 390,
  },

  loginTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#c78300",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  successBox: {
    backgroundColor: "#f3fff4",
    borderWidth: 1,
    borderColor: "#78c587",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 14,
  },

  successText: {
    color: "#2f7d3b",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },

  label: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "800",
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

  forgotLink: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 20,
  },

  forgotText: {
    fontSize: 15,
    color: "#bf8300",
    fontWeight: "600",
  },

  error: {
    backgroundColor: "#fff0f0",
    color: "#9b2c2c",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 13,
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
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  divider: {
    height: 1.2,
    backgroundColor: "#b98212",
    marginTop: 28,
    marginBottom: 14,
    width: "100%",
  },

  link: {
    alignItems: "center",
    paddingVertical: 2,
  },

  linkText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  linkHighlight: {
    color: "#b77c00",
    fontWeight: "bold",
  },
  warningBox: {
    backgroundColor: "#fff0f0",
    borderColor: "#e58a8a",
  },
  warningText: {
    color: "#9b2c2c",
  },
});

export default styles;
