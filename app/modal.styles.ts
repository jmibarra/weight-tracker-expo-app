import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  dateButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dateButtonText: {
    fontSize: 16,
  },
});
