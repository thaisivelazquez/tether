import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    maxWidth: 430,
    alignSelf: "center",
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },

  keyboardView: {
    flex: 1,
    zIndex: 2,
  },

  feed: {
    position: "absolute",
    bottom: 90,
    left: 24,
    right: 24,
    gap: 8,
    zIndex: 0,
  },

  feedItem: {
    fontSize: 12,
    color: "#ababab",
    lineHeight: 18,
  },

  main: {
    flex: 1,
    alignItems: "center" as const,
    paddingTop: height * 0.25,
    paddingHorizontal: 24,
    gap: 12,
    zIndex: 2,
  },

  title: {
    fontSize: 40,
    fontWeight: "500" as const,
    letterSpacing: -1,
    color: "#1a1a1a",
  },

  tagline: {
    fontSize: 14,
    color: "#1a1a1a",
    textAlign: "center" as const,
    marginBottom: 24,
  },

  phoneRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    width: "100%",
    marginBottom: 8,
    zIndex: 3,
  },

  countryPill: {
    width: 112,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#e9e9e9",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 18,
  },

  phonePill: {
    flex: 1,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#e9e9e9",
    justifyContent: "center" as const,
    paddingHorizontal: 22,
  },

  flag: {
    fontSize: 24,
    color: "#111",
  },

  chevron: {
    fontSize: 24,
    color: "#111",
    lineHeight: 24,
  },

  phoneInput: {
    flex: 1,
    fontSize: 24,
    color: "#111",
    outlineWidth: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  submitBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 8,
    minHeight: 44,
  },

  submitText: {
    fontSize: 14,
    color: "#1a1a1a",
  },

  modalOverlay: {
    flex: 1,
  },

  dropdownAnchor: {
    position: "absolute",
    top: 460,
    left: 24,
    width: 260,
    zIndex: 20,
  },

  dropdown: {
    backgroundColor: "#f6f6f6",
    borderRadius: 18,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  dropdownOption: {
    height: 54,
    paddingHorizontal: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },

  dropdownOptionSelected: {
    backgroundColor: "#ececec",
  },

  dropdownFlag: {
    width: 42,
    fontSize: 20,
    color: "#111",
  },

  dropdownLabel: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },

  dropdownCode: {
    fontSize: 15,
    color: "#9b9b9b",
  },

  decoWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  decoOuter: {
    position: "absolute",
    top: -10,
    right: 0,
  },

  decoInner: {
    position: "absolute",
    top: -2,
    right: -4,
  },

  decoDotLeft: {
    position: "absolute",
    top: 78,
    right: 180,
  },

  decoDotRight: {
    position: "absolute",
    top: 104,
    right: 26,
  },


verifyMain: {
  flex: 1,
  alignItems: "center" as const,
  paddingTop: 180,
  paddingHorizontal: 24,
  zIndex: 2,
},

verifyTitle: {
  fontSize: 28,
  lineHeight: 34,
  fontWeight: "700" as const,
  textAlign: "center" as const,
  color: "#111",
  marginBottom: 12,
},

verifySubtitle: {
  fontSize: 11,
  color: "#111",
  textAlign: "center" as const,
  marginBottom: 34,
},

otpRow: {
  flexDirection: "row" as const,
  gap: 10,
  marginBottom: 28,
},

otpBox: {
  width: 18,
  borderBottomWidth: 1.5,
  borderBottomColor: "#999",
  alignItems: "center" as const,
  justifyContent: "center" as const,
},

otpInput: {
  width: 18,
  height: 28,
  fontSize: 16,
  color: "#111",
  padding: 0,
},

verifyContinueBtn: {
  marginBottom: 12,
},

verifyContinueText: {
  fontSize: 12,
  color: "#111",
},

resendText: {
  fontSize: 10,
  color: "#555",
},
});