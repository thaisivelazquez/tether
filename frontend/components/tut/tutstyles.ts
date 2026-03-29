import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const scale = (size: number) => (width / 390) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f0",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: scale(12),
    paddingBottom: scale(36),
    paddingHorizontal: scale(24),
  },
  navBtn: {
    flex: 1,
    borderRadius: scale(50),
    alignItems: "center",
    paddingVertical: scale(16),
  },
  navBtnDark: {
    backgroundColor: "#1a1a1a",
  },
  navBtnLight: {
    backgroundColor: "#e0e0e0",
  },
  navBtnText: {
    fontWeight: "600",
    fontSize: moderateScale(15),
  },
  navBtnTextDark: {
    color: "#fff",
  },
  navBtnTextLight: {
    color: "#1a1a1a",
  },
});