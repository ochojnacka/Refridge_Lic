import { Ingredient, Recipe } from "../types/domain";

export interface MissingIngredientWithSubstitute {
  ingredient: string;
  substitute?: string; // e.g., "any vegetable"
}

export interface RecipeRecommendation {
  recipe: Recipe;
  matchScore: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  missingIngredientsWithSubstitutes: MissingIngredientWithSubstitute[];
}

// Map ingredients to substitution types for intelligent recipe recommendations
// Separates functional cooking roles (fats, milk_products, cheeses) from storage categories
const INGREDIENT_SUBSTITUTION_TYPE: Record<string, string> = {
  // Fats and oils
  butter: "fats",
  cream: "fats",
  oil: "fats",
  "olive oil": "fats",
  "vegetable oil": "fats",

  // Milk products (liquid dairy)
  milk: "milk_products",
  yogurt: "milk_products",
  buttermilk: "milk_products",

  // Cheeses - general category
  cheese: "general_cheese",

  // Cheeses - hard/aged
  cheddar: "hard_cheese",
  mozzarella: "hard_cheese",
  feta: "hard_cheese",
  parmesan: "hard_cheese",

  // Cheeses - soft/creamy
  "cream cheese": "cream_cheese",
  mascarpone: "cream_cheese",
  ricotta: "cream_cheese",

  // Meats
  chicken: "meat",
  beef: "meat",
  pork: "meat",
  turkey: "meat",
  tuna: "meat",
  salmon: "meat",
  lamb: "meat",

  // Vegetables
  broccoli: "vegetables",
  tomato: "vegetables",
  lettuce: "vegetables",
  carrot: "vegetables",
  onion: "vegetables",
  garlic: "vegetables",
  spinach: "vegetables",
  cucumber: "vegetables",
  mushroom: "vegetables",
  avocado: "vegetables",

  // Fruits
  lemon: "fruits",
  apple: "fruits",
  strawberry: "fruits",
  banana: "fruits",

  // Eggs
  egg: "eggs",
  eggs: "eggs",

  // Grains and breads
  rice: "grains",
  pasta: "grains",
  bread: "grains",
  flour: "grains",
  ladyfinger: "grains",

  // Seasonings (not substitutable - essential for taste)
  salt: "seasonings",
  pepper: "seasonings",
  sugar: "seasonings",
  "cocoa powder": "seasonings",
  cinnamon: "seasonings",
  vanilla: "seasonings",
  "chocolate chips": "seasonings",

  // Custard (liquid dairy)
  custard: "milk_products",
};

// Substitution types that can be swapped with "any [type]" in recipe recommendations
const SUBSTITUTABLE_TYPES = new Set(["fats", "milk_products", "vegetables", "fruits", "meat", "general_cheese", "hard_cheese", "cream_cheese"]);

// Map plural/variant forms to canonical form
// Generate variants for all known ingredients + their plurals
const INGREDIENT_VARIANTS: Record<string, string[]> = {};

// Build variants map from INGREDIENT_SUBSTITUTION_TYPE
Object.keys(INGREDIENT_SUBSTITUTION_TYPE).forEach((ingredient) => {
  const singular = ingredient;
  const plural = ingredient.endsWith("y") ? ingredient.slice(0, -1) + "ies" : ingredient + "s";

  INGREDIENT_VARIANTS[singular] = INGREDIENT_VARIANTS[singular] || [];
  INGREDIENT_VARIANTS[plural] = INGREDIENT_VARIANTS[plural] || [];

  if (!INGREDIENT_VARIANTS[singular].includes(singular)) {
    INGREDIENT_VARIANTS[singular].push(singular);
  }
  if (!INGREDIENT_VARIANTS[singular].includes(plural)) {
    INGREDIENT_VARIANTS[singular].push(plural);
  }

  if (!INGREDIENT_VARIANTS[plural].includes(singular)) {
    INGREDIENT_VARIANTS[plural].push(singular);
  }
  if (!INGREDIENT_VARIANTS[plural].includes(plural)) {
    INGREDIENT_VARIANTS[plural].push(plural);
  }
});

// Special plural forms that don't follow standard rules
INGREDIENT_VARIANTS["egg"] = ["egg", "eggs"];
INGREDIENT_VARIANTS["eggs"] = ["egg", "eggs"];

export function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Generate plural and singular forms for a word
 */
function getPluralForms(word: string): string[] {
  const normalized = normalizeText(word);
  const forms = new Set<string>([normalized]);

  // Check if already have variant in INGREDIENT_VARIANTS
  if (INGREDIENT_VARIANTS[normalized]) {
    return INGREDIENT_VARIANTS[normalized];
  }

  // Generate common plural forms
  if (normalized.endsWith("y")) {
    forms.add(normalized.slice(0, -1) + "ies");
  } else if (normalized.endsWith("s") || normalized.endsWith("x") || normalized.endsWith("z")) {
    forms.add(normalized + "es");
  } else if (normalized.endsWith("ch") || normalized.endsWith("sh")) {
    forms.add(normalized + "es");
  } else {
    forms.add(normalized + "s");
  }

  // Also handle reverse: if word ends in 's', try removing it
  if (normalized.endsWith("ies")) {
    forms.add(normalized.slice(0, -3) + "y");
  } else if (normalized.endsWith("oes")) {
    forms.add(normalized.slice(0, -2));
  } else if (normalized.endsWith("ses") || normalized.endsWith("zes") || normalized.endsWith("xes")) {
    forms.add(normalized.slice(0, -2));
  } else if (normalized.endsWith("ches") || normalized.endsWith("shes")) {
    forms.add(normalized.slice(0, -2));
  } else if (normalized.endsWith("s") && !normalized.endsWith("ss")) {
    forms.add(normalized.slice(0, -1));
  }

  return Array.from(forms);
}

/**
 * Tokenize ingredient name into words, removing common modifiers like 'wraps', 'chopped', etc.
 */
function tokenizeIngredient(name: string): string[] {
  const normalized = normalizeText(name);
  const tokens = normalized.split(/\s+/).filter((token) => token.length > 0);

  // Remove common modifiers that don't indicate ingredient type
  // Includes: cooking methods, descriptors, adjectives, type specifiers
  const modifiers = new Set([
    // Cooking methods
    "wraps",
    "chopped",
    "sliced",
    "diced",
    "minced",
    "ground",
    "fresh",
    "frozen",
    "dried",
    "cooked",
    "raw",
    "roasted",
    "grilled",
    "steamed",
    "fried",
    "boiled",
    "baked",
    "organic",
    "free-range",
    "cage-free",
    
    // Descriptors & adjectives
    "dark",
    "light",
    "red",
    "white",
    "brown",
    "wild",
    "farmed",
    "sweet",
    "spicy",
    "hot",
    "cold",
    "soft",
    "hard",
    "thick",
    "thin",
    "whole",
    "half",
    "semi",
    
    // Type specifiers that modify the main ingredient
    "wheat",
    "rye",
    "oat",
    "rice",
    "multigrain",
    "whole-grain",
    "whole-wheat",
    "sourdough",
    "pumpernickel",
    "hamburger",
    "hot-dog",
    "artisan",
    "rustic",
    "duck",
    "chicken",
    "beef",
    "pork",
    "turkey",
    "lamb",
    "goat",
    "sharp",
    "mild",
    "aged",
    "greek",
    "italian",
    "french",
    "german",
    "mexican",
    "asian",
    "indian",
    "thai",
    "plain",
    "vanilla",
    "chocolate",
    "strawberry",
    "raspberry",
    "blueberry",
    "unsalted",
    "salted",
    "unsweetened",
    "sweetened",
    "low-fat",
    "full-fat",
    "skimmed",
    "greek",
  ]);

  return tokens.filter((token) => !modifiers.has(token));
}

/**
 * Check if a fridge ingredient matches a recipe ingredient
 * Handles partial matching (e.g., "tortilla wraps" contains "tortilla")
 * and variant forms (e.g., "egg" and "eggs" are equivalent)
 */
function ingredientMatches(fridgeIngredient: string, recipeIngredient: string): boolean {
  const fridgeNorm = normalizeText(fridgeIngredient);
  const recipeNorm = normalizeText(recipeIngredient);

  // Exact match
  if (fridgeNorm === recipeNorm) {
    return true;
  }

  // Check variant forms (e.g., egg/eggs)
  const fridgeTokens = tokenizeIngredient(fridgeIngredient);
  const recipeTokens = tokenizeIngredient(recipeIngredient);

  // If any token from fridge matches any token from recipe
  for (const fridgeToken of fridgeTokens) {
    for (const recipeToken of recipeTokens) {
      // Exact token match
      if (fridgeToken === recipeToken) {
        return true;
      }

      // Check plural/singular forms for any combination
      const fridgeForms = getPluralForms(fridgeToken);
      const recipeForms = getPluralForms(recipeToken);

      if (fridgeForms.some((form) => recipeForms.includes(form))) {
        return true;
      }
    }
  }

  return false;
}

export function getSubstituteForMissingIngredient(ingredientName: string): string | undefined {
  const normalized = normalizeText(ingredientName);
  
  // Check if directly in the map
  let substitutionType = INGREDIENT_SUBSTITUTION_TYPE[normalized];
  
  // If not found, try plural/singular forms
  if (!substitutionType) {
    const forms = getPluralForms(normalized);
    for (const form of forms) {
      if (INGREDIENT_SUBSTITUTION_TYPE[form]) {
        substitutionType = INGREDIENT_SUBSTITUTION_TYPE[form];
        break;
      }
    }
  }

  if (substitutionType && SUBSTITUTABLE_TYPES.has(substitutionType)) {
    // Format nicely: "milk_products" -> "any milk product", "fats" -> "any fat", "fruits" -> "any fruit"
    const formatted = substitutionType
      .replace(/_/g, " ")
      .replace(/s$/, ""); // Remove trailing 's' for singular: "vegetables" -> "vegetable", "fats" -> "fat"
    return `any ${formatted}`;
  }

  return undefined;
}

export function scoreRecipe(recipe: Recipe, fridgeIngredients: Ingredient[]): RecipeRecommendation {
  const fridgeNames = fridgeIngredients.map((ingredient) => ingredient.name);

  const matchedIngredients = recipe.ingredients.filter((recipeIngredient) =>
    fridgeNames.some((fridgeName) => ingredientMatches(fridgeName, recipeIngredient)),
  );

  const missingIngredients = recipe.ingredients.filter(
    (recipeIngredient) =>
      !fridgeNames.some((fridgeName) => ingredientMatches(fridgeName, recipeIngredient)),
  );

  const matchScore =
    recipe.ingredients.length === 0 ? 0 : Math.round((matchedIngredients.length / recipe.ingredients.length) * 100);

  const missingIngredientsWithSubstitutes: MissingIngredientWithSubstitute[] = missingIngredients.map((ingredient) => ({
    ingredient,
    substitute: getSubstituteForMissingIngredient(ingredient),
  }));

  return {
    recipe,
    matchScore,
    matchedIngredients,
    missingIngredients,
    missingIngredientsWithSubstitutes,
  };
}