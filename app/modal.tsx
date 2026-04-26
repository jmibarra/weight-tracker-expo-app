import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AchievementModal } from "@/components/AchievementModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { styles } from "@/styles/modal.styles";
import { WeightPickerDialog } from "@/components/WeightPickerDialog";
import {
  Achievement,
  REGISTRY_ACHIEVEMENTS,
  WEIGHT_LOSS_ACHIEVEMENTS,
} from "@/constants/Achievements";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n/I18nContext";
import { ImcCalculator } from "@/services/ImcCalculator";
import { SETTINGS_KEYS } from "@/constants/SettingsKeys";
import { useRepositories } from "@/hooks/useRepositories";

export default function ModalScreen() {
  const { measurements: measurementsRepo, settings: settingsRepo } = useRepositories();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, formatDate } = useI18n();
  const { colors, isDark } = useTheme();

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [legs, setLegs] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showWeightPicker, setShowWeightPicker] = useState(false);

  const [unlockedAchievement, setUnlockedAchievement] =
    useState<Achievement | null>(null);
  const [showAchievementParams, setShowAchievementParams] = useState(false);

  const [initialValues, setInitialValues] = useState<{
    weight: string;
    waist: string;
    hip: string;
    legs: string;
    date: string;
  } | null>(null);

  const navigation = useNavigation();

  const toIsoDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const h = await settingsRepo.getSetting(SETTINGS_KEYS.HEIGHT);
        if (h) setUserHeight(parseFloat(h));

        let initialW = "70.0";
        let initialWa = "";
        let initialH = "";
        let initialL = "";
        let initialD = toIsoDateString(new Date());

        if (params.id) {
          const id = parseInt(params.id as string);
          setEditId(id);
          const m = await measurementsRepo.getMeasurementById(id);
          if (m) {
            initialW = m.weight.toString();
            initialWa = m.waist ? m.waist.toString() : "";
            initialH = m.hip ? m.hip.toString() : "";
            initialL = m.legs ? m.legs.toString() : "";
            initialD = m.date;

            setWeight(initialW);
            setWaist(initialWa);
            setHip(initialH);
            setLegs(initialL);

            // Manually parse YYYY-MM-DD to avoid UTC timezone shifts
            const [year, month, day] = m.date.split("-").map(Number);
            setDate(new Date(year, month - 1, day));
          }
        } else {
          // Create Mode: Init with latest weight or 70
          const latest = await measurementsRepo.getLatestMeasurement();
          if (latest) {
            initialW = latest.weight.toString();
          }
          setWeight(initialW);
          setDate(new Date());
        }

        setInitialValues({
          weight: initialW,
          waist: initialWa,
          hip: initialH,
          legs: initialL,
          date: initialD,
        });
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [params.id, measurementsRepo, settingsRepo]);

  const hasUnsavedChanges = initialValues !== null && (
    weight !== initialValues.weight ||
    waist !== initialValues.waist ||
    hip !== initialValues.hip ||
    legs !== initialValues.legs ||
    toIsoDateString(date) !== initialValues.date
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges || loading) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        t.addEntry.unsavedTitle,
        t.addEntry.unsavedMessage,
        [
          { text: t.addEntry.keepEditing, style: 'cancel', onPress: () => {} },
          {
            text: t.addEntry.discard,
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, loading, t]);



  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    Alert.alert(t.addEntry.delete, t.addEntry.confirmDelete, [
      { text: t.addEntry.cancel, style: "cancel" },
      {
        text: t.addEntry.delete,
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await measurementsRepo.deleteMeasurement(editId);
            router.back();
          } catch (e) {
            Alert.alert(t.common.error, String(e));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!weight) {
      Alert.alert(t.common.error, t.addEntry.validationWeight);
      return;
    }

    setLoading(true);
    const isoDate = toIsoDateString(date);

    const performSave = async (targetEditId: number | null) => {
      try {
        let bmi = 0;
        if (userHeight) {
          bmi = ImcCalculator.calculate(parseFloat(weight), userHeight);
        }

        const data = {
          date: isoDate,
          weight: parseFloat(weight),
          waist: waist ? parseFloat(waist) : undefined,
          hip: hip ? parseFloat(hip) : undefined,
          legs: legs ? parseFloat(legs) : undefined,
          bmi,
        };

        if (targetEditId) {
          await measurementsRepo.updateMeasurement({ ...data, id: targetEditId });
          router.back();
        } else {
          // Check for achievements BEFORE navigating back
          await measurementsRepo.addMeasurement(data);

          // Get new data for checking
          // We use check logic here.
          const measurements = await measurementsRepo.getMeasurementsForChart();
          let unlocked: Achievement | undefined;

          // 1. Check Weight Loss (Priority)
          if (measurements.length > 0) {
            const startWeight = measurements[0].weight;
            const currentIsoDate = isoDate;
            const addedWeight = parseFloat(weight);

            // Find the entry we just added.
            // Note: If multiple entries exist for same date/weight, we take the last one (most likely the new one or consistent).
            // Actually, for "crossing" check, using the logical position in time is correct.
            const currentIndex = measurements.findIndex(
              (m) => m.date === currentIsoDate && m.weight === addedWeight,
            );

            if (currentIndex >= 0) {
              const currentLoss = startWeight - addedWeight;
              let prevLoss = 0;

              if (currentIndex > 0) {
                const prevRecord = measurements[currentIndex - 1];
                prevLoss = startWeight - prevRecord.weight;
              }

              // Check if we CROSSED a threshold this time
              unlocked = WEIGHT_LOSS_ACHIEVEMENTS.find(
                (a) => prevLoss < a.targetCount && currentLoss >= a.targetCount,
              );
            }
          }

          // 2. Check Registry Count (if no weight loss unlock)
          if (!unlocked) {
            const newCount = measurements.length;
            unlocked = REGISTRY_ACHIEVEMENTS.find(
              (a) => a.targetCount === newCount,
            );
          }

          if (unlocked) {
            setUnlockedAchievement(unlocked);
            setShowAchievementParams(true);
          } else {
            router.back();
          }
        }
      } catch (e) {
        console.error(e);
        Alert.alert(t.common.error, t.addEntry.error);
      } finally {
        setLoading(false);
      }
    };

    try {
      const existingEntry = await measurementsRepo.getMeasurementByDate(isoDate);
      
      if (existingEntry && existingEntry.id !== editId) {
        setLoading(false);
        Alert.alert(
          t.addEntry.duplicateTitle,
          t.addEntry.duplicateMessage,
          [
            { text: t.addEntry.cancel, style: 'cancel' },
            {
              text: t.addEntry.overwrite,
              style: 'destructive',
              onPress: () => {
                setLoading(true);
                performSave(existingEntry.id || null);
              }
            }
          ]
        );
        return;
      }
      
      await performSave(editId);
    } catch (e) {
      console.error(e);
      Alert.alert(t.common.error, t.addEntry.error);
      setLoading(false);
    }
  };

  const handleAchievementClose = () => {
    setShowAchievementParams(false);
    router.back();
  };

  // Dynamic Styles
  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const titleStyle = { ...styles.title, color: colors.text };
  const subtitleStyle = { ...styles.subtitle, color: colors.primary };
  const dateLabelStyle = { ...styles.dateLabel, color: colors.text };
  const dateButtonStyle = {
    ...styles.dateButton,
    backgroundColor: colors.surfaceHighlight,
  };
  const dateButtonTextStyle = { ...styles.dateButtonText, color: colors.text };
  const deleteButtonStyle = { marginTop: 16, borderColor: colors.error };
  const deleteButtonTextStyle = { color: colors.error };

  return (
    <View style={containerStyle}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={titleStyle}>
            {editId ? t.addEntry.editTitle : t.addEntry.title}
          </Text>
          <Text style={subtitleStyle}>{formatDate(toIsoDateString(date))}</Text>

          <View style={styles.form}>
            {/* Weight Picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ ...styles.dateLabel, color: colors.text }}>
                {t.addEntry.weight}
              </Text>
              <TouchableOpacity
                onPress={() => setShowWeightPicker(true)}
                style={{
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                }}
              >
                <Text style={{ fontSize: 18, color: colors.text }}>
                  {weight ? `${weight} kg` : t.addEntry.selectWeight}
                </Text>
              </TouchableOpacity>

              <WeightPickerDialog
                visible={showWeightPicker}
                initialValue={weight ? parseFloat(weight) : 70.0}
                onClose={() => setShowWeightPicker(false)}
                onSave={(val) => setWeight(val.toString())}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label={t.addEntry.waist}
                  placeholder=""
                  keyboardType="numeric"
                  value={waist}
                  onChangeText={setWaist}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label={t.addEntry.hip}
                  placeholder=""
                  keyboardType="numeric"
                  value={hip}
                  onChangeText={setHip}
                />
              </View>
            </View>

            <Input
              label={t.addEntry.legs}
              placeholder=""
              keyboardType="numeric"
              value={legs}
              onChangeText={setLegs}
            />

            <View style={styles.dateContainer}>
              <Text style={dateLabelStyle}>{t.addEntry.date}</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={dateButtonStyle}
              >
                <Text style={dateButtonTextStyle}>
                  {formatDate(toIsoDateString(date))}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Button
              title={editId ? t.addEntry.update : t.addEntry.save}
              onPress={handleSave}
              loading={loading}
              style={{ marginTop: 24 }}
            />

            {editId && (
              <Button
                title={t.addEntry.delete}
                variant="outline"
                onPress={handleDelete}
                style={deleteButtonStyle}
                textStyle={deleteButtonTextStyle}
              />
            )}

            <Button
              title={t.addEntry.cancel}
              variant="ghost"
              onPress={() => router.back()}
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AchievementModal
        visible={showAchievementParams}
        achievement={unlockedAchievement}
        onClose={handleAchievementClose}
      />
    </View>
  );
}
