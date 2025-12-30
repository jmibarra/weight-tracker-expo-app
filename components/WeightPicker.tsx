import { useTheme } from '@/context/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WeightPickerProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function WeightPicker({ value, onValueChange, min = 30, max = 300 }: WeightPickerProps) {
  const { colors } = useTheme();

  const integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 10);

  const integers = useMemo(() => {
    const arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
  }, [min, max]);

  const decimals = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], []);

  const handleIntegerChange = (newInt: number) => {
    const newValue = parseFloat(`${newInt}.${decimalPart}`);
    onValueChange(newValue);
  };

  const handleDecimalChange = (newDec: number) => {
    const newValue = parseFloat(`${integerPart}.${newDec}`);
    onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={integerPart}
          onValueChange={handleIntegerChange}
          style={styles.picker}
          itemStyle={{ color: colors.text }}
        >
          {integers.map((i) => (
            <Picker.Item key={i} label={i.toString()} value={i} />
          ))}
        </Picker>
      </View>
      <Text style={[styles.separator, { color: colors.text }]}>.</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={decimalPart}
          onValueChange={handleDecimalChange}
          style={styles.picker}
          itemStyle={{ color: colors.text }}
        >
          {decimals.map((d) => (
             <Picker.Item key={d} label={d.toString()} value={d} />
          ))}
        </Picker>
      </View>
      <Text style={[styles.unit, { color: colors.text }]}>KG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150, // Fixed height for standard picker feel
  },
  pickerContainer: {
    width: 70, 
    height: 150,
  },
  picker: {
    flex: 1,
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 4,
    marginTop: 8, // Visual alignment corrections
  },
  unit: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    marginTop: 8,
  }
});
