import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28, // Slightly reduced
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    marginLeft: 4,
    opacity: 0.8,
  },
  formGrid: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 44,
    justifyContent: "center",
  },
  sexSelector: {
    flexDirection: "row",
    height: 44,
  },
  sexOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  targetInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  achievementItem: {
    width: "25%",
    paddingHorizontal: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 10,
    textAlign: "center",
    opacity: 0.8,
  },
});
