import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nContext';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { InfiniteScrollPicker } from './InfiniteScrollPicker';

interface WeightPickerDialogProps {
  visible: boolean;
  initialValue: number;
  onClose: () => void;
  onSave: (value: number) => void;
  title?: string;
  min?: number;
  max?: number;
}

export function WeightPickerDialog({ 
    visible, 
    initialValue, 
    onClose, 
    onSave, 
    title = "Peso",
    min = 40,
    max = 220
}: WeightPickerDialogProps) {
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [tempValue, setTempValue] = useState(initialValue);
  
  // Sync state when opening
  useEffect(() => {
    if (visible) {
        setTempValue(initialValue);
    }
  }, [visible, initialValue]);

  const integerPart = Math.floor(tempValue);
  const decimalPart = Math.round((tempValue - integerPart) * 10);

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
    setTempValue(newValue);
  };

  const handleDecimalChange = (newDec: number) => {
    const newValue = parseFloat(`${integerPart}.${newDec}`);
    setTempValue(newValue);
  };

  const handleSave = () => {
      onSave(tempValue);
      onClose();
  };

  if (!visible) return null;

  return (

    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: isDark ? '#1C1C1E' : 'white' }]}>
            
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>

          <View style={styles.pickerContainer}>
            {/* Integer Picker */}
            <View style={styles.integerColumn}>
                <InfiniteScrollPicker
                    key={`int-${visible}-${initialValue}`}
                    data={integers}
                    value={integerPart}
                    onValueChange={handleIntegerChange}
                    itemHeight={50}
                    height={250}
                />
            </View>

            {/* Separator */}
            <Text style={[styles.dot, { color: colors.text }]}>.</Text>

            {/* Decimal Picker */}
            <View style={styles.decimalColumn}>
                <InfiniteScrollPicker
                    key={`dec-${visible}-${initialValue}`}
                    data={decimals}
                    value={decimalPart}
                    onValueChange={handleDecimalChange}
                    itemHeight={50}
                    height={250}
                />
            </View>

            {/* Unit */}
            <View style={styles.unitColumn}>
                 <Text style={[styles.unitText, { color: colors.text }]}>kg</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
                <Text style={[styles.buttonText, { color: colors.text }]}>{t.addEntry.cancel.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.button}>
                <Text style={[styles.buttonText, { color: colors.text, fontWeight: 'bold' }]}>{t.common.done.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 250, 
    marginBottom: 20,
  },
  integerColumn: {
    width: 100, // Wider for 3 digits
    height: 250,
  },
  decimalColumn: {
      width: 80, // Increased for visibility
      height: 250,
  },
  picker: {
    width: '100%',
    height: 250,
  },
  dot: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
    marginTop: 10,
  },
  unitColumn: {
    width: 50,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitText: {
     fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
  },
  button: {
      paddingVertical: 8,
      paddingHorizontal: 4,
  },
  buttonText: {
      fontSize: 14,
  }
});
