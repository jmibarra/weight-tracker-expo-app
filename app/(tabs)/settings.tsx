import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { useI18n } from '@/i18n/I18nContext';

export default function OptionsScreen() {
    const router = useRouter();
    const db = useSQLiteContext();
    const { t, locale, setLocale } = useI18n();

    const handleImportCsv = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'text/comma-separated-values',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            
            // Basic CSV parsing
            const lines = content.split('\n');
            const repo = new MeasurementsRepository(db);
            
            let count = 0;
            
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                
                const parts = line.split(',');
                if (parts.length < 2) continue; // Minimum date and weight
                
                // Check if header
                if (parts[0].toLowerCase().includes('date') || parts[0].toLowerCase().includes('fecha')) continue;

                const date = parts[0];
                const weight = parseFloat(parts[1]);
                const waist = parts[2] ? parseFloat(parts[2]) : undefined;
                const hip = parts[3] ? parseFloat(parts[3]) : undefined;
                const legs = parts[4] ? parseFloat(parts[4]) : undefined;
                
                if (isNaN(weight)) continue;

                await repo.addMeasurement({
                    date,
                    weight,
                    waist,
                    hip,
                    legs,
                    bmi: 0 // Recalc? Or leave 0. 
                });
                count++;
            }
            
            Alert.alert(t.settings.importSuccess, `${t.common.success}: ${count} ${t.settings.recordsImported}`);

        } catch (e) {
            console.error(e);
            Alert.alert(t.common.error, t.settings.importError);
        }
    };

    const toggleLanguage = () => {
        setLocale(locale === 'en' ? 'es' : 'en');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.title}>{t.settings.title}</Text>
            <ScrollView contentContainerStyle={styles.content}>
                
                <Card>
                    <Text style={styles.sectionTitle}>{t.settings.language}</Text>
                     <View style={styles.langRow}>
                        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
                            <Text style={styles.langText}>
                                {locale === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.subtext}>
                            {t.settings.selectLanguage}
                        </Text>
                     </View>
                </Card>

                <Card>
                    <Text style={styles.sectionTitle}>{t.settings.dataManagement}</Text>
                    <Text style={styles.text}>
                        {t.settings.importCsvDesc}
                    </Text>
                    <Button 
                        title={t.settings.importCsv} 
                        onPress={handleImportCsv} 
                        variant="secondary"
                        style={{marginTop: 16}}
                    />
                </Card>

                 <Card>
                    <Text style={styles.sectionTitle}>{t.settings.about}</Text>
                    <Text style={styles.text}>
                         {t.settings.desc}
                    </Text>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  langRow: {
    alignItems: 'flex-start',
  },
  langButton: {
    backgroundColor: Colors.dark.surfaceHighlight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  langText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500'
  },
  subtext: {
      color: Colors.dark.textSecondary,
      fontSize: 12
  }
});
