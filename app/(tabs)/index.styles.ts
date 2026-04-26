import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 20, // Add bottom padding to avoid tab bar overlap
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  mainCard: {
    marginBottom: 12,
    padding: 16,
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  bigWeight: {
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
  },
  bigUnit: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 6,
  },
  badgeText: {
    fontWeight: "800",
    fontSize: 13,
  },
  chartCard: {
    marginBottom: 12,
    alignItems: "center",
    padding: 12,
    paddingLeft: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Tighter gap
  },
  gridCard: {
    flex: 1,
    minWidth: "30%", // Allow 3 columns (approx 30%)
    padding: 5,
    justifyContent: "center",
    alignItems: "center", // Center align content for 3-col
    height: 70,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  trendContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  rangesContainer: {
    flexDirection: "row", 
    gap: 6
  },
  rangeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  rangeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    paddingHorizontal: 10, 
    marginTop: 10
  },
  paginationButton: {
    padding: 8
  },
  paginationText: {
    fontSize: 12
  },
  emptyChartContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  }
});
