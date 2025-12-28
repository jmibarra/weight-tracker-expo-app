import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { useI18n } from '@/i18n/I18nContext';

export default function OptionsScreen() {
    const router = useRouter();
    const db = useSQLiteContext();
    const { t, locale, setLocale } = useI18n();
    const { theme, setTheme, colors } = useTheme();

    const handleImportCsv = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all files to avoid OS-specific MIME type issues
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
                
                // Parse CSV line respecting quotes
                // Regex matches: "quoted string" OR value without comma
                const parts: string[] = [];
                let current = '';
                let inQuote = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        parts.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                parts.push(current);

                if (parts.length < 2) continue;
                
                // Check header
                if (parts[0].toLowerCase().includes('fecha') || parts[0].toLowerCase().includes('date')) continue;

                // Parse Date: 15/06/2016 -> YYYY-MM-DD
                const dateParts = parts[0].split('/');
                if (dateParts.length !== 3) continue;
                const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // ISO format for DB

                // Parse Weight: "117,5" -> 117.5
                let weightStr = parts[1].replace(/"/g, '').replace(',', '.');
                const weight = parseFloat(weightStr);

                // Optional BMI
                let bmi = 0;
                if (parts[3]) {
                     let bmiStr = parts[3].replace(/"/g, '').replace(',', '.');
                     bmi = parseFloat(bmiStr) || 0;
                }

                if (isNaN(weight)) continue;

                await repo.addMeasurement({
                    date,
                    weight,
                    bmi
                });
                count++;
            }
            
            Alert.alert(t.settings.importSuccess, `${t.common.success}: ${count} ${t.settings.recordsImported}`);

        } catch (e: any) {
            console.error(e);
            Alert.alert(t.common.error, `${t.settings.importError}: ${e.message}`);
        }
    };

    const toggleLanguage = () => {
        setLocale(locale === 'en' ? 'es' : 'en');
    };

    // Dynamic styles
    const containerStyle = { flex: 1, backgroundColor: colors.background };
    const titleStyle = { ...styles.title, color: colors.text };
    const sectionTitleStyle = { ...styles.sectionTitle, color: colors.text };
    const textStyle = { ...styles.text, color: colors.textSecondary };
    const buttonStyle = { ...styles.langButton, backgroundColor: colors.surfaceHighlight };
    const buttonTextStyle = { ...styles.langText, color: colors.text };
    const subtextStyle = { ...styles.subtext, color: colors.textSecondary };

    const ThemeOption = ({ value, label }: { value: 'light' | 'dark' | 'system', label: string }) => (
        <TouchableOpacity 
            style={[
                styles.themeOption, 
                { 
                    backgroundColor: theme === value ? colors.primary : colors.surfaceHighlight,
                    borderColor: theme === value ? colors.primary : 'transparent'
                }
            ]} 
            onPress={() => setTheme(value)}
        >
            <Text style={[
                styles.themeText, 
                { color: theme === value ? '#FFFFFF' : colors.text }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={containerStyle} edges={['top']}>
            <Text style={titleStyle}>{t.settings.title}</Text>
            <ScrollView contentContainerStyle={styles.content}>
                
                <Card>
                    <Text style={sectionTitleStyle}>{t.settings.language}</Text>
                     <View style={styles.langRow}>
                        <TouchableOpacity onPress={toggleLanguage} style={buttonStyle}>
                            <Text style={buttonTextStyle}>
                                {locale === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={subtextStyle}>
                            {t.settings.selectLanguage}
                        </Text>
                     </View>
                </Card>

                <Card>
                    <Text style={sectionTitleStyle}>{t.settings.appearance || "Appearance"}</Text>
                    <View style={styles.themeRow}>
                        <ThemeOption value="light" label="Light" />
                        <ThemeOption value="dark" label="Dark" />
                        <ThemeOption value="system" label="System" />
                    </View>
                </Card>

                <Card>
                    <Text style={sectionTitleStyle}>{t.settings.dataManagement}</Text>
                    <Text style={textStyle}>
                        {t.settings.importCsvDesc}
                    </Text>
                    
                    <View style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        backgroundColor: colors.surfaceHighlight, 
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.primary 
                    }}>
                        <Text style={[textStyle, { fontSize: 13, fontWeight: '600', marginBottom: 4 }]}>{t.settings.csvFormatTitle}</Text>
                        <Text style={[textStyle, { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                            Fecha,Peso,Cambio,IMC{'\n'}
                            15/06/2016,"117,5",,"35,1"
                        </Text>
                    </View>

                    <Button 
                        title={t.settings.importCsv} 
                        onPress={handleImportCsv} 
                        variant="secondary"
                        style={{marginTop: 16}}
                    />
                </Card>

                 <Card>
                    <Text style={sectionTitleStyle}>{t.settings.about}</Text>
                    <Text style={textStyle}>
                         {t.settings.desc}
                    </Text>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    lineHeight: 22,
  },
  langRow: {
    alignItems: 'flex-start',
  },
  langButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  langText: {
    fontSize: 16,
    fontWeight: '500'
  },
  subtext: {
      fontSize: 12
  },
  themeRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
  },
  themeOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
  },
  themeText: {
      fontWeight: '600',
      fontSize: 14,
  }
});

