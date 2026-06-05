// src/types/domain.ts

// 1. Zaktualizowane jednostki miary (zgodnie z InventoryScreen)
export type Unit = "kg" | "g" | "l" | "ml" | "pcs" | "box" | "bundle";

// 2. Profesjonalne kategorie magazynowe
export type Category = "VEGETABLES" | "MEAT" | "DAIRY" | "SPICES" | "PANTRY" | "FROZEN" | "BEVERAGES" | "OTHER";

export const UNITS: Unit[] = ["kg", "g", "l", "ml", "pcs", "box", "bundle"];
export const CATEGORIES: Category[] = ["VEGETABLES", "MEAT", "DAIRY", "SPICES", "PANTRY", "FROZEN", "BEVERAGES", "OTHER"];

// 3. Pozycja Magazynowa (zastępuje dawny Ingredient)
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  costPrice: number; // Kluczowe do wyliczania strat i marży
  category: Category;
}

// 4. Typy dla nowego WasteLoggingScreen (z Twojego planu DEN 2-3)
export type WasteReason = 'Expired' | 'Damaged' | 'Over-production' | 'Other';

export interface WasteLog {
  id: string;
  itemId: string;
  quantity: number;
  unit: Unit;
  reason: WasteReason;
  estimatedCost: number; // Wyliczane: quantity * costPrice
  timestamp: string;
}

// 5. Zaktualizowana Receptura (pod kątem kalkulacji B2B)
export interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{
    inventoryItemId: string;
    quantity: number;
    unit: Unit;
  }>;
  instructions: string;
  sellingPrice?: number; // Cena w menu (do wyliczania marży)
}

// 6. Typ Sugestii Menu (odpowiada strukturze z MenuSuggestionsScreen)
export interface MenuSuggestion {
  recipeId?: string;
  recipeName: string;
  score: number;
  inventoryScore: number;
  demandScore: number;
  marginScore: number;
  estimatedProfit: number;
  recommendedQuantity: number;
  reasons: string[];
}