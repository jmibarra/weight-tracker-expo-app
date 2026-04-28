import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  list: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  itemCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  weight: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
  },
  calendarCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 0.75,
    padding: 3,
  },
  calendarCellInner: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 4,
  },
  calendarDayNumber: {
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-start',
    opacity: 0.6,
  },
  calendarWeight: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  calendarDiff: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  }
});
