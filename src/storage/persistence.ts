import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ingredient } from "../types/domain";

const STORAGE_KEY = "@refridge_state_v1";

export interface PersistedState {
  fridgeIngredients: Ingredient[];
  savedRecipeIds: string[];
}

export async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as PersistedState;
  } catch {
    return null;
  }
}

export async function savePersistedState(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failure in MVP.
  }
}
