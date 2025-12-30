import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WeightPickerDialog } from '@/components/WeightPickerDialog';
import { useTheme } from '@/context/ThemeContext';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useI18n } from '@/i18n/I18nContext';
import { ImcCalculator } from '@/services/ImcCalculator';

export default function ModalScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useI18n();
  const { colors, isDark } = useTheme();
  
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [legs, setLegs] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showWeightPicker, setShowWeightPicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        try {
            const settingsRepo = new SettingsRepository(db);
            const h = await settingsRepo.getSetting('height');
            if (h) setUserHeight(parseFloat(h));

            if (params.id) {
                const id = parseInt(params.id as string);
                setEditId(id);
                const measurementsRepo = new MeasurementsRepository(db);
                const m = await measurementsRepo.getMeasurementById(id);
                if (m) {
                    setWeight(m.weight.toString());
                    setWaist(m.waist ? m.waist.toString() : '');
                    setHip(m.hip ? m.hip.toString() : '');
                    setLegs(m.legs ? m.legs.toString() : '');
                    
                    // Manually parse YYYY-MM-DD to avoid UTC timezone shifts
                    const [year, month, day] = m.date.split('-').map(Number);
                    setDate(new Date(year, month - 1, day)); 
                }
            } else {
                 // Create Mode: Init with latest weight or 70
                 const measurementsRepo = new MeasurementsRepository(db);
                 const latest = await measurementsRepo.getLatestMeasurement();
                 if (latest) {
                     setWeight(latest.weight.toString());
                 } else {
                     setWeight('70.0');
                 }
            }
        } catch (e) {
            console.error(e);
        }
    }
    loadData();
  }, [params.id]);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
        setDate(selectedDate);
    }
  };

  const handleDelete = async () => {
      if (!editId) return;

      Alert.alert(
          t.addEntry.delete, 
          t.addEntry.confirmDelete,
          [
              { text: t.addEntry.cancel, style: 'cancel' },
              { text: t.addEntry.delete, style: 'destructive', onPress: async () => {
                   try {
                        setLoading(true);
                        const repo = new MeasurementsRepository(db);
                        await repo.deleteMeasurement(editId);
                        router.back();
                   } catch(e) {
                       Alert.alert(t.common.error, String(e));
                   } finally {
                       setLoading(false);
                   }
              }}
          ]
      );
  }

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

        const data = {
            date: formatDate(date),
            weight: parseFloat(weight),
            waist: waist ? parseFloat(waist) : undefined,
            hip: hip ? parseFloat(hip) : undefined,
            legs: legs ? parseFloat(legs) : undefined,
            bmi
        };

        if (editId) {
            await repo.updateMeasurement({ ...data, id: editId });
        } else {
            await repo.addMeasurement(data);
        }

        router.back();
    } catch (e) {
        console.error(e);
        Alert.alert(t.common.error, t.addEntry.error);
    } finally {
        setLoading(false);
    }
  };

  // Dynamic Styles
  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const titleStyle = { ...styles.title, color: colors.text };
  const subtitleStyle = { ...styles.subtitle, color: colors.primary };
  const dateLabelStyle = { ...styles.dateLabel, color: colors.text };
  const dateButtonStyle = { ...styles.dateButton, backgroundColor: colors.surfaceHighlight };
  const dateButtonTextStyle = { ...styles.dateButtonText, color: colors.text };
  const deleteButtonStyle = { marginTop: 16, borderColor: colors.error };
  const deleteButtonTextStyle = { color: colors.error };

  return (
    <View style={containerStyle}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={titleStyle}>{editId ? t.addEntry.editTitle : t.addEntry.title}</Text>
          <Text style={subtitleStyle}>{formatDate(date)}</Text>
          
          <View style={styles.form}>
            {/* Weight Picker */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ ...styles.dateLabel, color: colors.text }}>{t.addEntry.weight}</Text>
                 <TouchableOpacity 
                    onPress={() => setShowWeightPicker(true)}
                    style={{ 
                        padding: 16, 
                        borderWidth: 1, 
                        borderColor: colors.border, 
                        borderRadius: 8,
                        backgroundColor: colors.surface
                    }}
                 >
                    <Text style={{ fontSize: 18, color: colors.text }}>
                        {weight ? `${weight} kg` : 'Seleccionar peso'}
                    </Text>
                 </TouchableOpacity>

                 <WeightPickerDialog
                    visible={showWeightPicker}
                    initialValue={weight ? parseFloat(weight) : 70.0}
                    onClose={() => setShowWeightPicker(false)}
                    onSave={(val) => setWeight(val.toString())}
                 />
            </View>
            
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                    <Input
                        label={t.addEntry.waist}
                        placeholder="" 
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
             
            <View style={styles.dateContainer}>
                <Text style={dateLabelStyle}>{t.addEntry.date}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={dateButtonStyle}>
                    <Text style={dateButtonTextStyle}>{formatDate(date)}</Text>
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
              title={editId ? t.addEntry.update : t.addEntry.save} 
              onPress={handleSave} 
              loading={loading}
              style={{ marginTop: 24 }}
            />

            {editId && (
                 <Button 
                    title={t.addEntry.delete} 
                    variant="outline"
                    onPress={handleDelete} 
                    style={deleteButtonStyle}
                    textStyle={deleteButtonTextStyle}
                />
            )}
            
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateButtonText: {
    fontSize: 16,
  }
});
