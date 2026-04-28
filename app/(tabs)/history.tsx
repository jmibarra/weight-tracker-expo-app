import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import { Card } from '@/components/ui/Card';
import { CalendarView } from '@/components/CalendarView';
import { styles } from "@/styles/history.styles";
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  useEffect(() => {
    if (viewMode === 'calendar') {
      const now = new Date();
      if (selectedYear === 'all') {
        setSelectedYear(now.getFullYear().toString());
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        setSelectedMonth(m);
      } else if (selectedMonth === 'all') {
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        setSelectedMonth(m);
      }
    }
  }, [viewMode, selectedYear, selectedMonth]);

  const dataWithDiff = useMemo(() => {
    return data.map((item, index) => {
      const prevItem = data[index + 1];
      let diff = 0;
      if (prevItem) {
        diff = item.weight - prevItem.weight;
      }
      return { ...item, diff };
    });
  }, [data]);

  const filteredData = useMemo(() => {
    return dataWithDiff.filter(m => {
      const matchYear = selectedYear === 'all' || m.date.startsWith(selectedYear);
      const matchMonth = selectedMonth === 'all' || m.date.substring(5, 7) === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [dataWithDiff, selectedYear, selectedMonth]);

  const calendarDaysData = useMemo(() => {
    if (viewMode !== 'calendar' || selectedYear === 'all' || selectedMonth === 'all') return {};
    
    const map: Record<number, { weight: number, diff: number, id: number }> = {};
    const prefix = `${selectedYear}-${selectedMonth}-`;
    
    // Iterate backwards so the earliest measurement of the day is kept, 
    // or just the first encountered (latest) if we iterate forwards.
    // The history is already sorted latest first, so first encountered is the latest of the day.
    for (const item of dataWithDiff) {
      if (item.date.startsWith(prefix)) {
        const day = parseInt(item.date.substring(8, 10), 10);
        if (!map[day]) {
          map[day] = { weight: item.weight, diff: item.diff, id: item.id! };
        }
      }
    }
    return map;
  }, [dataWithDiff, viewMode, selectedYear, selectedMonth]);

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

    // Calculate day of the week
    const dateParts = item.date.split('-');
    let dayOfWeekStr = '';
    if (dateParts.length === 3) {
      const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      let dayIndex = d.getDay();
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0 = Mon, 6 = Sun
      const days = t.history.days || ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      dayOfWeekStr = days[dayIndex] + ', ';
    }

    return (
        <TouchableOpacity onPress={() => router.push({ pathname: '/modal', params: { id: item.id } })}>
        <Card style={styles.itemCard}>
            <View style={styles.row}>
                <View>
                    <Text style={dateStyle}>{dayOfWeekStr}{formatDate(item.date)}</Text>
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
      <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <TouchableOpacity 
          style={[styles.toggleBtn, { backgroundColor: viewMode === 'list' ? colors.primary : 'transparent' }]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleBtnText, { color: viewMode === 'list' ? '#fff' : colors.textSecondary }]}>{t.history.viewList}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, { backgroundColor: viewMode === 'calendar' ? colors.primary : 'transparent' }]}
          onPress={() => setViewMode('calendar')}
        >
          <Text style={[styles.toggleBtnText, { color: viewMode === 'calendar' ? '#fff' : colors.textSecondary }]}>{t.history.viewCalendar}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => {
              setSelectedYear(itemValue);
              if (itemValue === 'all') setSelectedMonth('all');
            }}
            mode="dropdown"
            style={{ color: colors.text }}
            dropdownIconColor={colors.text}
          >
            {availableYears.map(year => (
              <Picker.Item 
                key={year} 
                label={year === 'all' ? t.home.ranges.all : year} 
                value={year} 
                color={Platform.OS === 'ios' ? colors.text : undefined}
              />
            ))}
          </Picker>
        </View>

        {selectedYear !== 'all' && availableMonths.length > 1 && (
          <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              mode="dropdown"
              style={{ color: colors.text }}
              dropdownIconColor={colors.text}
            >
              {availableMonths.map(month => (
                <Picker.Item 
                  key={month} 
                  label={month === 'all' ? t.home.ranges.all : (getMonthName(month).charAt(0).toUpperCase() + getMonthName(month).slice(1))} 
                  value={month} 
                  color={Platform.OS === 'ios' ? colors.text : undefined}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <Text style={titleStyle}>{t.history.title}</Text>
      
      {viewMode === 'calendar' ? (
        <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary}/>}>
          {renderFilters()}
          {selectedYear !== 'all' && selectedMonth !== 'all' ? (
             <CalendarView 
                year={parseInt(selectedYear, 10)} 
                month={parseInt(selectedMonth, 10)} 
                daysData={calendarDaysData} 
             />
          ) : (
            <Text style={emptyStyle}>{t.history.empty}</Text>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderFilters}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary}/>}
          ListEmptyComponent={<Text style={emptyStyle}>{t.history.empty}</Text>}
        />
      )}
    </SafeAreaView>
  );
}
