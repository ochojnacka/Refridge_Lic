// src/components/RecipeCard.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { ChefHat, TrendingUp, DollarSign } from "lucide-react-native";
import { Recipe } from "../types/domain";
import { COLORS, RADIUS, SHADOW } from "../theme";
import { formatPrice } from "../utils/formatting"; // Zakładam, że masz tę funkcję z poprzednich ekranów

interface RecipeCardProps {
  recipe: Recipe;
  costPrice?: number; // Koszt surowców wyliczony z magazynu
  onPress?: () => void;
}

export function RecipeCard({ recipe, costPrice = 0, onPress }: RecipeCardProps) {
  // Wyliczanie marży (jeśli mamy zdefiniowaną cenę sprzedaży i koszt)
  const margin = recipe.sellingPrice && recipe.sellingPrice > 0 
    ? ((recipe.sellingPrice - costPrice) / recipe.sellingPrice) * 100 
    : 0;

  return (
    <Animated.View entering={FadeInDown.springify()} exiting={FadeOut}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.buttonPressed : undefined]}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <ChefHat size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.name} numberOfLines={1}>{recipe.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Cost</Text>
              <Text style={styles.metricValue}>{formatPrice(costPrice)} PLN</Text>
            </View>
            
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Selling Price</Text>
              <Text style={[styles.metricValue, { color: COLORS.primary }]}>
                {recipe.sellingPrice ? `${formatPrice(recipe.sellingPrice)} PLN` : 'N/A'}
              </Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Margin</Text>
              <View style={styles.marginContainer}>
                <TrendingUp size={14} color={margin > 60 ? "#2ecc71" : "#e67e22"} />
                <Text style={[styles.marginText, { color: margin > 60 ? "#2ecc71" : "#e67e22" }]}>
                  {margin.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{recipe.ingredients.length} ingredients</Text>
            </View>
            {recipe.instructions && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Standardized</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOW.soft,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 204, 113, 0.1)', // Delikatne tło pod ikonę
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  marginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marginText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});