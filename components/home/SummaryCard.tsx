import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Measurement } from "@/db/repositories/MeasurementsRepository";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n/I18nContext";

interface SummaryCardProps {
  latest: Measurement | null;
  previous: Measurement | null;
  data: Measurement[];
  targetWeight: number;
  loading: boolean;
}

export function SummaryCard({
  latest,
  previous,
  data,
  targetWeight,
  loading,
}: SummaryCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, formatDate } = useI18n();

  const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return colors.secondary;
    if (bmi < 25) return colors.success;
    if (bmi < 30) return "#FFC107"; // Warning
    return colors.error;
  };

  const getChangeColor = (val: number) =>
    val > 0 ? colors.error : colors.success;

  if (!latest) {
    if (loading) return null;
    return (
      <Card style={{ padding: 30, alignItems: "center" }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
          {t.home.noData}
        </Text>
        <Button title={t.home.addEntry} onPress={() => router.push("/modal")} />
      </Card>
    );
  }

  return (
    <Card style={styles.mainCard}>
      <View style={styles.mainCardHeader}>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {t.home.currentWeight}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          {formatDate(latest.date)}
        </Text>
      </View>

      <View style={styles.weightRow}>
        <Text style={[styles.bigWeight, { color: colors.text }]}>
          {latest.weight}
          <Text style={[styles.bigUnit, { color: colors.text }]}>kg</Text>
        </Text>

        {/* BMI Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: getBmiColor(latest.bmi || 0) + "20" },
          ]}
        >
          <Text
            style={[styles.badgeText, { color: getBmiColor(latest.bmi || 0) }]}
          >
            {t.home.bmi}: {latest.bmi || "--"}
          </Text>
        </View>
      </View>

      {/* Trend Line */}
      {previous && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: getChangeColor(latest.weight - previous.weight),
            }}
          >
            {latest.weight - previous.weight > 0 ? "↑" : "↓"}{" "}
            {Math.abs(latest.weight - previous.weight).toFixed(1)} kg
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginLeft: 6,
            }}
          >
            {" "}
            {t.home.vsLastRecord}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      {targetWeight > 0 && data.length > 0 && (() => {
        // Cálculo de progreso reutilizable para texto y barra
        const calculateProgress = () => {
          const start = data[0].weight;
          const current = latest.weight;
          const target = targetWeight;
          if (start === target) return 1;
          let progress = start > target
            ? (start - current) / (start - target)
            : (current - start) / (target - start);
          return Math.max(0, Math.min(1, progress));
        };
        const progress = calculateProgress();

        return (
          <View
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontWeight: "600",
                }}
              >
                {t.home.target}: {targetWeight} kg
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.primary,
                  fontWeight: "700",
                }}
              >
                {`${Math.round(progress * 100)}%`}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                  width: `${progress * 100}%` as any,
                }}
              />
            </View>
          </View>
        );
      })()}
    </Card>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    padding: 24,
    marginBottom: 16,
    overflow: "hidden",
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bigWeight: {
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  bigUnit: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
