export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export type Difficulty = "easy" | "medium" | "hard";

export type Unit = "pc" | "g" | "kg" | "ml" | "l";

export type Category = string;

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  emoji?: string; // optional per-ingredient custom emoji
}

export const CATEGORY_EMOJI: Record<string, string> = {
  meat: "🥩",
  vegetables: "🥬",
  dairy: "🧈",
  cheese: "🧀",
  eggs: "🥚",
};

export const CATEGORIES: string[] = ["meat", "vegetables", "dairy", "cheese", "eggs"];

export interface Recipe {
  id: string;
  name: string;
  imageUri: string;
  mealTypes: MealType[];
  difficulty: Difficulty;
  timeMinutes: number;
  ingredients: string[];
  instructions: string;
}

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];

export const UNITS: Unit[] = ["pc", "g", "kg", "ml", "l"];
