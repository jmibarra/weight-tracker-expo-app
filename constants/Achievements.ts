import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
}

export const REGISTRY_ACHIEVEMENTS: Achievement[] = [
  {
    id: "records_1",
    title: "Primer Paso",
    description: "Registra tu primer peso",
    targetCount: 1,
    icon: "foot-print",
  },
  {
    id: "records_5",
    title: "Constancia",
    description: "5 registros realizados",
    targetCount: 5,
    icon: "calendar-check",
  },
  {
    id: "records_10",
    title: "Compromiso",
    description: "10 registros realizados",
    targetCount: 10,
    icon: "trophy-outline",
  },
  {
    id: "records_25",
    title: "Hábito",
    description: "25 registros realizados",
    targetCount: 25,
    icon: "medal-outline",
  },
  {
    id: "records_50",
    title: "Dedicación",
    description: "50 registros realizados",
    targetCount: 50,
    icon: "star-outline",
  },
  {
    id: "records_100",
    title: "Veterano",
    description: "100 registros realizados",
    targetCount: 100,
    icon: "crown-outline",
  },
  {
    id: "records_200",
    title: "Experto",
    description: "200 registros realizados",
    targetCount: 200,
    icon: "diamond-stone",
  },
  {
    id: "records_500",
    title: "Leyenda",
    description: "500 registros realizados",
    targetCount: 500,
    icon: "fire",
  },
];
