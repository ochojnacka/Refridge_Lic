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
import { scoreRecipe } from "../utils/recipeMatching";
import { ArrowUp } from "lucide-react-native";
import { COLORS, SHADOW } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "FindRecipe">;

export function FindRecipeScreen({ navigation }: Props) {
  const { fridgeIngredients, savedRecipeIds, toggleSavedRecipe } = useAppState();
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
        title: "Find a recipe",
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

  useFocusEffect(
    React.useCallback(() => {
      // Reset filters and scroll position when screen comes into focus
      setSelectedMeals([]);
      setScrollY(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const matchingRecipes = useMemo(() => {
    return RECIPES.map((recipe) => scoreRecipe(recipe, fridgeIngredients))
      .filter(({ recipe, matchScore }) => {
        const mealMatch = selectedMeals.length === 0 || selectedMeals.some((meal) => recipe.mealTypes.includes(meal));

        return mealMatch && matchScore > 0;
      })
      .sort((left, right) => {
        if (right.matchScore !== left.matchScore) {
          return right.matchScore - left.matchScore;
        }

        if (left.missingIngredients.length !== right.missingIngredients.length) {
          return left.missingIngredients.length - right.missingIngredients.length;
        }

        return left.recipe.timeMinutes - right.recipe.timeMinutes;
      });
  }, [fridgeIngredients, selectedMeals]);

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

        <Text style={styles.question}>what meal do you fancy?</Text>
        <MealTypeFilter selected={selectedMeals} onToggle={toggleMealType} />

        <Text style={styles.matchingTitle}>best matches from your fridge</Text>
        <View style={styles.list}>
          {matchingRecipes.length === 0 ? (
            <Text style={styles.empty}>No partial matches yet. Add ingredients to see recommendations.</Text>
          ) : (
            matchingRecipes.map(({ recipe, matchScore, missingIngredientsWithSubstitutes }) => (
              <RecipeCard
                key={`${recipe.id}-${animationKey}`}
                recipe={recipe}
                saved={savedRecipeIds.includes(recipe.id)}
                onToggleSaved={toggleSavedRecipe}
                onPress={() => navigation.navigate("RecipeDetails", { recipeId: recipe.id })}
                matchScore={matchScore}
                missingIngredientsWithSubstitutes={missingIngredientsWithSubstitutes}
              />
            ))
          )}
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  question: {
    color: COLORS.primary,
    fontSize: 19,
    marginBottom: 10,
    textTransform: "lowercase",
  },
  matchingTitle: {
    marginTop: 18,
    marginBottom: 10,
    color: COLORS.primary,
    fontSize: 19,
    textTransform: "lowercase",
  },
  list: {
    marginTop: 2,
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
