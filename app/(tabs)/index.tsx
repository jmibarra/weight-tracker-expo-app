import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [previous, setPrevious] = useState<Measurement | null>(null);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<'all' | '1Y' | '1M' | '1W'>('1W');

  // Filter logic
  const getFilteredData = () => {
      let filtered = data;
      
      if (range !== 'all') {
        const now = new Date();
        let limitDate = new Date();
        
        if (range === '1Y') limitDate.setFullYear(now.getFullYear() - 1);
        if (range === '1M') limitDate.setMonth(now.getMonth() - 1);
        if (range === '1W') limitDate.setDate(now.getDate() - 7);
        
        filtered = data.filter(item => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0,0,0,0);
            limitDate.setHours(0,0,0,0);
            return itemDate >= limitDate;
        });
      }

      // Sampling for large datasets (prevent crash on 'all')
      if (filtered.length > 50) {
          const step = Math.ceil(filtered.length / 50);
          filtered = filtered.filter((_, index) => index % step === 0 || index === filtered.length - 1);
      }
      
      return filtered.map(m => ({
            value: m.weight,
            label: m.date.slice(5),
            dataPointText: m.weight.toString(),
      }));
  };

  const filteredChartData = getFilteredData();

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
            if (measurements.length > 1) {
                setPrevious(measurements[measurements.length - 2]);
            } else {
                setPrevious(null);
            }
        } else {
             setLatest(null);
             setPrevious(null);
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
            
            {filteredChartData.length > 0 ? (
                 <WeightChart data={filteredChartData} targetWeight={targetWeight > 0 ? targetWeight : undefined} />
            ) : (
                <View style={{ height: 200, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: colors.textSecondary }}>{t.home.noChartData}</Text>
                </View>
            )}
            
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                {(['all', '1Y', '1M', '1W'] as const).map(r => (
                    <TouchableOpacity 
                        key={r} 
                        onPress={() => setRange(r)}
                        style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            backgroundColor: range === r ? colors.primary : 'transparent',
                            borderWidth: 1,
                            borderColor: range === r ? colors.primary : colors.border
                        }}
                    >
                        <Text style={{ 
                            color: range === r ? '#fff' : colors.textSecondary,
                            fontSize: 12,
                            fontWeight: '600'
                        }}>
                           {{
                               'all': t.home.ranges.all,
                               '1Y': t.home.ranges.year,
                               '1M': t.home.ranges.month,
                               '1W': t.home.ranges.week
                           }[r]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Card>

        {latest && (
            <View>
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={statLabelStyle}>{t.home.currentWeight}</Text>
                        <Text style={statValueStyle}>{latest.weight} <Text style={unitStyle}>kg</Text></Text>
                        {previous && (
                            <Text style={{ 
                                fontSize: 12, 
                                marginTop: 4, 
                                fontWeight: '600',
                                color: (latest.weight - previous.weight) > 0 ? colors.error : colors.success 
                            }}>
                                {(latest.weight - previous.weight) > 0 ? '+' : ''}
                                {(latest.weight - previous.weight).toFixed(1)} kg
                            </Text>
                        )}
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

                {data.length > 0 && (
                    <View>
                        <View style={styles.statsRow}>
                            <Card style={styles.statCard}>
                                <Text style={statLabelStyle}>{t.home.startWeight}</Text>
                                <Text style={statValueStyle}>{data[0].weight} <Text style={unitStyle}>kg</Text></Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text style={statLabelStyle}>{t.home.progress}</Text>
                                <Text style={[styles.statValue, { color: (latest.weight - data[0].weight) > 0 ? colors.error : colors.success }]}>
                                    {(latest.weight - data[0].weight).toFixed(1)} <Text style={unitStyle}>kg</Text>
                                </Text>
                            </Card>
                        </View>
                        
                        {(() => {
                             const maxRecord = data.reduce((prev, current) => (prev.weight > current.weight) ? prev : current, data[0]);
                             const minRecord = data.reduce((prev, current) => (prev.weight < current.weight) ? prev : current, data[0]);
                             
                             return (
                                <View style={styles.statsRow}>
                                    <Card style={styles.statCard}>
                                        <Text style={statLabelStyle}>{t.home.maxWeight}</Text>
                                        <Text style={statValueStyle}>{maxRecord.weight} <Text style={unitStyle}>kg</Text></Text>
                                        <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>{maxRecord.date}</Text>
                                    </Card>
                                    <Card style={styles.statCard}>
                                        <Text style={statLabelStyle}>{t.home.minWeight}</Text>
                                        <Text style={statValueStyle}>{minRecord.weight} <Text style={unitStyle}>kg</Text></Text>
                                        <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>{minRecord.date}</Text>
                                    </Card>
                                </View>
                             );
                        })()}
                    </View>
                )}
            </View>
        )}

        {!latest && (
            <Button 
                title={t.home.addEntry} 
                onPress={() => router.push('/modal')} 
                style={{ marginBottom: 20 }}
            />
        )}
        
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
