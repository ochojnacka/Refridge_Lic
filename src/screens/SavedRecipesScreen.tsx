import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState, useRef } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "../components/Layout";
import { MealTypeFilter } from "../components/MealTypeFilter";
import { RecipeCard } from "../components/RecipeCard";
import { RECIPES } from "../data/recipes";
import { RootStackParamList } from "../navigation/types";
import { useAppState } from "../state/AppStateContext";
import { useHeaderConfig } from "../navigation/RootNavigator";
import { MealType } from "../types/domain";
import { ArrowUp } from "lucide-react-native";
import { COLORS, SHADOW } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "SavedRecipes">;

export function SavedRecipesScreen({ navigation }: Props) {
  const { savedRecipeIds, toggleSavedRecipe } = useAppState();
  const { setConfig } = useHeaderConfig();
  const insets = useSafeAreaInsets();
  const [selectedMeals, setSelectedMeals] = useState<MealType[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isFirstFocusRef = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      setConfig({
        title: "Saved recipes",
        onBack: () => navigation.goBack(),
      });
      
      // Replay animations on screen focus (but skip first mount)
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
      } else {
        setAnimationKey(k => k + 1);
      }
    }, [navigation, setConfig])
  );

  const savedRecipes = useMemo(() => RECIPES.filter((recipe) => savedRecipeIds.includes(recipe.id)), [savedRecipeIds]);

  const filteredRecipes = useMemo(() => {
    if (selectedMeals.length === 0) {
      return savedRecipes;
    }

    return savedRecipes.filter((recipe) => selectedMeals.some((meal) => recipe.mealTypes.includes(meal)));
  }, [savedRecipes, selectedMeals]);

  function toggleMealType(meal: MealType) {
    setSelectedMeals((current) =>
      current.includes(meal) ? current.filter((item) => item !== meal) : [...current, meal],
    );
  }

  return (
    <>
      <ScreenContainer
        footer={
          <View style={styles.scrollToTopContainer}>
            {scrollY > 200 && (
              <Pressable
                onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                style={styles.scrollToTopButtonFooter}
              >
                <ArrowUp size={20} color={COLORS.white} strokeWidth={2.4} />
              </Pressable>
            )}
          </View>
        }
        scrollBottomInset={60}
        onScrollCallback={setScrollY}
        scrollViewRef={scrollViewRef}
      >

        <MealTypeFilter selected={selectedMeals} onToggle={toggleMealType} />

        <View style={styles.listContainer}>
          {filteredRecipes.length === 0 ? (
            <Text style={styles.empty}>No saved recipes for selected filters.</Text>
          ) : (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={`${recipe.id}-${animationKey}`}
                recipe={recipe}
                saved={savedRecipeIds.includes(recipe.id)}
                onToggleSaved={toggleSavedRecipe}
                onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id })}
              />
            ))
          )}
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 14,
  },
  empty: {
    color: COLORS.textSoft,
    fontSize: 15,
  },
  scrollToTopContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollToTopButtonFooter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.soft,
  },
});
