import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useI18n } from '@/i18n/I18nContext';
import { ImcCalculator } from '@/services/ImcCalculator';

export default function ModalScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useI18n();
  
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [legs, setLegs] = useState('');
  // Date state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [userHeight, setUserHeight] = useState<number | null>(null);

  useEffect(() => {
    // Load height for BMI calc
    const loadHeight = async () => {
        try {
            const settingsRepo = new SettingsRepository(db);
            const h = await settingsRepo.getSetting('height');
            if (h) setUserHeight(parseFloat(h));
        } catch (e) {
            console.error(e);
        }
    }
    loadHeight();
  }, []);

  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
        setDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!weight) {
        Alert.alert(t.common.error, t.addEntry.validationWeight);
        return;
    }

    setLoading(true);
    try {
        const repo = new MeasurementsRepository(db);
        
        let bmi = 0;
        if (userHeight) {
            bmi = ImcCalculator.calculate(parseFloat(weight), userHeight);
        }

        await repo.addMeasurement({
            date: formatDate(date),
            weight: parseFloat(weight),
            waist: waist ? parseFloat(waist) : undefined,
            hip: hip ? parseFloat(hip) : undefined,
            legs: legs ? parseFloat(legs) : undefined,
            bmi
        });

        // Use router.back() to close modal
        router.back();
    } catch (e) {
        console.error(e);
        Alert.alert(t.common.error, t.addEntry.error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t.addEntry.title}</Text>
          <Text style={styles.subtitle}>{formatDate(date)}</Text>
          
          <View style={styles.form}>
            <Input
              label={t.addEntry.weight}
              placeholder="e.g. 70.5"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              autoFocus
            />
            
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                    <Input
                        label={t.addEntry.waist}
                        placeholder={t.home.addEntry} // using generic placeholder logic or optional
                        keyboardType="numeric"
                        value={waist}
                        onChangeText={setWaist}
                    />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                    <Input
                        label={t.addEntry.hip}
                        placeholder=""
                        keyboardType="numeric"
                        value={hip}
                        onChangeText={setHip}
                    />
                </View>
            </View>

            <Input
              label={t.addEntry.legs}
              placeholder=""
              keyboardType="numeric"
              value={legs}
              onChangeText={setLegs}
            />
             
             {/* Date Picker Trigger */}
            <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>{t.addEntry.date}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}

            <Button 
              title={t.addEntry.save} 
              onPress={handleSave} 
              loading={loading}
              style={{ marginTop: 24 }}
            />
            
            <Button 
                title={t.addEntry.cancel} 
                variant="ghost" 
                onPress={() => router.back()} 
                style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    color: Colors.dark.text,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateButton: {
    backgroundColor: Colors.dark.surfaceHighlight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
  }
});
