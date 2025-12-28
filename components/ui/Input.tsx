import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  const { colors } = useTheme();

  const labelStyle = { color: colors.text, ...styles.label };
  const inputStyle = {
      backgroundColor: colors.surfaceHighlight,
      color: colors.text,
      ...styles.input
  };
  const errorTextStyle = { color: colors.error, ...styles.errorText };

  return (
    <View style={styles.container}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <TextInput
        style={[inputStyle, error ? { borderColor: colors.error } : null, style]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && <Text style={errorTextStyle}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
