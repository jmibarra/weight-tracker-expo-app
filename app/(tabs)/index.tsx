import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeightChart } from '@/components/charts/WeightChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { Measurement, MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { SettingsRepository } from '@/db/repositories/SettingsRepository';
import { useI18n } from '@/i18n/I18nContext';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();

  const [data, setData] = useState<Measurement[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [latest, setLatest] = useState<Measurement | null>(null);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
        const repo = new MeasurementsRepository(db);
        const settingsRepo = new SettingsRepository(db);
        
        const measurements = await repo.getMeasurementsForChart(); // Ascending for chart
        const target = await settingsRepo.getSetting('targetWeight');
        
        if (target) setTargetWeight(parseFloat(target));
        
        setData(measurements);
        
        // Transform for chart
        const cData = measurements.map(m => ({
            value: m.weight,
            label: m.date.slice(5), // MM-DD
            dataPointText: m.weight.toString(),
            // ...m
        }));
        setChartData(cData);

        if (measurements.length > 0) {
            setLatest(measurements[measurements.length - 1]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
        loadData();
    }, [])
  );

  const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return colors.secondary;
    if (bmi < 25) return colors.success;
    if (bmi < 30) return '#FFC107'; // Warning
    return colors.error;
  };

  // Dynamic styles
  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const headerTitleStyle = { ...styles.headerTitle, color: colors.text };
  const cardTitleStyle = { ...styles.cardTitle, color: colors.text };
  const statLabelStyle = { ...styles.statLabel, color: colors.textSecondary };
  const statValueStyle = { ...styles.statValue, color: colors.text };
  const unitStyle = { ...styles.unit, color: colors.textSecondary };
  const emptyTextStyle = { ...styles.emptyText, color: colors.textSecondary };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary}/>}
      >
        <Text style={headerTitleStyle}>{t.home.title}</Text>
        
        <Card style={styles.chartCard}>
            <Text style={cardTitleStyle}>{t.home.trend}</Text>
            <WeightChart data={chartData} targetWeight={targetWeight > 0 ? targetWeight : undefined} />
        </Card>

        {latest && (
            <View>
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={statLabelStyle}>{t.home.currentWeight}</Text>
                        <Text style={statValueStyle}>{latest.weight} <Text style={unitStyle}>kg</Text></Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={statLabelStyle}>{t.home.bmi}</Text>
                        <Text style={[styles.statValue, { color: getBmiColor(latest.bmi || 0) }]}>
                            {latest.bmi || '--'}
                        </Text>
                    </Card>
                </View>
                {targetWeight > 0 && (
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard}>
                            <Text style={statLabelStyle}>{t.home.target}</Text>
                            <Text style={statValueStyle}>{targetWeight} <Text style={unitStyle}>kg</Text></Text>
                        </Card>
                        <Card style={styles.statCard}>
                            <Text style={statLabelStyle}>{t.home.toGo}</Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                {(latest.weight - targetWeight).toFixed(1)} <Text style={unitStyle}>kg</Text>
                            </Text>
                        </Card>
                    </View>
                )}
            </View>
        )}

        <Button 
            title={t.home.addEntry} 
            onPress={() => router.push('/modal')} 
            style={{ marginBottom: 20 }}
        />
        
        {!latest && !loading && (
             <Text style={emptyTextStyle}>{t.home.noData}</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  }
});
