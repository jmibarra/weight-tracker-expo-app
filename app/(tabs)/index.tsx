import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MeasurementsChartModal } from "@/components/charts/MeasurementsChartModal";
import { WeightChart } from "@/components/charts/WeightChart";
import { StreaksSection } from "@/components/home/StreaksSection";
import { SummaryCard } from "@/components/home/SummaryCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import {
  Measurement,
} from "@/db/repositories/MeasurementsRepository";
import { useI18n } from "@/i18n/I18nContext";
import { SETTINGS_KEYS } from "@/constants/SettingsKeys";
import { useRepositories } from "@/hooks/useRepositories";

export default function HomeScreen() {
  const { measurements: measurementsRepo, settings: settingsRepo } = useRepositories();
  const router = useRouter();
  const { t, formatDate, dateFormat } = useI18n();
  const { colors } = useTheme();

  const [data, setData] = useState<Measurement[]>([]);
  const [isMeasurementsModalVisible, setMeasurementsModalVisible] =
    useState(false);
  const [latest, setLatest] = useState<Measurement | null>(null);
  const [previous, setPrevious] = useState<Measurement | null>(null);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"all" | "1Y" | "YTD" | "1M" | "1W">("1W");
  const [chartPage, setChartPage] = useState(0);
  const [streaks, setStreaks] = useState<{
    currentStreak: number;
    longestStreak: number;
    longestStreakEndDate: string | null;
  }>({
    currentStreak: 0,
    longestStreak: 0,
    longestStreakEndDate: null,
  });

  // Filter logic
  const getFilteredData = () => {
    let filtered = data;

    if (range !== "all") {
      const now = new Date();
      let limitDate = new Date();

      if (range === "1Y") limitDate.setFullYear(now.getFullYear() - 1);
      if (range === "YTD") limitDate.setMonth(0, 1);
      if (range === "1M") limitDate.setMonth(now.getMonth() - 1);
      if (range === "1W") limitDate.setDate(now.getDate() - 7);

      filtered = data.filter((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        limitDate.setHours(0, 0, 0, 0);
        return itemDate >= limitDate;
      });
    }

    const timeFiltered = [...filtered];
    const measurementsData = timeFiltered.filter(
      (m) => m.waist || m.hip || m.legs,
    );

    // Pagination for large datasets
    const PAGE_SIZE = 50;
    let totalPages = Math.ceil(timeFiltered.length / PAGE_SIZE);
    if (totalPages === 0) totalPages = 1;
    const safePage = Math.min(chartPage, totalPages - 1);
    
    // Page 0 = newest data (end of array)
    // Page 1 = older data, etc.
    let paginated = timeFiltered;
    if (timeFiltered.length > PAGE_SIZE) {
      const end = timeFiltered.length - safePage * PAGE_SIZE;
      const start = Math.max(0, end - PAGE_SIZE);
      paginated = timeFiltered.slice(start, end);
    }

    const lineData = paginated.map((m, index) => {
      const currentYear = m.date.slice(0, 4);
      const prevYear =
        index > 0 ? paginated[index - 1].date.slice(0, 4) : currentYear;
      const isYearChange = currentYear !== prevYear && range === "all";

      const day = m.date.slice(8, 10);
      const month = m.date.slice(5, 7);

      let label = dateFormat.startsWith("dd")
        ? `${day}/${month}`
        : `${month}/${day}`;

      if (isYearChange) {
        label = currentYear;
      }

      return {
        value: m.weight,
        label: label,
        dataPointText: m.weight.toString(),
        date: m.date, // Keep full date for sorting if needed
        showVerticalLine: isYearChange,
        verticalLineColor: isYearChange ? colors.primary : undefined, // Make it pop a bit more or use border
        verticalLineThickness: isYearChange ? 1 : undefined,
        labelTextStyle: isYearChange
          ? { fontWeight: "bold" as const, color: colors.text }
          : undefined,
      };
    });

    return { lineData, filteredRaw: paginated, measurementsData, totalPages, safePage };
  };

  // Memoizar para evitar recálculos en cada render
  const {
    lineData: filteredChartData,
    filteredRaw,
    measurementsData,
    totalPages,
    safePage,
  } = useMemo(() => getFilteredData(), [data, range, dateFormat, colors, chartPage]);

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
        maData.push({ value: sum / (i + 1), label: "" });
      } else {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          sum += data[i - j].weight;
        }
        maData.push({ value: sum / windowSize, label: "" });
      }
    }
    return maData;
  };

  // Memoizar el cálculo de la línea de tendencia (media móvil)
  const trendLineData = useMemo(() => {
    let windowSize = 0;
    if (range === "1W") windowSize = 3;
    if (range === "1M") windowSize = 5;
    if (range === "YTD") windowSize = 6;
    if (range === "1Y") windowSize = 7;
    // 'all' -> 0 (sin línea de tendencia)

    return windowSize > 0
      ? calculateMovingAverage(filteredRaw, windowSize)
      : undefined;
  }, [filteredRaw, range]);

  const [showTrendLine, setShowTrendLine] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const measurements = await measurementsRepo.getMeasurementsForChart(); // Ascendente para gráfico
      const target = await settingsRepo.getSetting(SETTINGS_KEYS.TARGET_WEIGHT);
      const showTrend = await settingsRepo.getSetting(SETTINGS_KEYS.SHOW_TREND_LINE);

      if (target) setTargetWeight(parseFloat(target));
      if (showTrend !== null) setShowTrendLine(showTrend === "true");

      const streakData = await measurementsRepo.getStreaks();
      setStreaks(streakData);

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
  }, [measurementsRepo, settingsRepo]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return colors.secondary;
    if (bmi < 25) return colors.success;
    if (bmi < 30) return "#FFC107"; // Warning
    return colors.error;
  };

  // Dynamic styles
  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const headerTitleStyle = { ...styles.headerTitle, color: colors.text };
  const cardTitleStyle = { ...styles.cardTitle, color: colors.text };

  // Compact stats
  const statLabelStyle = {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginBottom: 2,
  };
  const statValueStyle = {
    fontSize: 14,
    fontWeight: "700" as const,
    color: colors.text,
  };
  const unitStyle = {
    fontSize: 9,
    fontWeight: "normal" as const,
    color: colors.textSecondary,
  };
  const getChangeColor = (val: number) =>
    val > 0 ? colors.error : colors.success;

  return (
    <SafeAreaView style={containerStyle} edges={["top"]}>
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
        <Text style={headerTitleStyle}>{t.home.title}</Text>

        {/* Main Weight Card & Empty State */}
        <SummaryCard
          latest={latest}
          previous={previous}
          data={data}
          targetWeight={targetWeight}
          loading={loading}
        />

        {/* Streaks Section */}
        {latest && <StreaksSection streaks={streaks} />}

        {/* Chart Section */}
        <Card style={styles.chartCard}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              width: "100%",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={cardTitleStyle}>{t.home.trend}</Text>
              <TouchableOpacity
                onPress={() => setMeasurementsModalVisible(true)}
              >
                <MaterialCommunityIcons
                  name="tape-measure"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {(["all", "1Y", "YTD", "1M", "1W"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => {
                    setRange(r as any);
                    setChartPage(0);
                  }}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 16,
                    backgroundColor:
                      range === r ? colors.primary : colors.surfaceHighlight,
                  }}
                >
                  <Text
                    style={{
                      color: range === r ? "#fff" : colors.textSecondary,
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    {
                      {
                        all: t.home.ranges.all,
                        "1Y": t.home.ranges.year,
                        YTD: "YTD",
                        "1M": t.home.ranges.month,
                        "1W": t.home.ranges.week,
                      }[r]
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filteredChartData.length > 0 ? (
            <>
              <WeightChart
                data={filteredChartData}
                trendData={showTrendLine ? trendLineData : undefined}
                targetWeight={targetWeight > 0 ? targetWeight : undefined}
              />
              {totalPages > 1 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 10, marginTop: 10 }}>
                  <TouchableOpacity 
                    disabled={safePage >= totalPages - 1} 
                    onPress={() => setChartPage(p => p + 1)}
                    style={{ padding: 8, opacity: safePage >= totalPages - 1 ? 0.3 : 1 }}
                  >
                    <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
                  </TouchableOpacity>
                  
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {safePage + 1} / {totalPages}
                  </Text>
                  
                  <TouchableOpacity 
                    disabled={safePage === 0} 
                    onPress={() => setChartPage(p => p - 1)}
                    style={{ padding: 8, opacity: safePage === 0 ? 0.3 : 1 }}
                  >
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={{ color: colors.textSecondary }}>
                {t.home.noChartData}
              </Text>
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
                  <Text style={statValueStyle}>
                    {targetWeight} <Text style={unitStyle}>kg</Text>
                  </Text>
                </Card>
                <Card style={styles.gridCard}>
                  <Text style={statLabelStyle}>{t.home.toGo}</Text>
                  <Text style={[statValueStyle, { color: colors.primary }]}>
                    {(latest.weight - targetWeight).toFixed(1)}{" "}
                    <Text style={unitStyle}>kg</Text>
                  </Text>
                </Card>
              </>
            )}

            {data.length > 0 && (
              <>
                <Card style={styles.gridCard}>
                  <Text style={statLabelStyle}>{t.home.progress}</Text>
                  <Text
                    style={[
                      statValueStyle,
                      {
                        color:
                          latest.weight - data[0].weight > 0
                            ? colors.error
                            : colors.success,
                      },
                    ]}
                  >
                    {(latest.weight - data[0].weight).toFixed(1)}{" "}
                    <Text style={unitStyle}>kg</Text>
                  </Text>
                </Card>
                <Card style={styles.gridCard}>
                  <Text style={statLabelStyle}>{t.home.startWeight}</Text>
                  <Text style={statValueStyle}>
                    {data[0].weight} <Text style={unitStyle}>kg</Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: colors.textSecondary,
                      marginTop: 0,
                    }}
                  >
                    {formatDate(data[0].date)}
                  </Text>
                </Card>

                {(() => {
                  const maxRecord = data.reduce(
                    (prev, current) =>
                      prev.weight > current.weight ? prev : current,
                    data[0],
                  );
                  const minRecord = data.reduce(
                    (prev, current) =>
                      prev.weight < current.weight ? prev : current,
                    data[0],
                  );
                  return (
                    <>
                      <Card style={styles.gridCard}>
                        <Text style={statLabelStyle}>{t.home.maxWeight}</Text>
                        <Text style={statValueStyle}>
                          {maxRecord.weight} <Text style={unitStyle}>kg</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            color: colors.textSecondary,
                            marginTop: 0,
                          }}
                        >
                          {formatDate(maxRecord.date)}
                        </Text>
                      </Card>
                      <Card style={styles.gridCard}>
                        <Text style={statLabelStyle}>{t.home.minWeight}</Text>
                        <Text style={statValueStyle}>
                          {minRecord.weight} <Text style={unitStyle}>kg</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            color: colors.textSecondary,
                            marginTop: 0,
                          }}
                        >
                          {formatDate(minRecord.date)}
                        </Text>
                      </Card>
                    </>
                  );
                })()}
              </>
            )}
          </View>
        )}
      </ScrollView>
      <MeasurementsChartModal
        visible={isMeasurementsModalVisible}
        onClose={() => setMeasurementsModalVisible(false)}
        data={measurementsData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 20, // Add bottom padding to avoid tab bar overlap
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  mainCard: {
    marginBottom: 12,
    padding: 16,
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  bigWeight: {
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 46,
  },
  bigUnit: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 6,
  },
  badgeText: {
    fontWeight: "800",
    fontSize: 13,
  },
  chartCard: {
    marginBottom: 12,
    alignItems: "center",
    padding: 12,
    paddingLeft: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Tighter gap
  },
  gridCard: {
    flex: 1,
    minWidth: "30%", // Allow 3 columns (approx 30%)
    padding: 5,
    justifyContent: "center",
    alignItems: "center", // Center align content for 3-col
    height: 70,
  },
});
