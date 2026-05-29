import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState, useRef, useCallback } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, findNodeHandle, Keyboard } from "react-native";
import Reanimated, { FadeInLeft } from "react-native-reanimated";
import { Plus, Menu, Trash2, X, ArrowUp, ArrowDown } from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "../components/Layout";
import { RootStackParamList } from "../navigation/types";
import { useAppState } from "../state/AppStateContext";
import { useHeaderConfig } from "../navigation/RootNavigator";
import { UNITS, Unit, CATEGORIES, CATEGORY_EMOJI, Category } from "../types/domain";
import { COLORS, RADIUS, SHADOW } from "../theme";
import { EmojiPicker } from "../components/EmojiPicker";
import { CategoryFilter } from "../components/CategoryFilter";

type Props = NativeStackScreenProps<RootStackParamList, "YourFridge">;

type EditDraft = {
  name: string;
  quantity: string;
  unit: Unit;
  category?: string;
  emoji?: string;
  customName?: string;
};

type SortBy = "name" | "category" | "quantity";
type SortDirection = "asc" | "desc";

const UNIT_WEIGHTS: Record<Unit, number> = {
  kg: 1000,
  l: 1000,
  g: 1,
  ml: 1,
  pc: 0.001,
};

function getQuantityValue(quantity: number, unit: Unit): number {
  return quantity * UNIT_WEIGHTS[unit];
}

function parseQuantity(value: string): number {
  return Number(value.replace(",", "."));
}

export function YourFridgeScreen({ navigation }: Props) {
  const { fridgeIngredients, updateIngredient, removeIngredient } = useAppState();
  const { setConfig } = useHeaderConfig();
  const insets = useSafeAreaInsets();
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, EditDraft>>({});
  const [scrollY, setScrollY] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const isFirstFocusRef = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      setConfig({
        title: "Your fridge",
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

  const sortedIngredients = useMemo(
    () => {
      let filtered = [...fridgeIngredients].sort((a, b) => {
        let result: number;

        switch (sortBy) {
          case "name":
            result = a.name.localeCompare(b.name);
            break;
          case "category":
            result = a.category.localeCompare(b.category);
            break;
          case "quantity": {
            const aValue = getQuantityValue(a.quantity, a.unit);
            const bValue = getQuantityValue(b.quantity, b.unit);
            result = aValue - bValue;
            break;
          }
          default:
            result = 0;
        }

        return sortDirection === "asc" ? result : -result;
      });

      if (selectedCategories.length > 0) {
        filtered = filtered.filter((ingredient) => {
          const ingredientCategory = ingredient.category;
          return selectedCategories.includes(ingredientCategory as Category);
        });
      }

      return filtered;
    },
    [fridgeIngredients, selectedCategories, sortBy, sortDirection],
  );

  const availableCategories = useMemo(
    () => {
      const uniqueCategories = new Set<Category>();
      
      // Add standard categories that have ingredients
      CATEGORIES.forEach((cat) => {
        if (fridgeIngredients.some((ing) => ing.category === cat)) {
          uniqueCategories.add(cat);
        }
      });
      
      // Add custom categories (those not in standard CATEGORIES)
      fridgeIngredients.forEach((ingredient) => {
        if (ingredient.category && !CATEGORIES.includes(ingredient.category as any)) {
          uniqueCategories.add(ingredient.category as Category);
        }
      });
      
      // Convert to array: standard categories first, then custom alphabetically
      const standardCats = CATEGORIES.filter((cat) => uniqueCategories.has(cat));
      const customCats = Array.from(uniqueCategories)
        .filter((cat) => !CATEGORIES.includes(cat as any))
        .sort();
      
      return [...standardCats, ...customCats];
    },
    [fridgeIngredients],
  );

  const categoryEmojiMap = useMemo(
    () => {
      const map: Record<string, string> = { ...CATEGORY_EMOJI };
      
      // For each ingredient, if it has a custom category, use its emoji
      fridgeIngredients.forEach((ingredient) => {
        if (ingredient.category && !CATEGORIES.includes(ingredient.category as any)) {
          // This is a custom category - use the ingredient's emoji if available
          if (ingredient.emoji && !map[ingredient.category]) {
            map[ingredient.category] = ingredient.emoji;
          }
        }
      });
      
      return map;
    },
    [fridgeIngredients],
  );

  function startEditing() {
    const nextDrafts: Record<string, EditDraft> = {};

    for (const ingredient of sortedIngredients) {
      // Determine if this is a custom category (not in standard CATEGORIES and not empty)
      const isCustomCategory = ingredient.category && ingredient.category !== "" && !CATEGORIES.includes(ingredient.category as any);

      nextDrafts[ingredient.id] = {
        name: ingredient.name,
        quantity: String(ingredient.quantity),
        unit: ingredient.unit,
        category: isCustomCategory ? "" : ingredient.category,
        emoji: ingredient.emoji,
        customName: isCustomCategory ? ingredient.category : "",
      };
    }

    setDrafts(nextDrafts);
    setEditMode(true);
  }

  function finishEditing() {
    for (const ingredient of sortedIngredients) {
      const draft = drafts[ingredient.id];

      if (!draft) {
        continue;
      }

      const quantity = parseQuantity(draft.quantity);

      if (!draft.name.trim() || !Number.isFinite(quantity) || quantity <= 0) {
        continue;
      }

      const payload: any = {
        name: draft.name,
        quantity,
        unit: draft.unit,
        category: draft.category,
      };

      // Set emoji: use CATEGORY_EMOJI if available, otherwise use draft.emoji (for custom)
      payload.emoji = CATEGORY_EMOJI[draft.category as keyof typeof CATEGORY_EMOJI] || draft.emoji || "";

      // If category is custom (empty string), use customName as category
      if (draft.category === "" && draft.customName?.trim()) {
        payload.category = draft.customName.trim();
        payload.emoji = draft.emoji || "";
      }

      updateIngredient(ingredient.id, payload);
    }

    setEditMode(false);
  }

  function updateDraft(id: string, patch: Partial<EditDraft>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  }

  function scrollInputIntoView(id: string) {
    const input = inputRefs.current[id];
    const scrollResponder = scrollViewRef.current?.getScrollResponder?.();
    const nativeHandle = input ? findNodeHandle(input) : null;

    if (!scrollResponder || nativeHandle == null) {
      return;
    }

    requestAnimationFrame(() => {
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(nativeHandle, 140, true);
    });
  }

  function toggleCategory(category: Category) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  return (
    <>
      <ScreenContainer
        scroll={false}
        footer={
          <SafeAreaView style={styles.bottomButtons} edges={["left", "right", "bottom"]}>
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
        </SafeAreaView>
      }
      swipeResponder={undefined}
    >
      <View style={styles.contentWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={true}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        >
          {!editMode && (
            <>
              <Text style={styles.filterLabel}>Filter by category</Text>
              <CategoryFilter categories={availableCategories} selected={selectedCategories} emojiMap={categoryEmojiMap} onToggle={toggleCategory} />
              <Text style={styles.filterLabel}>Sort by</Text>
              <View style={styles.sortPillsRow}>
                {(["name", "category", "quantity"] as const).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (sortBy === option) {
                        // Toggle direction on same pill
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                      } else {
                        // New pill - set to ascending
                        setSortBy(option);
                        setSortDirection("asc");
                      }
                    }}
                    style={({ pressed }) => [
                      styles.sortPill,
                      sortBy === option ? styles.sortPillActive : undefined,
                      pressed ? styles.sortPillPressed : undefined,
                    ]}
                  >
                    <View style={styles.sortPillContent}>
                      {sortBy === option && sortDirection === "asc" ? (
                        <ArrowUp size={16} color={COLORS.white} strokeWidth={2.4} />
                      ) : sortBy === option && sortDirection === "desc" ? (
                        <ArrowDown size={16} color={COLORS.white} strokeWidth={2.4} />
                      ) : (
                        <ArrowUp size={16} color={COLORS.accentStrong} strokeWidth={2.4} />
                      )}
                      <Text style={[styles.sortPillText, sortBy === option ? [styles.sortPillTextActive, { color: COLORS.white }] : { color: COLORS.accentStrong }]}>{option}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {sortedIngredients.length === 0 ? (
            <Text style={styles.emptyText}>No ingredients yet. Tap the add button to add your first item.</Text>
          ) : (
            <View style={styles.list}>
              {sortedIngredients.map((ingredient, index) => {
                const draft = drafts[ingredient.id];

                if (!editMode) {
                  return (
                    <Reanimated.View key={`${ingredient.id}-${animationKey}`} entering={FadeInLeft.delay(index * 50)}>
                      <View style={styles.itemRow}>
                        <Text style={styles.itemEmoji}>{ingredient.emoji ?? CATEGORY_EMOJI[ingredient.category]}</Text>
                        <Text style={styles.itemName}>{ingredient.name}</Text>
                        <Text style={styles.itemMeta}>
                          {ingredient.quantity}{ingredient.unit}
                        </Text>
                      </View>
                    </Reanimated.View>
                  );
                }

                const nameRefKey = `${ingredient.id}:name`;
                const quantityRefKey = `${ingredient.id}:quantity`;
                const customCategoryRefKey = `${ingredient.id}:custom`;

                return (
                  <Reanimated.View key={`${ingredient.id}-${animationKey}`} entering={editMode ? undefined : FadeInLeft.delay(index * 50)}>
                    <View style={styles.editCard}>
                          <View style={styles.fieldRow}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                              ref={(input) => {
                                inputRefs.current[nameRefKey] = input;
                              }}
                              value={draft?.name ?? ingredient.name}
                              onChangeText={(text) => updateDraft(ingredient.id, { name: text })}
                              style={styles.input}
                              placeholder="Name"
                              onFocus={() => scrollInputIntoView(nameRefKey)}
                            />
                          </View>

                          <View style={styles.fieldRow}>
                            <Text style={styles.label}>Quantity</Text>
                            <TextInput
                              ref={(input) => {
                                inputRefs.current[quantityRefKey] = input;
                              }}
                              value={draft?.quantity ?? String(ingredient.quantity)}
                              onChangeText={(text) => updateDraft(ingredient.id, { quantity: text })}
                              style={styles.input}
                              keyboardType="decimal-pad"
                              placeholder="Quantity"
                              onFocus={() => scrollInputIntoView(quantityRefKey)}
                            />
                          </View>

                          <View style={styles.unitField}>
                            <Text style={styles.label}>Unit</Text>
                            <View style={styles.unitRow}>
                              {UNITS.map((unit) => {
                                const selected = (draft?.unit ?? ingredient.unit) === unit;

                                return (
                                  <Pressable
                                    key={`${ingredient.id}-${unit}`}
                                    onPress={() => updateDraft(ingredient.id, { unit })}
                                    style={({ pressed }) => [
                                      styles.unitPill,
                                      selected ? styles.unitPillSelected : undefined,
                                      pressed ? styles.pressed : undefined,
                                    ]}
                                  >
                                    <Text style={[styles.unitPillText, selected ? styles.unitPillTextSelected : undefined]}>
                                      {unit}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                            </View>
                          </View>

                          <View style={styles.categoryField}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoryRow}>
                              {CATEGORIES.map((cat) => {
                                const selected = (draft?.category ?? ingredient.category) === cat;

                                return (
                                  <Pressable
                                    key={`${ingredient.id}-${cat}`}
                                    onPress={() => updateDraft(ingredient.id, { category: cat, emoji: "", customName: cat })}
                                    style={({ pressed }) => [
                                      styles.categoryPill,
                                      selected ? styles.categoryPillSelected : undefined,
                                      pressed ? styles.pressed : undefined,
                                    ]}
                                  >
                                    <Text style={styles.categoryEmoji}>{CATEGORY_EMOJI[cat]}</Text>
                                    <Text style={[styles.categoryPillText, selected ? styles.categoryPillTextSelected : undefined]}>{cat}</Text>
                                  </Pressable>
                                );
                              })}
                              <Pressable
                                onPress={() => updateDraft(ingredient.id, { category: "", emoji: "", customName: "" })}
                                style={({ pressed }) => [
                                  styles.categoryPill,
                                  (draft?.category ?? ingredient.category) === "" ? styles.categoryPillSelected : undefined,
                                  pressed ? styles.pressed : undefined,
                                ]}
                              >
                                <Text style={styles.categoryEmoji}>✨</Text>
                                <Text style={[styles.categoryPillText, (draft?.category ?? ingredient.category) === "" ? styles.categoryPillTextSelected : undefined]}>custom</Text>
                              </Pressable>
                            </View>
                          </View>

                          {(draft?.category ?? ingredient.category) === "" ? (
                            <View 
                              style={[styles.field, { marginLeft: 0, marginTop: 8 }]}
                              onStartShouldSetResponder={() => true}
                            >
                              <Text style={styles.label}>Custom</Text>
                              <EmojiPicker 
                                selectedEmoji={draft?.emoji ?? ingredient.emoji ?? ""} 
                                onSelectEmoji={(emoji) => updateDraft(ingredient.id, { emoji })}
                                topOffset={insets.top + 215}
                              />
                              <TextInput
                                ref={(input) => {
                                  inputRefs.current[customCategoryRefKey] = input;
                                }}
                                placeholder="e.g. fruits"
                                value={draft?.customName ?? ingredient.category}
                                onChangeText={(text) => updateDraft(ingredient.id, { customName: text })}
                                style={styles.input}
                                editable={true}
                              />
                            </View>
                          ) : null}

                        <Pressable
                          onPress={() => removeIngredient(ingredient.id)}
                          style={({ pressed }) => [
                            styles.deleteButton,
                            pressed ? styles.deleteButtonPressed : undefined,
                          ]}
                        >
                          {({ pressed }) => (
                            <Trash2 size={18} color={pressed ? "#ffffff" : "#c32626"} strokeWidth={2.4} />
                          )}
                        </Pressable>
                        </View>
                  </Reanimated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
    <View style={[styles.floatingButtons, { bottom: insets.bottom + 60 }]}>
      <Pressable
        onPress={editMode ? finishEditing : startEditing}
        style={({ pressed }) => [styles.editButton, pressed ? styles.pressed : undefined]}
      >
        {editMode ? (
          <X size={20} color="#1f2f16" strokeWidth={2.4} />
        ) : (
          <Menu size={20} color="#1f2f16" strokeWidth={2.4} />
        )}
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("AddToFridge")}
        style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : undefined]}
      >
        <Plus size={22} color="#f7f3eb" strokeWidth={2.6} />
      </Pressable>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    minHeight: 0,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 130,
  },
  filterLabel: {
    fontSize: 16,
    color: "#1f2f16",
    marginBottom: 8,
    textTransform: "lowercase",
  },
  emptyText: {
    fontSize: 16,
    color: "#6a6457",
  },
  list: {
    marginTop: 18,
    gap: 10,
  },
  itemRow: {
    backgroundColor: "#f1f1f1",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 7,
    position: "relative",
  },
  itemEmoji: {
    fontSize: 24,
    position: "absolute",
    left: 16,
  },
  itemName: {
    fontSize: 20,
    color: "#222",
    textTransform: "lowercase",
    textAlign: "center",
    lineHeight: 25,
    paddingVertical: 7,
    flex: 1,
  },
  itemMeta: {
    fontSize: 16,
    color: "#5f5a4d",
    textAlign: "right",
    position: "absolute",
    right: 16,
  },
  editCard: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 12,
    gap: 10,
    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 2,

    // Android
    elevation: 2,
  },
  editCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editCardEmoji: {
    fontSize: 22,
  },
  editCardTitle: {
    flex: 1,
    fontSize: 18,
    color: "#222",
    textTransform: "lowercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#222",
    flex: 2,
  },
  unitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitPill: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unitPillSelected: {
    backgroundColor: "#1f2f16",
    borderColor: "#1f2f16",
  },
  unitPillText: {
    color: "#3d3d3d",
  },
  unitPillTextSelected: {
    color: "#ffffff",
  },
  deleteButton: {
    alignSelf: "flex-end",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#c32626",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    color: "#1f2f16",
    width: 70,
    textAlign: "right",
    marginRight: 8,
  },
  field: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldRow: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  unitField: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryField: {
    gap: 8,
    flexDirection: "column",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginLeft: 78,
  },
  categoryPill: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryPillSelected: {
    borderColor: "#1f2f16",
    backgroundColor: "#1f2f16",
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryPillText: {
    color: "#6a6457",
    fontSize: 14,
  },
  categoryPillTextSelected: {
    color: "#fff",
  },
  deleteButtonPressed: {
    backgroundColor: "#c32626",
    borderColor: "#c32626",
  },

  bottomButtons: {
    backgroundColor: "transparent",
    paddingTop: 0,
    paddingBottom: 0,
    height: 60,
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

  sortPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  sortPill: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.accentStrong,
    borderRadius: RADIUS.modal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortPillActive: {
    borderStyle: "solid",
    backgroundColor: COLORS.accentStrong,
    borderColor: COLORS.accentStrong,
  },
  sortPillPressed: {
    opacity: 0.7,
  },
  sortPillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortArrow: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sortPillText: {
    textTransform: "lowercase",
    fontWeight: "400",
  },
  sortPillTextActive: {
    fontWeight: "600",
  },
  floatingButtons: {
    position: "absolute",
    right: 16,
    flexDirection: "column",
    gap: 8,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentStrong,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.soft,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.soft,
  },
  pressed: {
    opacity: 0.7,
  },
});
