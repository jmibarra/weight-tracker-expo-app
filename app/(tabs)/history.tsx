import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Measurement, MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
        const repo = new MeasurementsRepository(db);
        const measurements = await repo.getMeasurements(); // Descending order
        setData(measurements);
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

  const renderItem = ({ item }: { item: Measurement }) => (
    <Card style={styles.itemCard}>
        <View style={styles.row}>
            <View>
                <Text style={styles.date}>{item.date}</Text>
                {item.bmi ? <Text style={styles.subtext}>BMI: {item.bmi}</Text> : null}
            </View>
            <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.weight}>{item.weight} kg</Text>
                <Text style={styles.subtext}>
                    {[
                        item.waist ? `W:${item.waist}` : '',
                        item.hip ? `H:${item.hip}` : '',
                        item.legs ? `L:${item.legs}` : ''
                    ].filter(Boolean).join(' | ')}
                </Text>
            </View>
        </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>History</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={Colors.dark.primary}/>}
        ListEmptyComponent={<Text style={styles.empty}>No history available.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  list: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  itemCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  weight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  subtext: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  empty: {
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  }
});
