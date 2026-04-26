import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { Measurement } from '@/db/repositories/MeasurementsRepository';
import { useI18n } from '@/i18n/I18nContext';
import { useRepositories } from '@/hooks/useRepositories';

export default function HistoryScreen() {
  const { measurements: measurementsRepo } = useRepositories();
  const router = useRouter();
  const { t, formatDate } = useI18n();
  const { colors } = useTheme();

  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const measurements = await measurementsRepo.getMeasurements();
        setData(measurements);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [measurementsRepo]);

  useFocusEffect(
    useCallback(() => {
        loadData();
    }, [loadData])
  );

  // Dynamic Item Styles
  const dateStyle = { color: colors.text, ...styles.date };
  const weightStyle = { color: colors.primary, ...styles.weight };
  const subtextStyle = { color: colors.textSecondary, ...styles.subtext };

  const renderItem = ({ item, index }: { item: Measurement; index: number }) => {
    const prevItem = data[index + 1];
    let diffText = null;
    let diffColor = colors.textSecondary;

    if (prevItem) {
        const diff = item.weight - prevItem.weight;
        if (Math.abs(diff) > 0) { // Show if there is any difference
            const sign = diff > 0 ? '+' : '';
            diffText = `${sign}${diff.toFixed(1)} kg`;
            diffColor = diff > 0 ? colors.error : colors.success;
        } else {
             diffText = '0.0 kg';
             diffColor = colors.textSecondary;
        }
    }

    return (
        <TouchableOpacity onPress={() => router.push({ pathname: '/modal', params: { id: item.id } })}>
        <Card style={styles.itemCard}>
            <View style={styles.row}>
                <View>
                    <Text style={dateStyle}>{formatDate(item.date)}</Text>
                    {item.bmi ? <Text style={subtextStyle}>{t.home.bmi}: {item.bmi}</Text> : null}
                </View>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={weightStyle}>{item.weight} kg</Text>
                    
                    {diffText && (
                         <Text style={{ color: diffColor, fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
                            {diffText}
                         </Text>
                    )}

                    <Text style={subtextStyle}>
                        {[
                            item.waist ? `${t.history.waistAbbr}${item.waist}` : '',
                            item.hip ? `${t.history.hipAbbr}${item.hip}` : '',
                            item.legs ? `${t.history.legsAbbr}${item.legs}` : ''
                        ].filter(Boolean).join(' | ')}
                    </Text>
                </View>
            </View>
        </Card>
        </TouchableOpacity>
    );
  };

  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const titleStyle = { color: colors.text, ...styles.title };
  const emptyStyle = { color: colors.textSecondary, ...styles.empty };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Text style={titleStyle}>{t.history.title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
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
