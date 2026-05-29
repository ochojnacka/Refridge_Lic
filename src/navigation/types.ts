export type RootStackParamList = {
  Landing: undefined;
  MainMenu: { transition?: "forward" | "back" } | undefined;
  YourFridge: { transition?: "forward" | "back" } | undefined;
  FindRecipe: { transition?: "forward" | "back" } | undefined;
  SavedRecipes: { transition?: "forward" | "back" } | undefined;
  AddToFridge: undefined;
  RecipeDetails: { recipeId: string; transition?: "forward" | "back" };
};
