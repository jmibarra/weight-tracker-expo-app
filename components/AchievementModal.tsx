import { Achievement } from "@/constants/Achievements";
import { useTheme } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring
} from "react-native-reanimated";
import { Button } from "./ui/Button";

interface AchievementModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementModal = ({
  visible,
  achievement,
  onClose,
}: AchievementModalProps) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
    } else {
      scale.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (!achievement) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.congratsText, { color: colors.primary }]}>
            ¡Felicidades!
          </Text>

          <Animated.View
            style={[
              styles.iconContainer,
              animatedStyle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <MaterialCommunityIcons
              name={achievement.icon}
              size={64}
              color={colors.primary}
            />
          </Animated.View>

          <Text style={[styles.title, { color: colors.text }]}>
            {achievement.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {achievement.description}
          </Text>

          <Button title="Continuar" onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    width: "100%",
  },
});
