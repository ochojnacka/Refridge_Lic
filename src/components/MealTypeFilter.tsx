import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MEAL_TYPES, MealType } from "../types/domain";
import { COLORS, RADIUS } from "../theme";

interface MealTypeFilterProps {
  selected: MealType[];
  onToggle: (meal: MealType) => void;
}

export function MealTypeFilter({ selected, onToggle }: MealTypeFilterProps) {
  return (
    <View style={styles.row}>
      {MEAL_TYPES.map((meal) => {
        const active = selected.includes(meal);

        return (
          <Pressable
            key={meal}
            onPress={() => onToggle(meal)}
            style={({ pressed }) => [
              styles.pill,
              active ? styles.pillActive : undefined,
              pressed ? styles.pillPressed : undefined,
            ]}
          >
            <Text style={[styles.pillText, active ? styles.pillTextActive : undefined]}>{meal}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.accentStrong,
    borderRadius: RADIUS.modal,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.background,
  },
  pillActive: {
    borderColor: COLORS.accentStrong,
    backgroundColor: COLORS.accentStrong,
  },
  pillPressed: {
    opacity: 0.8,
  },
  pillText: {
    color: COLORS.accentStrong,
    textTransform: "lowercase",
  },
  pillTextActive: {
    color: COLORS.white,
  },
});
