import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface WeightData {
  value: number;
  label: string; // date
  dataPointText?: string;
}

interface WeightChartProps {
  data: WeightData[];
}

export const WeightChart = ({ data }: WeightChartProps) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  if (data.length === 0) {
      return <View style={{height: 250}} />; // Placeholder
  }

  return (
    <View style={{ overflow: 'hidden', paddingBottom: 10 }}>
    <LineChart
      data={data}
      color={colors.primary}
      thickness={3}
      dataPointsColor={colors.secondary}
      selectionColor={colors.secondary}
      startFillColor={colors.primary}
      endFillColor={colors.primary}
      startOpacity={0.3}
      endOpacity={0.1}
      areaChart
      yAxisTextStyle={{ color: colors.textSecondary }}
      xAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
      noOfSections={5}
      rulesColor={colors.border}
      rulesType="solid"
      width={screenWidth - 60} // Padding consideration
      height={250}
      spacing={40}
      initialSpacing={20}
      yAxisColor="transparent"
      xAxisColor={colors.border}
      textFontSize={12}
      textColor={colors.text}
      hideDataPoints={false}
      pointerConfig={{
        pointerStripHeight: 160,
        pointerStripColor: colors.secondary,
        pointerStripWidth: 2,
        pointerColor: colors.secondary,
        radius: 6,
        pointerLabelWidth: 100,
        pointerLabelHeight: 90,
        activatePointersOnLongPress: true,
        autoAdjustPointerLabelPosition: false,
      }}
    />
    </View>
  );
};
