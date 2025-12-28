import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { ImcCalculator } from '@/services/ImcCalculator';

export default function ModalScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [legs, setLegs] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [userHeight, setUserHeight] = useState<number | null>(null);

  useEffect(() => {
    // Load height for BMI calc
    const loadHeight = async () => {
        const settingsRepo = new SettingsRepository(db);
        const h = await settingsRepo.getSetting('height');
        if (h) setUserHeight(parseFloat(h));
    }
    loadHeight();
  }, []);

  const handleSave = async () => {
    if (!weight) {
        Alert.alert('Validation Error', 'Weight is required');
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
            date,
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
        Alert.alert('Error', 'Failed to save entry');
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
          <Text style={styles.title}>New Entry</Text>
          <Text style={styles.subtitle}>{date}</Text>
          
          <View style={styles.form}>
            <Input
              label="Weight (kg) *"
              placeholder="e.g. 70.5"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              autoFocus
            />
            
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                    <Input
                        label="Waist (cm)"
                        placeholder="Optional"
                        keyboardType="numeric"
                        value={waist}
                        onChangeText={setWaist}
                    />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                    <Input
                        label="Hip (cm)"
                        placeholder="Optional"
                        keyboardType="numeric"
                        value={hip}
                        onChangeText={setHip}
                    />
                </View>
            </View>

            <Input
              label="Legs (cm)"
              placeholder="Optional"
              keyboardType="numeric"
              value={legs}
              onChangeText={setLegs}
            />
             
             {/* Date input could be a picker, simplifying to text for now or just today */}
             <Input 
                label="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
             />

            <Button 
              title="Save Entry" 
              onPress={handleSave} 
              loading={loading}
              style={{ marginTop: 24 }}
            />
            
            <Button 
                title="Cancel" 
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
  }
});
