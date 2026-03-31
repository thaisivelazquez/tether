import { Dimensions, StyleSheet } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");
const BASE_WIDTH = 390;
export const scale = (size: number) => (SW / BASE_WIDTH) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

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
    bottom: scale(90),
    left: scale(24),
    right: scale(24),
    gap: 8,
    zIndex: 0,
  },

  feedItem: {
    fontSize: moderateScale(12),
    color: "#ababab",
    lineHeight: moderateScale(18),
  },

  main: {
    flex: 1,
    alignItems: "center" as const,
    paddingTop: SH * 0.25,
    paddingHorizontal: scale(24),
    gap: 12,
    zIndex: 2,
  },

  title: {
    fontSize: moderateScale(40),
    fontWeight: "500" as const,
    letterSpacing: -1,
    color: "#1a1a1a",
  },

  tagline: {
    fontSize: moderateScale(14),
    color: "#1a1a1a",
    textAlign: "center" as const,
    marginBottom: scale(24),
  },

  phoneRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: scale(12),
    width: "100%",
    marginBottom: scale(8),
    zIndex: 3,
  },

  countryPill: {
    width: scale(112),
    height: scale(68),
    borderRadius: scale(34),
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#e9e9e9",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: scale(18),
  },

  phonePill: {
    flex: 1,
    height: scale(68),
    borderRadius: scale(34),
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#e9e9e9",
    justifyContent: "center" as const,
    paddingHorizontal: scale(22),
  },

  flag: {
    fontSize: moderateScale(24),
    color: "#111",
  },

  chevron: {
    fontSize: moderateScale(24),
    color: "#111",
    lineHeight: moderateScale(24),
  },

  phoneInput: {
    flex: 1,
    fontSize: moderateScale(24),
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
    gap: scale(8),
    paddingVertical: SH * 0.018,
    minHeight: scale(44),
  },

  submitText: {
    fontSize: moderateScale(14),
    color: "#1a1a1a",
  },

  modalOverlay: {
    flex: 1,
  },

  dropdownAnchor: {
    position: "absolute",
    top: SH * 0.46,      // was hardcoded 460
    left: scale(24),
    width: scale(260),
    zIndex: 20,
  },

  dropdown: {
    backgroundColor: "#f6f6f6",
    borderRadius: scale(18),
    paddingVertical: scale(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  dropdownOption: {
    height: scale(54),
    paddingHorizontal: scale(14),
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },

  dropdownOptionSelected: {
    backgroundColor: "#ececec",
  },

  dropdownFlag: {
    width: scale(42),
    fontSize: moderateScale(20),
    color: "#111",
  },

  dropdownLabel: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#111",
  },

  dropdownCode: {
    fontSize: moderateScale(15),
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
    top: -scale(10),
    right: scale(40),
    width: scale(390),
    height: scale(420),
  },

  decoInner: {
    position: "absolute",
    top: -scale(2),
    right: 7,
    width: scale(220),
    height: scale(220),
  },

  decoDotLeft: {
    position: "absolute",
    top: SH * 0.03,
    right: SW * 0.25,
    width: scale(62),
    height: scale(45),
  },

  decoDotRight: {
    position: "absolute",
    top: SH * 0.05,
    right: SW * 0.02,
    width: scale(60),
    height: scale(45),
  },
});