import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export const Card = ({ style, children, ...props }: ViewProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevation for Android
    elevation: 3,
  },
});
