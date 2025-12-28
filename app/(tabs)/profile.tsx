import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useI18n } from '@/i18n/I18nContext';

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useI18n();

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
        Alert.alert(t.common.error, t.profile.validationHeight);
        return;
    }

    setLoading(true);
    try {
      const repo = new SettingsRepository(db);
      await repo.setSetting('height', height);
      await repo.setSetting('sex', sex);
      Alert.alert(t.common.success, t.profile.success);
    } catch (e) {
      Alert.alert(t.common.error, t.profile.error);
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
          <Text style={styles.title}>{t.profile.title}</Text>
          <Text style={styles.subtitle}>{t.profile.subtitle}</Text>
          
          <View style={styles.form}>
            <Input
              label={t.profile.height}
              placeholder="e.g. 175"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              maxLength={3}
            />
            
            <Input
              label={t.profile.sex}
              placeholder="e.g. M"
              value={sex}
              onChangeText={setSex}
              maxLength={1}
            />

            <Button 
              title={t.profile.save} 
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
