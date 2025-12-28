import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeightChart } from '@/components/charts/WeightChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Measurement, MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [data, setData] = useState<Measurement[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [latest, setLatest] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
        const repo = new MeasurementsRepository(db);
        const measurements = await repo.getMeasurementsForChart(); // Ascending for chart
        
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={Colors.dark.primary}/>}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        
        <Card style={styles.chartCard}>
            <Text style={styles.cardTitle}>Weight Trend</Text>
            <WeightChart data={chartData} />
        </Card>

        {latest && (
            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <Text style={styles.statLabel}>Current Weight</Text>
                    <Text style={styles.statValue}>{latest.weight} <Text style={styles.unit}>kg</Text></Text>
                </Card>
                <Card style={styles.statCard}>
                    <Text style={styles.statLabel}>BMI</Text>
                    <Text style={[styles.statValue, { color: getBmiColor(latest.bmi || 0) }]}>
                        {latest.bmi || '--'}
                    </Text>
                </Card>
            </View>
        )}

        <Button 
            title="Add New Entry" 
            onPress={() => router.push('/modal')} 
            style={{ marginBottom: 20 }}
        />
        
        {!latest && !loading && (
             <Text style={styles.emptyText}>No data yet. Add your first entry!</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function getBmiColor(bmi: number) {
    if (bmi < 18.5) return Colors.dark.secondary;
    if (bmi < 25) return Colors.dark.success;
    if (bmi < 30) return '#FFC107'; // Warning
    return Colors.dark.error;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
  },
  chartCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
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
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  unit: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: 'normal',
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  }
});
