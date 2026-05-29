import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Heart } from "lucide-react-native";
import { RootStackParamList } from "../navigation/types";
import { RECIPES } from "../data/recipes";
import { useAppState } from "../state/AppStateContext";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { COLORS, RADIUS } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeDetails">;

export function RecipeModal({ navigation, route }: Props) {
  const { recipeId } = route.params;
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const { savedRecipeIds, toggleSavedRecipe } = useAppState();
  const insets = useSafeAreaInsets();
  const [cancelPressed, setCancelPressed] = useState(false);
  const panResponder = useSwipeGestures({
    onSwipeDown: () => navigation.goBack(),
    threshold: 80,
  });

  if (!recipe) {
    return (
      <SafeAreaView style={styles.overlay} edges={["left", "right"]}>
        <View style={[styles.sheet, { marginTop: insets.top + 140 }]}> 
          <View style={styles.form}>
            <View style={styles.headerRow}>
              <Text style={styles.sheetTitle}>Recipe not found</Text>
              <Pressable onPress={() => navigation.goBack()} style={styles.cancel}>
                <X size={18} color="#c32626" strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isSaved = savedRecipeIds.includes(recipe.id);

  return (
    <SafeAreaView style={styles.overlay} edges={["left", "right"]} {...panResponder}>
      <View style={[styles.sheet, { marginTop: insets.top + 140 }]}>
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>{recipe.name}</Text>
            <Pressable
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("MainMenu", { transition: "back" }))}
              onPressIn={() => setCancelPressed(true)}
              onPressOut={() => setCancelPressed(false)}
              style={[styles.cancel, cancelPressed ? styles.cancelPressed : undefined]}
            >
              <X size={18} color={cancelPressed ? "#ffffff" : "#c32626"} strokeWidth={2.4} />
            </Pressable>
          </View>
          <Image source={{ uri: recipe.imageUri }} style={styles.image} />

          <View style={styles.metaRow}>
            <View style={styles.metaTagsRow}>
              <View style={[styles.tag, getDifficultyStyle(recipe.difficulty)]}>
                <Text style={[styles.tagText, { color: getDifficultyTextColor(recipe.difficulty) }]}>{recipe.difficulty}</Text>
              </View>
              <View style={[styles.tag]}>
                <Text style={styles.tagText}>{recipe.timeMinutes} min</Text>
              </View>
            </View>
            <Pressable
              onPress={() => toggleSavedRecipe(recipe.id)}
              style={({ pressed }) => [styles.saveButton, isSaved ? styles.saveButtonActive : undefined, pressed ? styles.pressed : undefined]}
            >
              <Heart
                size={18}
                color={isSaved ? COLORS.white : COLORS.primary}
                fill={isSaved ? COLORS.white : "transparent"}
                strokeWidth={2.4}
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.listItem}>- {ing}</Text>
          ))}

          <Text style={styles.sectionTitle}>Preparation</Text>
          <Text style={styles.paragraph}>{recipe.instructions}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function getDifficultyStyle(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return { backgroundColor: "#D4EDDA", borderColor: "#28A745" };
    case "medium":
      return { backgroundColor: "#FFF3CD", borderColor: "#FFC107" };
    case "hard":
      return { backgroundColor: "#F8D7DA", borderColor: "#DC3545" };
    default:
      return { backgroundColor: "#f5efe5", borderColor: "#e8decd" };
  }
}

function getDifficultyTextColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "#155724";
    case "medium":
      return "#856404";
    case "hard":
      return "#721C24";
    default:
      return "#564a37";
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.modal,
    borderTopRightRadius: RADIUS.modal,
    overflow: "hidden",
  },
  form: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  sheetTitle: {
    fontSize: 24,
    color: COLORS.primary,
    textTransform: "lowercase",
    fontWeight: "700",
    textAlign: "left",
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaTagsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  tag: {
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    textTransform: "lowercase",
    color: COLORS.white,
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
  sectionTitle: {
    marginTop: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "700",
    textTransform: "lowercase",
  },
  listItem: {
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  paragraph: {
    color: COLORS.textMuted,
  },
  cancel: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#c32626",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPressed: {
    backgroundColor: "#c32626",
    borderColor: "#c32626",
  },

  pressed: {
    opacity: 0.82,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.textMuted,
    opacity: 0.4,
  },
});
