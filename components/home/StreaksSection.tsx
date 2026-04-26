import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n/I18nContext";

interface StreaksSectionProps {
  streaks: {
    currentStreak: number;
    longestStreak: number;
    longestStreakEndDate: string | null;
  };
}

export function StreaksSection({ streaks }: StreaksSectionProps) {
  const { colors } = useTheme();
  const { t, formatDate } = useI18n();

  return (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
      <Card
        style={{
          flex: 1,
          padding: 12,
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={colors.primary}
          />
        </View>
        <View>
          <Text
            style={{
              fontSize: 11,
              color: colors.textSecondary,
              fontWeight: "600",
            }}
          >
            {t.streaks.current}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
              }}
            >
              {streaks.currentStreak}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              {t.streaks.days}
            </Text>
          </View>
          {streaks.currentStreak >= streaks.longestStreak &&
            streaks.currentStreak > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -20,
                  right: -40,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {t.streaks.record}
                </Text>
              </View>
            )}
        </View>
      </Card>

      <Card
        style={{
          flex: 1,
          padding: 12,
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#FFD70020",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
        </View>
        <View>
          <Text
            style={{
              fontSize: 11,
              color: colors.textSecondary,
              fontWeight: "600",
            }}
          >
            {t.streaks.longest}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
              }}
            >
              {streaks.longestStreak}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
              {t.streaks.days}
            </Text>
          </View>
          {streaks.longestStreakEndDate && (
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {formatDate(streaks.longestStreakEndDate)}
            </Text>
          )}
        </View>
      </Card>
    </View>
  );
}
