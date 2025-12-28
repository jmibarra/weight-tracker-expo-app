import { Colors } from '@/constants/Colors';
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
  const screenWidth = Dimensions.get('window').width;

  if (data.length === 0) {
      return <View style={{height: 250}} />; // Placeholder
  }

  return (
    <View style={{ overflow: 'hidden', paddingBottom: 10 }}>
    <LineChart
      data={data}
      color={Colors.dark.primary}
      thickness={3}
      dataPointsColor={Colors.dark.secondary}
      selectionColor={Colors.dark.secondary}
      startFillColor={Colors.dark.primary}
      endFillColor={Colors.dark.primary}
      startOpacity={0.3}
      endOpacity={0.1}
      areaChart
      yAxisTextStyle={{ color: Colors.dark.textSecondary }}
      xAxisTextStyle={{ color: Colors.dark.textSecondary, fontSize: 10 }}
      noOfSections={5}
      rulesColor={Colors.dark.border}
      rulesType="solid"
      width={screenWidth - 60} // Padding consideration
      height={250}
      spacing={40}
      initialSpacing={20}
      yAxisColor="transparent"
      xAxisColor={Colors.dark.border}
      textFontSize={12}
      textColor={Colors.dark.text}
      hideDataPoints={false}
      pointerConfig={{
        pointerStripHeight: 160,
        pointerStripColor: Colors.dark.secondary,
        pointerStripWidth: 2,
        pointerColor: Colors.dark.secondary,
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
