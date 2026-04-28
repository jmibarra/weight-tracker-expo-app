import { useTheme } from "@/context/ThemeContext";
import { useI18n } from '@/i18n/I18nContext';
import React from "react";
import { Dimensions, View, Text } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { WeeklyAverageData } from "@/utils/metricsUtils";

interface WeeklyBarChartProps {
  data: WeeklyAverageData[];
  title?: string;
  noDataText?: string;
}

export const WeeklyBarChart = ({ data, title, noDataText }: WeeklyBarChartProps) => {
  const { colors } = useTheme();
  const { t } = useI18n();
  const screenWidth = Dimensions.get("window").width;

  if (data.length === 0) {
    return (
      <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>{noDataText || t.metrics.noData}</Text>
      </View>
    );
  }

  // Find min for yAxisOffset so bars aren't incredibly tall starting from 0
  const minRecorded = Math.min(...data.map((d) => d.value));
  const yOffset = Math.max(0, Math.floor(minRecorded - 2));

  // Transform for gifted-charts BarChart
  const chartData = data.map((d, index) => {
    // Determine color based on previous week's value
    let barColor = colors.primary; // default / neutral
    
    if (index > 0) {
      const prevValue = data[index - 1].value;
      if (d.value < prevValue) {
        barColor = colors.success; // descenso
      } else if (d.value > prevValue) {
        barColor = colors.error; // ascenso
      }
    }

    return {
      value: d.value,
      label: d.label,
      frontColor: barColor,
      topLabelComponent: () => (
        <Text style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 4 }}>
          {d.value}
        </Text>
      )
    };
  });

  return (
    <View style={{ overflow: "hidden", paddingBottom: 10, paddingTop: 10 }}>
        {title && (
            <Text style={{ 
                color: colors.text, 
                fontSize: 18, 
                fontWeight: '600', 
                marginBottom: 16,
                marginLeft: 16 
            }}>
                {title}
            </Text>
        )}
      <BarChart
        data={chartData}
        width={screenWidth - 60}
        height={250}
        yAxisOffset={yOffset}
        barWidth={28}
        spacing={24}
        roundedTop
        roundedBottom
        hideRules
        xAxisThickness={1}
        yAxisThickness={0}
        xAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.textSecondary }}
        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
        noOfSections={4}
        isAnimated
      />
    </View>
  );
};
