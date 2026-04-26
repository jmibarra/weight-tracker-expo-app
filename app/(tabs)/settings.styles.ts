import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    lineHeight: 22,
  },
  langRow: {
    alignItems: 'flex-start',
  },
  langButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  langText: {
    fontSize: 16,
    fontWeight: '500'
  },
  subtext: {
      fontSize: 12
  },
  themeRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
  },
  themeOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
  },
  themeText: {
      fontWeight: '600',
      fontSize: 14,
  }
});
