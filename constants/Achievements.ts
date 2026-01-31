import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export interface Achievement {
  id: string;
  targetCount: number; // For registry achievements, this is the number of records. For weight loss, this is kg lost.
  type: "registry" | "weight_loss";
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
}

export const REGISTRY_ACHIEVEMENTS: Achievement[] = [
  {
    id: "records_1",
    targetCount: 1,
    type: "registry",
    icon: "foot-print",
  },
  {
    id: "records_5",
    targetCount: 5,
    type: "registry",
    icon: "calendar-check",
  },
  {
    id: "records_10",
    targetCount: 10,
    type: "registry",
    icon: "trophy-outline",
  },
  {
    id: "records_25",
    targetCount: 25,
    type: "registry",
    icon: "medal-outline",
  },
  {
    id: "records_50",
    targetCount: 50,
    type: "registry",
    icon: "star-outline",
  },
  {
    id: "records_100",
    targetCount: 100,
    type: "registry",
    icon: "crown-outline",
  },
  {
    id: "records_200",
    targetCount: 200,
    type: "registry",
    icon: "diamond-stone",
  },
  {
    id: "records_500",
    targetCount: 500,
    type: "registry",
    icon: "fire",
  },
];

export const WEIGHT_LOSS_ACHIEVEMENTS: Achievement[] = [
  { id: "loss_1", targetCount: 1, type: "weight_loss", icon: "feather" },
  { id: "loss_3", targetCount: 3, type: "weight_loss", icon: "speedometer" }, // or something indicating progress
  { id: "loss_5", targetCount: 5, type: "weight_loss", icon: "dumbbell" },
  { id: "loss_10", targetCount: 10, type: "weight_loss", icon: "fire" },
  {
    id: "loss_20",
    targetCount: 20,
    type: "weight_loss",
    icon: "rocket-launch",
  },
  {
    id: "loss_30",
    targetCount: 30,
    type: "weight_loss",
    icon: "star-four-points",
  },
  { id: "loss_40", targetCount: 40, type: "weight_loss", icon: "crown" },
];

export const ALL_ACHIEVEMENTS = [
  ...REGISTRY_ACHIEVEMENTS,
  ...WEIGHT_LOSS_ACHIEVEMENTS,
];
