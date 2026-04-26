import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';

import React from 'react';
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



import { Button } from "@/components/ui/Button";
import { styles } from "./settings.styles";
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nContext';
import { SETTINGS_KEYS } from '@/constants/SettingsKeys';
import { useRepositories } from '@/hooks/useRepositories';

export default function OptionsScreen() {
    const { measurements: measurementsRepo, settings: settingsRepo } = useRepositories();
    const router = useRouter();
    const { t, locale, setLocale, dateFormat, setDateFormat } = useI18n();
    const { theme, setTheme, colors } = useTheme();
    const [showTrendLine, setShowTrendLine] = React.useState(true);

    React.useEffect(() => {
        const loadSettings = async () => {
             const val = await settingsRepo.getSetting(SETTINGS_KEYS.SHOW_TREND_LINE);
             if (val !== null) {
                 setShowTrendLine(val === 'true');
             }
        };
        loadSettings();
    }, [settingsRepo]);

    const toggleTrendLine = async (value: boolean) => {
        setShowTrendLine(value);
        await settingsRepo.setSetting(SETTINGS_KEYS.SHOW_TREND_LINE, String(value));
    };

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
            const repo = measurementsRepo;
            
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
                
                const day = dateParts[0].padStart(2, '0');
                const month = dateParts[1].padStart(2, '0');
                const year = dateParts[2];
                
                const date = `${year}-${month}-${day}`; // ISO format for DB

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

    const handleExportCsv = async () => {
        try {
            const measurements = await measurementsRepo.getMeasurements();

            if (measurements.length === 0) {
                 Alert.alert(t.common.error, t.settings.noDataToExport);
                 return;
            }
            
            // Header: Fecha,Peso,Cambio,IMC,Cintura,Cadera,Piernas
            // Data format: DD/MM/YYYY,"123,4",,"24,5",...
            let csvContent = "Fecha,Peso,Cambio,IMC,Cintura,Cadera,Piernas\n";

            measurements.forEach(m => {
                // Convert date from YYYY-MM-DD to DD/MM/YYYY
                const [year, month, day] = m.date.split('-');
                const localDate = `${day}/${month}/${year}`;
                
                const weightStr = `"${m.weight.toString().replace('.', ',')}"`;
                const bmiStr = m.bmi ? `"${m.bmi.toString().replace('.', ',')}"` : "";
                const cintura = m.waist ? `"${m.waist.toString().replace('.', ',')}"` : "";
                const cadera = m.hip ? `"${m.hip.toString().replace('.', ',')}"` : "";
                const piernas = m.legs ? `"${m.legs.toString().replace('.', ',')}"` : "";
                
                // Cambio blank for now as we don't calculate it here per row relative to prev easily without loop logic change,
                // and user said "format used for import" which implies structure compatibility.
                const cambio = ""; 

                csvContent += `${localDate},${weightStr},${cambio},${bmiStr},${cintura},${cadera},${piernas}\n`;
            });

            const fileName = `weight_data_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = FileSystem.cacheDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert(t.common.error, t.settings.sharingNotAvailable);
            }

        } catch (e: any) {
            console.error(e);
            Alert.alert(t.common.error, `${t.settings.exportError}: ${e.message}`);
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
                    <Text style={sectionTitleStyle}>{t.settings.appearanceSettings}</Text>
                    
                    {/* Language Section */}
                    <Text style={[textStyle, { fontWeight: '600', marginTop: 8, marginBottom: 8 }]}>{t.settings.language}</Text>
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

                    {/* Separator */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

                    {/* Date Format Section */}
                    <Text style={[textStyle, { fontWeight: '600', marginBottom: 8 }]}>{t.settings.dateFormat}</Text>
                    <View style={styles.themeRow}>
                        <TouchableOpacity 
                            style={[
                                styles.themeOption, 
                                { 
                                    backgroundColor: dateFormat === 'dd/MM/yyyy' ? colors.primary : colors.surfaceHighlight,
                                    borderColor: dateFormat === 'dd/MM/yyyy' ? colors.primary : 'transparent'
                                }
                            ]} 
                            onPress={() => setDateFormat('dd/MM/yyyy')}
                        >
                            <Text style={[
                                styles.themeText, 
                                { color: dateFormat === 'dd/MM/yyyy' ? '#FFFFFF' : colors.text }
                            ]}>
                                dd/MM/yyyy
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.themeOption, 
                                { 
                                    backgroundColor: dateFormat === 'MM/dd/yyyy' ? colors.primary : colors.surfaceHighlight,
                                    borderColor: dateFormat === 'MM/dd/yyyy' ? colors.primary : 'transparent'
                                }
                            ]} 
                            onPress={() => setDateFormat('MM/dd/yyyy')}
                        >
                            <Text style={[
                                styles.themeText, 
                                { color: dateFormat === 'MM/dd/yyyy' ? '#FFFFFF' : colors.text }
                            ]}>
                                MM/dd/yyyy
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Separator */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

                    {/* Theme Section */}
                    <Text style={[textStyle, { fontWeight: '600', marginBottom: 8 }]}>{t.settings.theme}</Text>
                    <View style={styles.themeRow}>
                        <ThemeOption value="light" label={t.settings.themeLight} />
                        <ThemeOption value="dark" label={t.settings.themeDark} />
                        <ThemeOption value="system" label={t.settings.themeSystem} />
                    </View>

                    {/* Separator */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

                    {/* Trend Line Toggle */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Text style={[textStyle, { fontWeight: '600' }]}>{t.settings.showTrendLine}</Text>
                         <Switch
                            value={showTrendLine}
                            onValueChange={toggleTrendLine}
                            trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                            thumbColor={Platform.OS === 'ios' ? '#fff' : colors.primary}
                         />
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
                            15/06/2016,&quot;117,5&quot;,,&quot;35,1&quot;
                        </Text>
                    </View>

                    <Button 
                        title={t.settings.importCsv} 
                        onPress={handleImportCsv} 
                        variant="secondary"
                        style={{marginTop: 16}}
                    />


                    <Button 
                        title={t.settings.exportCsv} 
                        onPress={handleExportCsv} 
                        variant="secondary"
                        style={{marginTop: 16}}
                    />

                    <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: colors.surfaceHighlight, paddingTop: 16 }}>
                         <Button 
                            title={t.settings.deleteAll} 
                            onPress={() => {
                                Alert.alert(
                                    t.settings.deleteAllConfirmTitle,
                                    t.settings.deleteAllConfirmMessage,
                                    [
                                        { text: t.addEntry.cancel, style: 'cancel' },
                                        { 
                                            text: t.addEntry.delete, 
                                            style: 'destructive', 
                                            onPress: async () => {
                                                try {
                                                    await measurementsRepo.deleteAll();
                                                    Alert.alert(t.common.success, t.settings.deletionSuccess);
                                                } catch (e: any) {
                                                    console.error(e);
                                                    Alert.alert(t.common.error, t.settings.deleteError);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            variant="primary"
                            style={{ backgroundColor: colors.error }}
                        />
                    </View>
                </Card>

                 <Card>
                    <Text style={sectionTitleStyle}>{t.settings.about}</Text>
                    <Text style={textStyle}>
                         {t.settings.desc}
                    </Text>
                    <Text style={[textStyle, { marginTop: 12, fontSize: 12, opacity: 0.7 }]}>
                        v{Constants.expoConfig?.version ?? '1.0.0'}
                    </Text>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

