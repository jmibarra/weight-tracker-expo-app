import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { WeightPickerDialog } from "@/components/WeightPickerDialog";
import { Achievement, ALL_ACHIEVEMENTS } from "@/constants/Achievements";
import { useTheme } from "@/context/ThemeContext";
import { MeasurementsRepository } from "@/db/repositories/MeasurementsRepository";
import { SettingsRepository } from "@/db/repositories/SettingsRepository";
import { useI18n } from "@/i18n/I18nContext";
import { SETTINGS_KEYS } from "@/constants/SettingsKeys";

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const { t } = useI18n();
  const { colors } = useTheme();
  const router = useRouter();

  const [height, setHeight] = useState("");
  const [sex, setSex] = useState<"M" | "F" | "">("");
  const [targetWeight, setTargetWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTargetWeightPicker, setShowTargetWeightPicker] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalWeightLost, setTotalWeightLost] = useState(0);

  /* Reactividad: usar useFocusEffect para recargar al volver a la pantalla */
  useFocusEffect(
    React.useCallback(() => {
      const loadSettings = async () => {
        try {
          const repo = new SettingsRepository(db);
          const savedHeight = await repo.getSetting(SETTINGS_KEYS.HEIGHT);
          const savedSex = await repo.getSetting(SETTINGS_KEYS.SEX);
          const savedTarget = await repo.getSetting(SETTINGS_KEYS.TARGET_WEIGHT);

          if (savedHeight) setHeight(savedHeight);
          if (savedSex) setSex(savedSex as "M" | "F");
          if (savedTarget) setTargetWeight(savedTarget);

          const measurementsRepo = new MeasurementsRepository(db);
          const count = await measurementsRepo.count();
          setTotalRecords(count);

          const measurements = await measurementsRepo.getMeasurementsForChart();
          if (measurements.length > 0) {
            const startWeight = measurements[0].weight;
            const currentWeight = measurements[measurements.length - 1].weight;
            setTotalWeightLost(startWeight - currentWeight);
          } else {
            setTotalWeightLost(0);
          }
        } catch (e) {
          console.error("Failed to load settings", e);
        }
      };
      loadSettings();
    }, [db]),
  );

  const handleSave = async () => {
    if (!height) {
      Alert.alert(t.common.error, t.profile.validationHeight);
      return;
    }

    setLoading(true);
    try {
      const repo = new SettingsRepository(db);
      await repo.setSetting(SETTINGS_KEYS.HEIGHT, height);
      await repo.setSetting(SETTINGS_KEYS.SEX, sex);
      if (targetWeight) {
        await repo.setSetting(SETTINGS_KEYS.TARGET_WEIGHT, targetWeight);
      }
      Alert.alert(t.common.success, t.profile.success);
    } catch (e) {
      Alert.alert(t.common.error, t.profile.error);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAchievementUnlocked = (achievement: Achievement) => {
    if (achievement.type === "registry") {
      return totalRecords >= achievement.targetCount;
    } else if (achievement.type === "weight_loss") {
      return totalWeightLost >= achievement.targetCount;
    }
    return false;
  };

  const handleAchievementPress = (achievement: Achievement) => {
    const isUnlocked = isAchievementUnlocked(achievement);
    const title =
      t.achievements[achievement.id as keyof typeof t.achievements]?.title ||
      achievement.id;
    const description =
      t.achievements[achievement.id as keyof typeof t.achievements]
        ?.description || "";

    const progressValue =
      achievement.type === "registry"
        ? totalRecords
        : totalWeightLost.toFixed(1);
    const unit =
      achievement.type === "registry" ? t.achievements.records : "kg";

    Alert.alert(
      title,
      `${description}\n\n${t.achievements.progress}: ${progressValue}/${achievement.targetCount} ${unit}`,
      [{ text: t.common.ok }],
    );
  };

  const containerStyle = { flex: 1, backgroundColor: colors.background };
  const titleStyle = { color: colors.text, ...styles.title };
  const subtitleStyle = { color: colors.textSecondary, ...styles.subtitle };
  const labelStyle = {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500" as const,
  };
  const valueStyle = {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600" as const,
  };

  return (
    <SafeAreaView style={containerStyle} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingRight: 4 }}>
            <Text style={[titleStyle, { marginBottom: 0 }]}>{t.profile.title}</Text>
            <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: 4 }}>
              <IconSymbol name="gearshape.fill" size={26} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={subtitleStyle}>{t.profile.subtitle}</Text>

          <Card>
            <View style={styles.formGrid}>
              {/* Row 1: Height & Sex */}
              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={labelStyle}>{t.profile.height}</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.surfaceHighlight,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Input
                      placeholder="175"
                      keyboardType="numeric"
                      value={height}
                      onChangeText={setHeight}
                      maxLength={3}
                      style={{
                        borderWidth: 0,
                        backgroundColor: "transparent",
                        padding: 0,
                        height: 30,
                        fontSize: 16,
                        color: colors.text,
                        marginTop: 15,
                      }}
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={labelStyle}>{t.profile.sex}</Text>
                  <View style={styles.sexSelector}>
                    <TouchableOpacity
                      onPress={() => setSex("M")}
                      style={[
                        styles.sexOption,
                        {
                          backgroundColor:
                            sex === "M"
                              ? colors.primary
                              : colors.surfaceHighlight,
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: sex === "M" ? "#FFF" : colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        M
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setSex("F")}
                      style={[
                        styles.sexOption,
                        {
                          backgroundColor:
                            sex === "F"
                              ? colors.primary
                              : colors.surfaceHighlight,
                          borderTopRightRadius: 8,
                          borderBottomRightRadius: 8,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: sex === "F" ? "#FFF" : colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        F
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Divider Line */}
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginVertical: 16,
                  opacity: 0.5,
                }}
              />

              {/* Row 2: Target Weight */}
              <View>
                <Text style={labelStyle}>{t.profile.targetWeight}</Text>
                <TouchableOpacity
                  onPress={() => setShowTargetWeightPicker(true)}
                  style={[
                    styles.targetInput,
                    {
                      backgroundColor: colors.surfaceHighlight,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={valueStyle}>
                    {targetWeight
                      ? `${targetWeight} kg`
                      : t.profile.targetWeight}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.primary }}>
                    {t.profile.edit}
                  </Text>
                </TouchableOpacity>

                <WeightPickerDialog
                  visible={showTargetWeightPicker}
                  initialValue={targetWeight ? parseFloat(targetWeight) : 70.0}
                  onClose={() => setShowTargetWeightPicker(false)}
                  onSave={(val) => setTargetWeight(val.toString())}
                />
              </View>
            </View>
          </Card>

          <Text
            style={[
              titleStyle,
              { fontSize: 22, marginTop: 24, marginBottom: 12 },
            ]}
          >
            {t.achievements.sectionTitle}
          </Text>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -24 }} // Negative margin to span full width
            contentContainerStyle={{ paddingHorizontal: 0 }} // Remove padding from content
          >
            {/* Slide 1: Registry */}
            <View
              style={{
                width: Dimensions.get("window").width,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={[
                  subtitleStyle,
                  { marginTop: 16, marginBottom: 8, textAlign: "center" },
                ]}
              >
                {t.achievements.registryTitle}
              </Text>
              <Card>
                <View style={styles.achievementsGrid}>
                  {ALL_ACHIEVEMENTS.filter((a) => a.type === "registry").map(
                    (achievement) => {
                      const isUnlocked = isAchievementUnlocked(achievement);
                      return (
                        <TouchableOpacity
                          key={achievement.id}
                          style={styles.achievementItem}
                          onPress={() => handleAchievementPress(achievement)}
                        >
                          <View
                            style={[
                              styles.achievementIconContainer,
                              {
                                backgroundColor: isUnlocked
                                  ? colors.primary + "20"
                                  : colors.surfaceHighlight,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={achievement.icon}
                              size={28}
                              color={
                                isUnlocked
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                              style={{ opacity: isUnlocked ? 1 : 0.5 }}
                            />
                          </View>
                          <Text
                            style={[
                              styles.achievementTitle,
                              {
                                color: isUnlocked
                                  ? colors.text
                                  : colors.textSecondary,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {t.achievements[
                              achievement.id as keyof typeof t.achievements
                            ]?.title || achievement.id}
                          </Text>
                          <Text
                            style={[
                              styles.achievementDesc,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {achievement.targetCount} {t.achievements.regsAbbr}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </Card>
            </View>

            {/* Slide 2: Weight Loss */}
            <View
              style={{
                width: Dimensions.get("window").width,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={[
                  subtitleStyle,
                  { marginTop: 16, marginBottom: 8, textAlign: "center" },
                ]}
              >
                {t.achievements.weightLossTitle}
              </Text>
              <Card>
                <View style={styles.achievementsGrid}>
                  {ALL_ACHIEVEMENTS.filter((a) => a.type === "weight_loss").map(
                    (achievement) => {
                      const isUnlocked = isAchievementUnlocked(achievement);
                      return (
                        <TouchableOpacity
                          key={achievement.id}
                          style={styles.achievementItem}
                          onPress={() => handleAchievementPress(achievement)}
                        >
                          <View
                            style={[
                              styles.achievementIconContainer,
                              {
                                backgroundColor: isUnlocked
                                  ? colors.primary + "20"
                                  : colors.surfaceHighlight,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={achievement.icon}
                              size={28}
                              color={
                                isUnlocked
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                              style={{ opacity: isUnlocked ? 1 : 0.5 }}
                            />
                          </View>
                          <Text
                            style={[
                              styles.achievementTitle,
                              {
                                color: isUnlocked
                                  ? colors.text
                                  : colors.textSecondary,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {t.achievements[
                              achievement.id as keyof typeof t.achievements
                            ]?.title || achievement.id}
                          </Text>
                          <Text
                            style={[
                              styles.achievementDesc,
                              { color: colors.textSecondary },
                            ]}
                          >
                            -{achievement.targetCount} kg
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </Card>
            </View>
          </ScrollView>

          <Button
            title={t.profile.save}
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28, // Slightly reduced
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    marginLeft: 4,
    opacity: 0.8,
  },
  formGrid: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 44,
    justifyContent: "center",
  },
  sexSelector: {
    flexDirection: "row",
    height: 44,
  },
  sexOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  targetInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  achievementItem: {
    width: "25%",
    paddingHorizontal: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 10,
    textAlign: "center",
    opacity: 0.8,
  },
});
