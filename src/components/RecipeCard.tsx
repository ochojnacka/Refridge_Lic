import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { Heart } from "lucide-react-native";
import { Recipe } from "../types/domain";
import { MissingIngredientWithSubstitute } from "../utils/recipeMatching";
import { COLORS, RADIUS, SHADOW } from "../theme";

interface RecipeCardProps {
  recipe: Recipe;
  saved: boolean;
  onToggleSaved: (recipeId: string) => void;
  onPress?: () => void;
  matchScore?: number;
  missingIngredientsWithSubstitutes?: MissingIngredientWithSubstitute[];
}

const DIFFICULTY_STYLES: Record<string, { backgroundColor: string; borderColor: string; textColor: string }> = {
  easy: { backgroundColor: "#D4EDDA", borderColor: "#28A745", textColor: "#155724" },
  medium: { backgroundColor: "#FFF3CD", borderColor: "#FFC107", textColor: "#856404" },
  hard: { backgroundColor: "#F8D7DA", borderColor: "#DC3545", textColor: "#721C24" },
};

function getDifficultyStyle(difficulty: string) {
  const key = difficulty.toLowerCase();
  return DIFFICULTY_STYLES[key] || DIFFICULTY_STYLES.easy;
}

export function RecipeCard({ recipe, saved, onToggleSaved, onPress, matchScore, missingIngredientsWithSubstitutes }: RecipeCardProps) {
  const { backgroundColor, borderColor, textColor } = getDifficultyStyle(recipe.difficulty);

  const missingDetails = missingIngredientsWithSubstitutes?.map((item) =>
    item.substitute ? `${item.ingredient} (substitute: ${item.substitute})` : item.ingredient
  );

  return (
    <Animated.View entering={FadeInDown.springify()} exiting={FadeOut}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.buttonPressed : undefined]}>
        <Image source={{ uri: recipe.imageUri }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{recipe.name}</Text>
            <Pressable
              onPress={() => onToggleSaved(recipe.id)}
              style={({ pressed }) => [styles.saveButton, saved ? styles.saveButtonActive : undefined, pressed ? styles.buttonPressed : undefined]}
            >
              <Heart
                size={18}
                color={saved ? COLORS.white : COLORS.primary}
                fill={saved ? COLORS.white : "transparent"}
                strokeWidth={2.4}
              />
            </Pressable>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.tag, { backgroundColor, borderColor }]}>
              <Text style={[styles.tagText, { color: textColor }]}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{recipe.timeMinutes} min</Text>
            </View>
            {typeof matchScore === "number" && (
              <View style={[styles.tag, styles.matchTag]}>
                <Text style={styles.matchTagText}>{matchScore}% match</Text>
              </View>
            )}
          </View>
          {missingIngredientsWithSubstitutes && missingIngredientsWithSubstitutes.length > 0 && (
            <Text style={styles.matchDetails}>missing: {missingDetails?.join(", ")}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    marginBottom: 12,
    overflow: "hidden",
    ...SHADOW.soft,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#f3f3f3",
  },
  content: {
    padding: 12,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    fontSize: 18,
    color: COLORS.primary,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    borderRadius: 30,
    backgroundColor: COLORS.accentStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    textTransform: "lowercase",
    color: COLORS.white,
  },
  matchTag: {
    backgroundColor: COLORS.primary,
  },
  matchTagText: {
    textTransform: "lowercase",
    color: COLORS.surfaceWarm,
  },
  matchDetails: {
    color: COLORS.textSoft,
    fontSize: 13,
    textTransform: "lowercase",
  },
  saveButton: {
    alignSelf: "flex-start",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonActive: {
    backgroundColor: COLORS.primary,
  },

  buttonPressed: {
    opacity: 0.82,
  },
});
