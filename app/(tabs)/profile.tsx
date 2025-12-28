import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const repo = new SettingsRepository(db);
      const savedHeight = await repo.getSetting('height');
      const savedSex = await repo.getSetting('sex');
      
      if (savedHeight) setHeight(savedHeight);
      if (savedSex) setSex(savedSex);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const handleSave = async () => {
    if (!height) {
        Alert.alert('Error', 'Please enter your height');
        return;
    }

    setLoading(true);
    try {
      const repo = new SettingsRepository(db);
      await repo.setSetting('height', height);
      await repo.setSetting('sex', sex);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Update your personal details for BMI calculation.</Text>
          
          <View style={styles.form}>
            <Input
              label="Height (cm)"
              placeholder="e.g. 175"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />
            
            <Input
              label="Sex (M/F)"
              placeholder="e.g. M"
              value={sex}
              onChangeText={setSex}
              maxLength={1}
            />

            <Button 
              title="Save Profile" 
              onPress={handleSave} 
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
});
