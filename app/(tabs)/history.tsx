import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { styles } from './history.styles';
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
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

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

  const availableYears = useMemo(() => {
    const years = new Set(data.map(m => m.date.substring(0, 4)));
    return ['all', ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, [data]);

  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return ['all'];
    const months = new Set(data.filter(m => m.date.startsWith(selectedYear)).map(m => m.date.substring(5, 7)));
    return ['all', ...Array.from(months).sort()];
  }, [data, selectedYear]);

  useEffect(() => {
    if (selectedYear === 'all') {
      setSelectedMonth('all');
    }
  }, [selectedYear]);

  const filteredData = useMemo(() => {
    return data.filter(m => {
      const matchYear = selectedYear === 'all' || m.date.startsWith(selectedYear);
      const matchMonth = selectedMonth === 'all' || m.date.substring(5, 7) === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [data, selectedYear, selectedMonth]);

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

  const getMonthName = (monthStr: string) => {
    if (monthStr === 'all') return t.home.ranges.all;
    const date = new Date();
    date.setMonth(parseInt(monthStr, 10) - 1);
    return date.toLocaleString(t.home.ranges.all === "Todos" ? 'es' : 'en', { month: 'short' });
  };

  const renderFilters = () => (
    <View style={{ marginBottom: 16 }}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginBottom: 8, marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {availableYears.map(year => (
          <TouchableOpacity
            key={year}
            onPress={() => {
              setSelectedYear(year);
              if (year === 'all') setSelectedMonth('all');
            }}
            style={[
              styles.filterChip,
              { backgroundColor: selectedYear === year ? colors.primary : colors.surfaceHighlight }
            ]}
          >
            <Text style={[styles.filterText, { color: selectedYear === year ? '#fff' : colors.textSecondary }]}>
              {year === 'all' ? t.home.ranges.all : year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedYear !== 'all' && availableMonths.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {availableMonths.map(month => (
            <TouchableOpacity
              key={month}
              onPress={() => setSelectedMonth(month)}
              style={[
                styles.filterChip,
                { backgroundColor: selectedMonth === month ? colors.primary : colors.surfaceHighlight }
              ]}
            >
              <Text style={[styles.filterText, { color: selectedMonth === month ? '#fff' : colors.textSecondary, textTransform: 'capitalize' }]}>
                {getMonthName(month)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Text style={titleStyle}>{t.history.title}</Text>
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
        renderItem={renderItem}
        ListHeaderComponent={renderFilters}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary}/>}
        ListEmptyComponent={<Text style={emptyStyle}>{t.history.empty}</Text>}
      />
    </SafeAreaView>
  );
}
