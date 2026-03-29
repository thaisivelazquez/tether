import { Dimensions, StyleSheet } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");
const CONTAINER_WIDTH = Math.min(SW, 430);
const BASE_WIDTH = 390;
export const scale = (size: number) => (CONTAINER_WIDTH / BASE_WIDTH) * size;
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

  // ── Main content ──
  verifyMain: {
    flex: 1,
    paddingTop: SH * 0.22,
    paddingHorizontal: scale(24),
    gap: scale(12),
    zIndex: 2,
  },

  verifyTitle: {
    fontSize: moderateScale(36),
    fontWeight: "500",
    letterSpacing: -1,
    color: "#1a1a1a",
    lineHeight: moderateScale(42),
  },

  verifySubtitle: {
    fontSize: moderateScale(13),
    color: "#1a1a1a",
    marginBottom: scale(8),
  },

  // ── OTP boxes ──
  otpRow: {
    flexDirection: "row",
    gap: scale(8),
    width: "100%",
    marginBottom: scale(24),
  },

  otpBox: {
    flex: 1,
    height: scale(56),
    borderRadius: scale(14),
    borderWidth: 1.5,
    borderColor: "#111",
    backgroundColor: "#e9e9e9",
    justifyContent: "center",
    alignItems: "center",
  },

  otpInput: {
    fontSize: moderateScale(22),
    color: "#1a1a1a",
    width: "100%",
    height: "100%",
    textAlign: "center",
  },

  // ── Buttons ──
  verifyContinueBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SH * 0.018,
    minHeight: scale(44),
  },

  verifyContinueText: {
    fontSize: moderateScale(14),
    color: "#1a1a1a",
  },

  resendText: {
    fontSize: moderateScale(12),
    color: "#9b9b9b",
    textAlign: "center",
  },


  feed: {
    position: "absolute",
    bottom: scale(90),
    left: scale(24),
    right: scale(24),
    zIndex: 0,
  },

  feedItem: {
    fontSize: moderateScale(12),
    color: "#1a1a1a",
    height: scale(22),
    lineHeight: scale(22),
  },
});