import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';

export default function OptionsScreen() {
    const router = useRouter();
    const db = useSQLiteContext();

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
            // Assuming header: date,weight,waist,hip,legs
            // Skip header if present? Let's try to detect or just assume NO header or handle parsing
            
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
            
            Alert.alert('Import Successful', `Imported ${count} records.`);

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to import CSV');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.title}>Options</Text>
            <ScrollView contentContainerStyle={styles.content}>
                <Card>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    <Text style={styles.text}>
                        Import your history from a CSV file. {'\n'}
                        Format: date (YYYY-MM-DD), weight, waist, hip, legs
                    </Text>
                    <Button 
                        title="Import CSV" 
                        onPress={handleImportCsv} 
                        variant="secondary"
                        style={{marginTop: 16}}
                    />
                </Card>

                 <Card>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.text}>
                        Weight Tracker v1.0{'\n'}
                        Developed with Expo & SQLite.
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
  }
});
