import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { styles } from "./profile.styles";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { WeightPickerDialog } from "@/components/WeightPickerDialog";
import { Achievement, ALL_ACHIEVEMENTS } from "@/constants/Achievements";
import { useTheme } from "@/context/ThemeContext";

import { useI18n } from "@/i18n/I18nContext";
import { SETTINGS_KEYS } from "@/constants/SettingsKeys";
import { useRepositories } from "@/hooks/useRepositories";

export default function ProfileScreen() {
  const { measurements: measurementsRepo, settings: settingsRepo } = useRepositories();
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
          const savedHeight = await settingsRepo.getSetting(SETTINGS_KEYS.HEIGHT);
          const savedSex = await settingsRepo.getSetting(SETTINGS_KEYS.SEX);
          const savedTarget = await settingsRepo.getSetting(SETTINGS_KEYS.TARGET_WEIGHT);

          if (savedHeight) setHeight(savedHeight);
          if (savedSex) setSex(savedSex as "M" | "F");
          if (savedTarget) setTargetWeight(savedTarget);

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
    }, [settingsRepo, measurementsRepo]),
  );

  const handleSave = async () => {
    if (!height) {
      Alert.alert(t.common.error, t.profile.validationHeight);
      return;
    }

    setLoading(true);
    try {
      await settingsRepo.setSetting(SETTINGS_KEYS.HEIGHT, height);
      await settingsRepo.setSetting(SETTINGS_KEYS.SEX, sex);
      if (targetWeight) {
        await settingsRepo.setSetting(SETTINGS_KEYS.TARGET_WEIGHT, targetWeight);
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
    // Extraer la traducción del logro y verificar que sea un objeto (no un string plano)
    const achievementTranslation = t.achievements[achievement.id as keyof typeof t.achievements];
    const isTranslationObject = typeof achievementTranslation === 'object' && achievementTranslation !== null;
    const title = isTranslationObject ? achievementTranslation.title : achievement.id;
    const description = isTranslationObject ? achievementTranslation.description : "";

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
                <FlatList
                  data={ALL_ACHIEVEMENTS.filter((a) => a.type === "registry")}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  scrollEnabled={false}
                  columnWrapperStyle={{ marginHorizontal: -8 }}
                  renderItem={({ item: achievement }) => {
                    const isUnlocked = isAchievementUnlocked(achievement);
                    return (
                      <TouchableOpacity
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
                              isUnlocked ? colors.primary : colors.textSecondary
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
                          {(() => {
                            const val =
                              t.achievements[
                                achievement.id as keyof typeof t.achievements
                              ];
                            return typeof val === "object"
                              ? val.title
                              : achievement.id;
                          })()}
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
                  }}
                />
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
                <FlatList
                  data={ALL_ACHIEVEMENTS.filter((a) => a.type === "weight_loss")}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  scrollEnabled={false}
                  columnWrapperStyle={{ marginHorizontal: -8 }}
                  renderItem={({ item: achievement }) => {
                    const isUnlocked = isAchievementUnlocked(achievement);
                    return (
                      <TouchableOpacity
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
                              isUnlocked ? colors.primary : colors.textSecondary
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
                          {(() => {
                            const val =
                              t.achievements[
                                achievement.id as keyof typeof t.achievements
                              ];
                            return typeof val === "object"
                              ? val.title
                              : achievement.id;
                          })()}
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
                  }}
                />
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
