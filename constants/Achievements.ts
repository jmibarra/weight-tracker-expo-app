import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export interface Achievement {
  id: string;
  targetCount: number;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
}

export const REGISTRY_ACHIEVEMENTS: Achievement[] = [
  {
    id: "records_1",
    targetCount: 1,
    icon: "foot-print",
  },
  {
    id: "records_5",
    targetCount: 5,
    icon: "calendar-check",
  },
  {
    id: "records_10",
    targetCount: 10,
    icon: "trophy-outline",
  },
  {
    id: "records_25",
    targetCount: 25,
    icon: "medal-outline",
  },
  {
    id: "records_50",
    targetCount: 50,
    icon: "star-outline",
  },
  {
    id: "records_100",
    targetCount: 100,
    icon: "crown-outline",
  },
  {
    id: "records_200",
    targetCount: 200,
    icon: "diamond-stone",
  },
  {
    id: "records_500",
    targetCount: 500,
    icon: "fire",
  },
];
