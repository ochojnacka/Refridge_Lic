import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadPersistedState, savePersistedState } from "../storage/persistence";
import { Ingredient, Unit, Category } from "../types/domain";

interface IngredientInput {
  name: string;
  quantity: number;
  unit: Unit;
  category?: Category;
  emoji?: string;
}

interface AppStateContextValue {
  hydrated: boolean;
  fridgeIngredients: Ingredient[];
  savedRecipeIds: string[];
  addIngredient: (input: IngredientInput) => void;
  updateIngredient: (id: string, input: IngredientInput) => void;
  removeIngredient: (id: string) => void;
  toggleSavedRecipe: (recipeId: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function createIngredientId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [fridgeIngredients, setFridgeIngredients] = useState<Ingredient[]>([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  useEffect(() => {
    async function hydrateState() {
      const persisted = await loadPersistedState();

      if (persisted) {
        setFridgeIngredients(persisted.fridgeIngredients ?? []);
        setSavedRecipeIds(persisted.savedRecipeIds ?? []);
      }

      setHydrated(true);
    }

    hydrateState();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    savePersistedState({ fridgeIngredients, savedRecipeIds });
  }, [hydrated, fridgeIngredients, savedRecipeIds]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      hydrated,
      fridgeIngredients,
      savedRecipeIds,
      addIngredient: (input) => {
        setFridgeIngredients((current) => [
          ...current,
          {
            id: createIngredientId(),
            name: input.name.trim(),
            quantity: input.quantity,
            unit: input.unit,
            category: input.category ?? "vegetables",
            emoji: input.emoji,
          },
        ]);
      },
      updateIngredient: (id, input) => {
        setFridgeIngredients((current) =>
          current.map((ingredient) =>
            ingredient.id === id
              ? {
                  ...ingredient,
                  name: input.name.trim(),
                  quantity: input.quantity,
                  unit: input.unit,
                  category: input.category ?? ingredient.category,
                  emoji: input.emoji ?? ingredient.emoji,
                }
              : ingredient,
          ),
        );
      },
      removeIngredient: (id) => {
        setFridgeIngredients((current) => current.filter((ingredient) => ingredient.id !== id));
      },
      toggleSavedRecipe: (recipeId) => {
        setSavedRecipeIds((current) => {
          if (current.includes(recipeId)) {
            return current.filter((id) => id !== recipeId);
          }

          return [...current, recipeId];
        });
      },
    }),
    [hydrated, fridgeIngredients, savedRecipeIds],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
