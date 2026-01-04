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
  const { t, formatDate, dateFormat } = useI18n();
  const { colors } = useTheme();

  const [data, setData] = useState<Measurement[]>([]);
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
      
      const lineData = filtered.map(m => {
            const day = m.date.slice(8, 10);
            const month = m.date.slice(5, 7);
            const label = dateFormat.startsWith('dd') ? `${day}/${month}` : `${month}/${day}`;
            
            return {
                value: m.weight,
                label: label,
                dataPointText: m.weight.toString(),
                date: m.date // Keep full date for sorting if needed
            };
      });

      return { lineData, filteredRaw: filtered };
  };

  const { lineData: filteredChartData, filteredRaw } = getFilteredData();

  // Simple Moving Average Calculation
  const calculateMovingAverage = (data: Measurement[], windowSize: number) => {
      if (data.length < windowSize) return [];
      
      const maData = [];
      for (let i = 0; i < data.length; i++) {
          if (i < windowSize - 1) {
             // For the first N-1 points, we can't calculate a full window MA.
             // Option 1: Null/Empty (line starts later) - Preferred for accuracy
             // Option 2: Average of available points (cumulative)
             
             // Let's use cumulative average for the start to avoid gaps? 
             // Or just fill with null? 'gifted-charts' might handle nulls or we just skip.
             // Let's calculate partial average for smoother start.
             let sum = 0;
             for (let j = 0; j <= i; j++) sum += data[j].weight;
             maData.push({ value: sum / (i + 1) });
          } else {
             let sum = 0;
             for (let j = 0; j < windowSize; j++) {
                 sum += data[i - j].weight;
             }
             maData.push({ value: sum / windowSize });
          }
      }
      return maData;
  };

  // Determine window size based on range
  let windowSize = 0;
  if (range === '1W') windowSize = 3;
  if (range === '1M') windowSize = 5;
  if (range === '1Y') windowSize = 7;
  // 'all' -> 0 (no trend line requested/needed usually, or maybe 10?)

  const trendLineData = windowSize > 0 ? calculateMovingAverage(filteredRaw, windowSize) : undefined;
  
  const [showTrendLine, setShowTrendLine] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const repo = new MeasurementsRepository(db);
        const settingsRepo = new SettingsRepository(db);
        
        const measurements = await repo.getMeasurementsForChart(); // Ascending for chart
        const target = await settingsRepo.getSetting('targetWeight');
        const showTrend = await settingsRepo.getSetting('showTrendLine');
        
        if (target) setTargetWeight(parseFloat(target));
        if (showTrend !== null) setShowTrendLine(showTrend === 'true');
        
        setData(measurements);

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
  }, [db]);

  useFocusEffect(
    useCallback(() => {
        loadData();
    }, [loadData])
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
  
  // Compact stats
  const statLabelStyle = { fontSize: 10, color: colors.textSecondary, marginBottom: 2 };
  const statValueStyle = { fontSize: 15, fontWeight: '700' as const, color: colors.text };
  const unitStyle = { fontSize: 10, fontWeight: 'normal' as const, color: colors.textSecondary };
  const getChangeColor = (val: number) => val > 0 ? colors.error : colors.success;

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary}/>}
      >
        <Text style={headerTitleStyle}>{t.home.title}</Text>
        
        {/* Main Weight Card */}
        {latest ? (
            <Card style={styles.mainCard}>
                <View style={styles.mainCardHeader}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.home.currentWeight}</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>{formatDate(latest.date)}</Text>
                </View>
                
                <View style={styles.weightRow}>
                    <Text style={[styles.bigWeight, { color: colors.text }]}>
                        {latest.weight}<Text style={[styles.bigUnit, { color: colors.text }]}>kg</Text>
                    </Text>
                    
                    {/* BMI Badge */}
                     <View style={[styles.badge, { backgroundColor: getBmiColor(latest.bmi || 0) + '20' }]}>
                        <Text style={[styles.badgeText, { color: getBmiColor(latest.bmi || 0) }]}>{t.home.bmi}: {latest.bmi || '--'}</Text>
                    </View>
                </View>

                {/* Trend Line */}
                {previous && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Text style={{ 
                            fontSize: 14, 
                            fontWeight: '600',
                            color: getChangeColor(latest.weight - previous.weight)
                        }}>
                            {(latest.weight - previous.weight) > 0 ? '↑' : '↓'} {Math.abs(latest.weight - previous.weight).toFixed(1)} kg
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 6 }}> {t.home.vsLastRecord}</Text>
                    </View>
                )}
            </Card>
        ) : (
             !loading && (
                 <Card style={{ padding: 30, alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>{t.home.noData}</Text>
                    <Button 
                        title={t.home.addEntry} 
                        onPress={() => router.push('/modal')} 
                    />
                 </Card>
             )
        )}

        {/* Chart Section */}
        <Card style={styles.chartCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, width: '100%' }}>
                <Text style={cardTitleStyle}>{t.home.trend}</Text>
                 <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['all', '1Y', '1M', '1W'] as const).map(r => (
                        <TouchableOpacity 
                            key={r} 
                            onPress={() => setRange(r)}
                            style={{
                                paddingVertical: 4,
                                paddingHorizontal: 10,
                                borderRadius: 16,
                                backgroundColor: range === r ? colors.primary : colors.surfaceHighlight,
                            }}
                        >
                            <Text style={{ 
                                color: range === r ? '#fff' : colors.textSecondary,
                                fontSize: 11,
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
            </View>
            
            {filteredChartData.length > 0 ? (
                 <WeightChart 
                    data={filteredChartData} 
                    trendData={showTrendLine ? trendLineData : undefined}
                    targetWeight={targetWeight > 0 ? targetWeight : undefined} 
                />
            ) : (
                <View style={{ height: 180, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: colors.textSecondary }}>{t.home.noChartData}</Text>
                </View>
            )}
        </Card>

        {/* Secondary Stats Grid */}
        {latest && (
            <View style={styles.grid}>
                {targetWeight > 0 && (
                    <>
                        <Card style={styles.gridCard}>
                            <Text style={statLabelStyle}>{t.home.target}</Text>
                            <Text style={statValueStyle}>{targetWeight} <Text style={unitStyle}>kg</Text></Text>
                        </Card>
                        <Card style={styles.gridCard}>
                            <Text style={statLabelStyle}>{t.home.toGo}</Text>
                            <Text style={[statValueStyle, { color: colors.primary }]}>
                                {(latest.weight - targetWeight).toFixed(1)} <Text style={unitStyle}>kg</Text>
                            </Text>
                        </Card>
                    </>
                )}

                 {data.length > 0 && (
                    <>
                        <Card style={styles.gridCard}>
                             <Text style={statLabelStyle}>{t.home.progress}</Text>
                             <Text style={[statValueStyle, { color: (latest.weight - data[0].weight) > 0 ? colors.error : colors.success }]}>
                                {(latest.weight - data[0].weight).toFixed(1)} <Text style={unitStyle}>kg</Text>
                             </Text>
                        </Card>
                        <Card style={styles.gridCard}>
                            <Text style={statLabelStyle}>{t.home.startWeight}</Text>
                            <Text style={statValueStyle}>{data[0].weight} <Text style={unitStyle}>kg</Text></Text>
                            <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{formatDate(data[0].date)}</Text>
                        </Card>
                        
                        {(() => {
                             const maxRecord = data.reduce((prev, current) => (prev.weight > current.weight) ? prev : current, data[0]);
                             const minRecord = data.reduce((prev, current) => (prev.weight < current.weight) ? prev : current, data[0]);
                             return (
                                <>
                                    <Card style={styles.gridCard}>
                                        <Text style={statLabelStyle}>{t.home.maxWeight}</Text>
                                        <Text style={statValueStyle}>{maxRecord.weight} <Text style={unitStyle}>kg</Text></Text>
                                        <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{formatDate(maxRecord.date)}</Text>
                                    </Card>
                                    <Card style={styles.gridCard}>
                                        <Text style={statLabelStyle}>{t.home.minWeight}</Text>
                                        <Text style={statValueStyle}>{minRecord.weight} <Text style={unitStyle}>kg</Text></Text>
                                        <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }}>{formatDate(minRecord.date)}</Text>
                                    </Card>
                                </>
                             );
                        })()}
                    </>
                 )}
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 120, // Add bottom padding to avoid tab bar overlap
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mainCard: {
      marginBottom: 12,
      padding: 16,
  },
  mainCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  weightRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 10,
  },
  bigWeight: {
      fontSize: 42,
      fontWeight: '800',
      lineHeight: 46,
  },
  bigUnit: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 4,
  },
  badge: {
     paddingVertical: 3,
     paddingHorizontal: 6,
     borderRadius: 6,
     alignSelf: 'center',
     marginBottom: 6, 
  },
  badgeText: {
      fontWeight: '700',
      fontSize: 11,
  },
  chartCard: {
    marginBottom: 12,
    alignItems: 'center',
    padding: 12,
    paddingLeft: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8, // Tighter gap
  },
  gridCard: {
      flex: 1, 
      minWidth: '28%', // Allow 3 columns (approx 30%)
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center', // Center align content for 3-col
  },
});
