import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState, useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, Keyboard, ScrollView, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";
import { useAppState } from "../state/AppStateContext";
import { UNITS, Unit, CATEGORIES, Category, CATEGORY_EMOJI } from "../types/domain";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { useKeyboardDismissGesture } from "../hooks/useKeyboardDismissGesture";
import { COLORS, RADIUS } from "../theme";
import { EmojiPicker } from "../components/EmojiPicker";

type Props = NativeStackScreenProps<RootStackParamList, "AddToFridge">;

function parseQuantity(value: string): number {
  return Number(value.replace(",", "."));
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function AddToFridgeModal({ navigation }: Props) {
  const { addIngredient, fridgeIngredients, updateIngredient } = useAppState();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("pc");
  const [category, setCategory] = useState<Category>("vegetables");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryEmoji, setCustomCategoryEmoji] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pendingDuplicateId, setPendingDuplicateId] = useState<string | null>(null);
  const [customSectionHeight, setCustomSectionHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const customCategoryInputRef = useRef<TextInput>(null);
  const panResponder = useSwipeGestures({
    onSwipeDown: () => {
      Keyboard.dismiss();
      setTimeout(() => navigation.goBack(), 200);
    },
    threshold: 80,
  });

  const keyboardDismissResponder = useKeyboardDismissGesture({ threshold: 40 });

  const quantityNumber = useMemo(() => parseQuantity(quantity), [quantity]);

  const nameError = submitted && !name.trim() ? "Name is required." : "";
  const quantityError = submitted && (!Number.isFinite(quantityNumber) || quantityNumber <= 0) ? "Quantity must be greater than 0." : "";

  const existingIngredient = useMemo(
    () =>
      fridgeIngredients.find(
        (ingredient) => normalizeName(ingredient.name) === normalizeName(name) && ingredient.unit === unit,
      ) ?? null,
    [fridgeIngredients, name, unit],
  );

  const duplicateQuantity = existingIngredient ? `${existingIngredient.quantity}${existingIngredient.unit}` : "";
  const requestedQuantity = `${quantityNumber}${unit}`;

  function scrollInputIntoView() {
    if (!scrollViewRef.current || customSectionHeight === 0) {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, customSectionHeight - 300), animated: true });
    }, 200);
  }

  function onSubmit() {
    setSubmitted(true);

    if (nameError || quantityError) {
      return;
    }

    if (existingIngredient) {
      setPendingDuplicateId(existingIngredient.id);
      return;
    }

    const payload: any = {
      name,
      quantity: quantityNumber,
      unit,
    };

    if (category === "" && customCategoryName.trim()) {
      payload.category = customCategoryName.trim();
      if (customCategoryEmoji.trim()) {
        payload.emoji = customCategoryEmoji.trim();
      }
    } else {
      payload.category = category;
    }

    addIngredient(payload);

    navigation.goBack();
  }

  function confirmDuplicateAdd() {
    if (!pendingDuplicateId || !existingIngredient) {
      return;
    }

    updateIngredient(pendingDuplicateId, {
      name: existingIngredient.name,
      quantity: existingIngredient.quantity + quantityNumber,
      unit: existingIngredient.unit,
    });

    navigation.goBack();
  }

  const headerOffset = insets.top + 140;

  return (
    <SafeAreaView style={styles.overlay} edges={["left", "right"]} {...panResponder}>
      <View style={[styles.sheet, { marginTop: headerOffset }]}>
        <ScrollView 
          style={styles.scrollContainer}
          ref={scrollViewRef} 
          contentContainerStyle={styles.formContent}
          bounces={false}
          alwaysBounceVertical={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          {...keyboardDismissResponder.panHandlers}
        >
          <Text style={styles.sheetTitle}>Add to fridge</Text>
          <View style={styles.divider} />

          {pendingDuplicateId && existingIngredient ? (
            <View style={styles.duplicateBox}>
              <Text style={styles.duplicateText}>
                produkt {existingIngredient.name} już jest w lodówce w liczbie {duplicateQuantity}!
              </Text>
              <Text style={styles.duplicateText}>
                czy dodać ilość {requestedQuantity} do {existingIngredient.name}?
              </Text>
              <View style={styles.duplicateActions}>
                <Pressable onPress={confirmDuplicateAdd} style={({ pressed }) => [styles.duplicateButton, pressed ? styles.pressed : undefined]}>
                  <Text style={styles.duplicateButtonText}>yes</Text>
                </Pressable>
                <Pressable onPress={() => setPendingDuplicateId(null)} style={({ pressed }) => [styles.duplicateButton, pressed ? styles.pressed : undefined]}>
                  <Text style={styles.duplicateButtonText}>no</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g. egg" />
          {nameError ? <Text style={styles.error}>{nameError}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            style={styles.input}
            placeholder="e.g. 2"
            keyboardType="decimal-pad"
          />
          {quantityError ? <Text style={styles.error}>{quantityError}</Text> : null}
        </View>

        <View style={styles.unitField}>
          <Text style={styles.label}>Unit</Text>
          <View style={styles.unitRow}>
            {UNITS.map((itemUnit) => {
              const selected = itemUnit === unit;

              return (
                <Pressable
                  key={itemUnit}
                  onPress={() => setUnit(itemUnit)}
                  style={({ pressed }) => [
                    styles.unitPill,
                    selected ? styles.unitPillSelected : undefined,
                    pressed ? styles.pressed : undefined,
                  ]}
                >
                  <Text style={[styles.unitPillText, selected ? styles.unitPillTextSelected : undefined]}>{itemUnit}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.categoryField}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const selected = cat === category;

              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setCustomCategoryName("");
                    setCustomCategoryEmoji("");
                  }}
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
              onPress={() => {
                // switch to custom category mode
                setCategory("");
                setCustomCategoryName("");
                setCustomCategoryEmoji("");
              }}
              style={({ pressed }) => [
                styles.categoryPill,
                category === "" ? styles.categoryPillSelected : undefined,
                pressed ? styles.pressed : undefined,
              ]}
            >
              <Text style={styles.categoryEmoji}>✨</Text>
              <Text style={[styles.categoryPillText, category === "" ? styles.categoryPillTextSelected : undefined]}>custom</Text>
            </Pressable>
          </View>
          {category === "" ? (
            <View 
              style={[styles.field, { marginLeft: 0, marginTop: 8 }]}
              onLayout={(event) => {
                setCustomSectionHeight(event.nativeEvent.layout.y + event.nativeEvent.layout.height);
              }}
            >
              <Text style={styles.label}>Custom</Text>
              <EmojiPicker 
                selectedEmoji={customCategoryEmoji} 
                onSelectEmoji={setCustomCategoryEmoji}
                topOffset={insets.top + 215}
              />
              <TextInput
                ref={customCategoryInputRef}
                placeholder="e.g. fruits"
                value={customCategoryName}
                onChangeText={setCustomCategoryName}
                onFocus={scrollInputIntoView}
                style={styles.input}
              />
            </View>
          ) : null}
        </View>
        </ScrollView>

        <SafeAreaView style={styles.footer} edges={["left", "right", "bottom"]}>
          <Pressable onPress={onSubmit} style={({ pressed }) => [styles.submit, pressed ? styles.pressed : undefined]}>
            <Text style={styles.submitText}>Add ingredient</Text>
          </Pressable>

          <Pressable
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("MainMenu", { transition: "back" }))}
            style={({ pressed }) => [styles.cancel, pressed ? styles.pressed : undefined]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
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
    flexDirection: "column",
  },
  scrollContainer: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  formContent: {
    gap: 16,
  },
  sheetTitle: {
    fontSize: 24,
    color: COLORS.primary,
    textTransform: "lowercase",
    fontWeight: "700",
    textAlign: "center",
    justifyContent: "center",
  },
  field: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  unitField: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: COLORS.primary,
    width: 70,
    textAlign: "right",
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    fontSize: 16,
    textAlign: "center",
    flex: 2,
  },
  unitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 2,
  },
  unitPill: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.background,
 },
  unitPillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  unitPillText: {
    color: COLORS.textMuted,
    textAlign: "center",
    justifyContent: "center",
  },
  unitPillTextSelected: {
    color: COLORS.white,
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
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryPillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryPillText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  categoryPillTextSelected: {
    color: COLORS.white,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submit: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    paddingVertical: 13,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 16,
  },
  cancel: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 15,
    textTransform: "lowercase",
  },
  duplicateBox: {
    gap: 10,
    padding: 14,
    borderRadius: RADIUS.modal,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  duplicateText: {
    color: COLORS.primary,
    fontSize: 15,
    lineHeight: 20,
  },
  duplicateActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  duplicateButton: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  duplicateButtonText: {
    color: COLORS.white,
    textTransform: "lowercase",
  },
  error: {
    color: COLORS.danger,
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
