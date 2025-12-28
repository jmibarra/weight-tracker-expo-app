import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({ onPress, title, variant = 'primary', loading, style, textStyle }: ButtonProps) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.surfaceHighlight;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return '#FFFFFF'; // Usually primary buttons have white text even in light mode if primary color is dark enough
    if (variant === 'secondary') return colors.text;
    if (variant === 'outline') return colors.primary;
    return colors.textSecondary;
  };

  const dynamicOutlineStyle = variant === 'outline' ? {
      borderWidth: 1,
      borderColor: colors.primary
  } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        dynamicOutlineStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
