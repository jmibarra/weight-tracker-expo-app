import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Measurement } from "@/db/repositories/MeasurementsRepository";
import { 
    comparePeriods, 
    getMeasurementsForMonth, 
    getMeasurementsForYear, 
    MetricDifference 
} from "@/utils/metricsUtils";
import { useI18n } from "@/i18n/I18nContext";

interface PeriodComparatorCardProps {
  measurements: Measurement[];
}

type PeriodType = 'month' | 'year';

export const PeriodComparatorCard = ({ measurements }: PeriodComparatorCardProps) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [offset, setOffset] = useState(0); // 0 = current, 1 = previous, etc.

  const { currentMs, prevMs, periodLabel } = useMemo(() => {
    const now = new Date();
    
    if (periodType === 'month') {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const prevTargetDate = new Date(now.getFullYear(), now.getMonth() - (offset + 1), 1);
        
        const cMs = getMeasurementsForMonth(measurements, targetDate.getFullYear(), targetDate.getMonth());
        const pMs = getMeasurementsForMonth(measurements, prevTargetDate.getFullYear(), prevTargetDate.getMonth());
        
        // Month formatting
        const formatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
        return { currentMs: cMs, prevMs: pMs, periodLabel: formatter.format(targetDate) };
    } else {
        const targetYear = now.getFullYear() - offset;
        const prevTargetYear = targetYear - 1;
        
        const cMs = getMeasurementsForYear(measurements, targetYear);
        const pMs = getMeasurementsForYear(measurements, prevTargetYear);
        
        return { currentMs: cMs, prevMs: pMs, periodLabel: `${targetYear}` };
    }
  }, [measurements, periodType, offset]);

  const comparison = useMemo(() => comparePeriods(currentMs, prevMs), [currentMs, prevMs]);

  const MetricRow = ({ label, currentVal, prevVal, diff, suffix }: { label: string, currentVal: number, prevVal: number, diff: MetricDifference, suffix: string }) => {
    const isWeight = label === t.metrics.avgWeight;
    // For weight/measurements, negative is usually "good" (green) for weight loss tracker 
    const isPositiveChange = diff.absolute > 0;
    const isNeutral = diff.absolute === 0;
    
    const diffColor = isNeutral ? colors.textSecondary : (isPositiveChange ? colors.error : colors.success);
    const diffIcon = isPositiveChange ? "arrow.up.right" : "arrow.down.right";

    return (
        <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
            
            <View style={styles.valuesContainer}>
                <View style={styles.valueBox}>
                    <Text style={[styles.valueText, { color: colors.text }]}>
                        {currentVal > 0 ? currentVal.toFixed(1) : '-'} {suffix}
                    </Text>
                </View>
                
                <View style={styles.diffBox}>
                    {!isNeutral && currentVal > 0 && prevVal > 0 ? (
                        <>
                            <IconSymbol name={diffIcon} size={14} color={diffColor} />
                            <Text style={[styles.diffText, { color: diffColor }]}>
                                {Math.abs(diff.absolute).toFixed(1)} {suffix}
                            </Text>
                            <Text style={[styles.percentText, { color: diffColor }]}>
                                ({Math.abs(diff.percentage).toFixed(1)}%)
                            </Text>
                        </>
                    ) : (
                         <Text style={[styles.diffText, { color: colors.textSecondary }]}>-</Text>
                    )}
                </View>
            </View>
        </View>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      
      {/* Header and Toggle */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t.metrics.periodComparator}</Text>
        <View style={[styles.toggleContainer, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
                style={[styles.toggleBtn, periodType === 'month' && { backgroundColor: colors.primary }]}
                onPress={() => { setPeriodType('month'); setOffset(0); }}
            >
                <Text style={[styles.toggleText, { color: periodType === 'month' ? '#fff' : colors.textSecondary }]}>{t.home.ranges.month}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.toggleBtn, periodType === 'year' && { backgroundColor: colors.primary }]}
                onPress={() => { setPeriodType('year'); setOffset(0); }}
            >
                <Text style={[styles.toggleText, { color: periodType === 'year' ? '#fff' : colors.textSecondary }]}>{t.home.ranges.year}</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Paginator */}
      <View style={styles.paginator}>
        <TouchableOpacity onPress={() => setOffset(o => o + 1)} style={styles.pageBtn}>
             <IconSymbol name="chevron.left" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.periodLabel, { color: colors.text, textTransform: 'capitalize' }]}>{periodLabel}</Text>
        <TouchableOpacity onPress={() => setOffset(o => Math.max(0, o - 1))} style={styles.pageBtn} disabled={offset === 0}>
             <IconSymbol name="chevron.right" size={20} color={offset === 0 ? colors.border : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Metrics */}
      <View style={[styles.metricsContainer, { borderTopColor: colors.border }]}>
          <MetricRow 
            label={t.metrics.avgWeight} 
            currentVal={comparison.current.weight} 
            prevVal={comparison.previous.weight} 
            diff={comparison.differences.weight} 
            suffix="kg" 
           />
          
          <MetricRow 
            label={t.metrics.avgWaist} 
            currentVal={comparison.current.waist} 
            prevVal={comparison.previous.waist} 
            diff={comparison.differences.waist} 
            suffix="cm" 
           />

          <MetricRow 
            label={t.metrics.avgHip} 
            currentVal={comparison.current.hip} 
            prevVal={comparison.previous.hip} 
            diff={comparison.differences.hip} 
            suffix="cm" 
           />

          <MetricRow 
            label={t.metrics.avgLegs} 
            currentVal={comparison.current.legs} 
            prevVal={comparison.previous.legs} 
            diff={comparison.differences.legs} 
            suffix="cm" 
           />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paginator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pageBtn: {
    padding: 4,
  },
  metricsContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    flex: 1,
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  valueBox: {
    width: 65,
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600',
  },
  diffBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  diffText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 2,
  },
  percentText: {
    fontSize: 11,
    marginLeft: 4,
  }
});
