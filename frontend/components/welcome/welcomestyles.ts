import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  slide: {
   
    height,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 46,
    paddingHorizontal: 24,
  },

  artWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },

  textWrap: {
    alignItems: "center",
    marginTop: -6,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },

  nextBtnText: {
    fontSize: 11,
    color: "#111",
  },

  nextBtnArrow: {
    fontSize: 14,
    color: "#111",
  },

  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },

  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#cfcfcf",
  },

  progressDotActive: {
    width: 28,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#8d8d8d",
  },

  orbitOuter: {
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 6,
  },

  orbitInner: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#777",
    position: "absolute",
  },

  orbitDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#c8c8c8",
    position: "absolute",
  },

  orbitDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#a9a9a9",
    position: "absolute",
  },

  orbitTinyA: {
    position: "absolute",
    left: 62,
    bottom: 42,
    fontSize: 5,
    color: "#444",
  },

  orbitTinyB: {
    position: "absolute",
    left: 70,
    bottom: 34,
    fontSize: 5,
    color: "#444",
  },

  cardsStack: {
    width: "100%",
    paddingHorizontal: 4,
    gap: 10,
    marginTop: 18,
  },

  planCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 0.6,
    borderColor: "#ececec",
  },

  planCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planMeta: {
    fontSize: 7,
    color: "#777",
  },

  planArrow: {
    fontSize: 12,
    color: "#777",
  },

  planTitle: {
    fontSize: 8,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
    marginBottom: 6,
  },

  planCardBottom: {
    flexDirection: "row",
    gap: 8,
  },

  planSub: {
    fontSize: 6,
    color: "#8d8d8d",
  },

  busyArtBox: {
    width: 280,
    height: 180,
    position: "relative",
    marginTop: 12,
  },

  spiralLarge: {
    position: "absolute",
    top: 8,
    left: 2,
    width: 66,
    height: 66,
    borderWidth: 4,
    borderColor: "#111",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  spiralLarge2: {
    width: 42,
    height: 42,
    borderWidth: 4,
    borderColor: "#111",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  spiralLarge3: {
    width: 18,
    height: 18,
    borderWidth: 4,
    borderColor: "#111",
    borderRadius: 999,
  },

  loopTopRight: {
    position: "absolute",
    top: 6,
    right: 46,
    width: 42,
    height: 42,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderRadius: 999,
    borderColor: "#111",
    transform: [{ rotate: "40deg" }],
  },

  loopBottomLeft: {
    position: "absolute",
    top: 96,
    left: 30,
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: "#111",
    borderRadius: 999,
    transform: [{ rotate: "18deg" }],
  },

  scribbleRight: {
    position: "absolute",
    top: 70,
    right: 4,
    width: 70,
    height: 34,
    borderBottomWidth: 3,
    borderColor: "#111",
    borderRadius: 30,
    transform: [{ rotate: "18deg" }],
  },

  star: {
    position: "absolute",
    fontSize: 14,
    color: "#555",
  },

  formSlide: {
    width: "100%",
    flex: 1,
    paddingTop: 36,
  },

  formHeader: {
    width: "100%",
    marginBottom: 18,
  },

  formTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    color: "#111",
  },

  formFields: {
    width: "100%",
    gap: 14,
  },

  formRow: {
    flexDirection: "row",
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  fullField: {
    width: "100%",
  },

  fieldLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },

  field: {
    height: 34,
    backgroundColor: "#cfcfcf",
    borderRadius: 2,
    paddingHorizontal: 8,
    color: "#111",
  },

  focusField: {
    height: 34,
    backgroundColor: "#cfcfcf",
    borderRadius: 2,
    paddingHorizontal: 8,
    color: "#111",
    borderWidth: 2,
    borderColor: "#4ea1ff",
  },

  selectField: {
    height: 34,
    backgroundColor: "#cfcfcf",
    borderRadius: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectFieldText: {
    color: "#111",
  },

  selectFieldChevron: {
    fontSize: 14,
    color: "#888",
  },

  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 54,
  },

  completeBtnText: {
    fontSize: 11,
    color: "#111",
  },

  completeBtnArrow: {
    fontSize: 14,
    color: "#111",
  },
});