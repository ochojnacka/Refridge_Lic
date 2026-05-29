import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Category } from "../types/domain";
import { COLORS, RADIUS } from "../theme";

interface CategoryFilterProps {
  categories: Category[];
  selected: Category[];
  emojiMap: Record<string, string>;
  onToggle: (category: Category) => void;
}

export function CategoryFilter({ categories, selected, emojiMap, onToggle }: CategoryFilterProps) {
  return (
    <View style={styles.row}>
      {categories.map((category) => {
        const active = selected.includes(category);
        const emoji = emojiMap[category] || "✨";

        return (
          <Pressable
            key={category}
            onPress={() => onToggle(category)}
            style={({ pressed }) => [
              styles.pill,
              active ? styles.pillActive : undefined,
              pressed ? styles.pillPressed : undefined,
            ]}
          >
            <Text style={styles.pillEmoji}>{emoji}</Text>
            <Text style={[styles.pillText, active ? styles.pillTextActive : undefined]}>{category}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillActive: {
    borderColor: COLORS.accentStrong,
    backgroundColor: COLORS.accentStrong,
  },
  pillPressed: {
    opacity: 0.8,
  },
  pillEmoji: {
    fontSize: 18,
  },
  pillText: {
    color: COLORS.accentStrong,
    textTransform: "lowercase",
    fontWeight: "400",
  },
  pillTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
