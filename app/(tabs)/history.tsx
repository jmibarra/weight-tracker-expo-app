import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { Measurement, MeasurementsRepository } from '@/db/repositories/MeasurementsRepository';
import { useI18n } from '@/i18n/I18nContext';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();

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

  // Dynamic Item Styles
  const dateStyle = { color: colors.text, ...styles.date };
  const weightStyle = { color: colors.primary, ...styles.weight };
  const subtextStyle = { color: colors.textSecondary, ...styles.subtext };

  const renderItem = ({ item }: { item: Measurement }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: '/modal', params: { id: item.id } })}>
    <Card style={styles.itemCard}>
        <View style={styles.row}>
            <View>
                <Text style={dateStyle}>{item.date}</Text>
                {item.bmi ? <Text style={subtextStyle}>{t.home.bmi}: {item.bmi}</Text> : null}
            </View>
            <View style={{alignItems: 'flex-end'}}>
                <Text style={weightStyle}>{item.weight} kg</Text>
                <Text style={subtextStyle}>
                    {[
                        item.waist ? `W:${item.waist}` : '',
                        item.hip ? `H:${item.hip}` : '',
                        item.legs ? `L:${item.legs}` : ''
                    ].filter(Boolean).join(' | ')}
                </Text>
            </View>
        </View>
    </Card>
    </TouchableOpacity>
  );

  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const titleStyle = { color: colors.text, ...styles.title };
  const emptyStyle = { color: colors.textSecondary, ...styles.empty };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Text style={titleStyle}>{t.history.title}</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary}/>}
        ListEmptyComponent={<Text style={emptyStyle}>{t.history.empty}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
    fontWeight: '600',
    marginBottom: 4,
  },
  weight: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  }
});
