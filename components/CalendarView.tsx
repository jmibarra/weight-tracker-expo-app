import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nContext';
import { styles } from '@/styles/history.styles';

interface CalendarViewProps {
  year: number;
  month: number;
  daysData: Record<number, { weight: number; diff: number; id: number }>;
}

export function CalendarView({ year, month, daysData }: CalendarViewProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Starting day of week (0 = Sunday, 1 = Monday, etc.)
  // We want Monday to be 0, Tuesday 1, ..., Sunday 6
  let firstDayIndex = new Date(year, month - 1, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const renderCells = () => {
    const cells = [];
    
    // Empty cells before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <View key={`empty-${i}`} style={styles.calendarCell} />
      );
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const data = daysData[d];
      
      const content = (
        <View style={[styles.calendarCellInner, { backgroundColor: data ? colors.surfaceHighlight : 'transparent' }]}>
          <Text style={[styles.calendarDayNumber, { color: colors.textSecondary }]}>{d}</Text>
          {data && (
            <>
              <Text style={[styles.calendarWeight, { color: colors.primary }]}>{data.weight}</Text>
              {Math.abs(data.diff) > 0 && (
                <Text style={[styles.calendarDiff, { color: data.diff > 0 ? colors.error : colors.success }]}>
                  {data.diff > 0 ? '+' : ''}{data.diff.toFixed(1)}
                </Text>
              )}
              {data.diff === 0 && (
                 <Text style={[styles.calendarDiff, { color: colors.textSecondary }]}>0.0</Text>
              )}
            </>
          )}
        </View>
      );

      cells.push(
        data ? (
          <TouchableOpacity 
            key={`day-${d}`} 
            style={styles.calendarCell} 
            onPress={() => router.push({ pathname: '/modal', params: { id: data.id } })}
          >
            {content}
          </TouchableOpacity>
        ) : (
          <View key={`day-${d}`} style={styles.calendarCell}>
             {content}
          </View>
        )
      );
    }

    return cells;
  };

  const days: string[] = t.history.days || ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.calendarHeader}>
        {days.map((dayName: string, index: number) => (
          <Text key={index} style={[styles.calendarDayHeader, { color: colors.text }]}>{dayName}</Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {renderCells()}
      </View>
    </View>
  );
}
