import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nContext';
import { Measurement } from '@/db/repositories/MeasurementsRepository';
import { LineChart } from 'react-native-gifted-charts';

interface MeasurementsChartModalProps {
  visible: boolean;
  onClose: () => void;
  data: Measurement[];
}

export const MeasurementsChartModal = ({ visible, onClose, data }: MeasurementsChartModalProps) => {
  const { colors } = useTheme();
  const { t, dateFormat } = useI18n();

  const screenWidth = Dimensions.get('window').width;

  // Process data for charts
  const mappedData = data.map(m => {
    const day = m.date.slice(8, 10);
    const month = m.date.slice(5, 7);
    const label = dateFormat.startsWith('dd') ? `${day}/${month}` : `${month}/${day}`;

    return {
      waist: m.waist ? { value: m.waist, label, dataPointText: m.waist.toString() } : null,
      hip: m.hip ? { value: m.hip, label, dataPointText: m.hip.toString() } : null,
      legs: m.legs ? { value: m.legs, label, dataPointText: m.legs.toString() } : null,
      date: m.date
    };
  });

  const waistData = mappedData.map(d => d.waist || { value: 0, label: d.date.slice(5, 10) }).filter(d => d.value > 0);
  const hipData = mappedData.map(d => d.hip || { value: 0, label: d.date.slice(5, 10) }).filter(d => d.value > 0);
  const legsData = mappedData.map(d => d.legs || { value: 0, label: d.date.slice(5, 10) }).filter(d => d.value > 0);

  // If there's no data at all with measures, just empty array
  const hasData = waistData.length > 0 || hipData.length > 0 || legsData.length > 0;

  // Colors for lines
  const waistColor = "#E64A19"; // Deep Orange
  const hipColor = "#1976D2";   // Blue
  const legsColor = "#388E3C";  // Green

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t.home.measurementsChartTitle || 'Evolución de Medidas'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40}}>
            {!hasData ? (
              <View style={styles.emptyContainer}>
                <Text style={{ color: colors.textSecondary }}>{t.home.noChartData}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 20 }}>
                {/* Legend */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, {backgroundColor: waistColor}]} />
                        <Text style={{color: colors.text, fontSize: 12}}>{t.addEntry.waist}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, {backgroundColor: hipColor}]} />
                        <Text style={{color: colors.text, fontSize: 12}}>{t.addEntry.hip}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, {backgroundColor: legsColor}]} />
                        <Text style={{color: colors.text, fontSize: 12}}>{t.addEntry.legs}</Text>
                    </View>
                </View>
                
                <LineChart
                  data={waistData.length > 0 ? waistData : [{value: 0}]}
                  data2={hipData.length > 0 ? hipData : [{value: 0}]}
                  data3={legsData.length > 0 ? legsData : [{value: 0}]}
                  color1={waistColor}
                  color2={hipColor}
                  color3={legsColor}
                  dataPointsColor1={waistColor}
                  dataPointsColor2={hipColor}
                  dataPointsColor3={legsColor}
                  hideDataPoints1={false}
                  hideDataPoints2={false}
                  hideDataPoints3={false}
                  thickness1={2}
                  thickness2={2}
                  thickness3={2}
                  width={screenWidth - 80}
                  height={250}
                  spacing={40}
                  initialSpacing={20}
                  yAxisColor="transparent"
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                  rulesColor={colors.border}
                  rulesType="solid"
                  noOfSections={5}
                  textFontSize={10}
                  textColor={colors.text}
                  pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: colors.secondary,
                    pointerStripWidth: 2,
                    pointerColor: colors.secondary,
                    radius: 6,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: true,
                  }}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '60%',
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flex: 1,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  }
});
