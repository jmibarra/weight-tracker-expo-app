import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n/I18nContext";
import { Measurement, MeasurementsRepository } from "@/db/repositories/MeasurementsRepository";
import { getWeeklyAverages, WeeklyAverageData } from "@/utils/metricsUtils";
import { WeeklyBarChart } from "@/components/charts/WeeklyBarChart";
import { PeriodComparatorCard } from "@/components/metrics/PeriodComparatorCard";

export default function MetricsScreen() {
  const db = useSQLiteContext();
  const { t } = useI18n();
  const { colors } = useTheme();

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyAverageData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const repo = new MeasurementsRepository(db);
      // Fetching all to be able to compute averages in comparator correctly.
      // getMeasurementsForChart returns them chronologically (oldest to newest)
      const data = await repo.getMeasurementsForChart();
      setMeasurements(data);
      setWeeklyData(getWeeklyAverages(data, 12)); // Show up to last 12 weeks
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.metrics.title}</Text>
        
        <PeriodComparatorCard measurements={measurements} />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <WeeklyBarChart 
            data={weeklyData} 
            title={t.metrics.weeklyTrend} 
            noDataText={t.metrics.noData} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 80, // Space for Bottom Tab Bar
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
