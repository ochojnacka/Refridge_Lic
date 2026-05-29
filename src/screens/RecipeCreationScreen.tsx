import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronDown } from 'lucide-react-native';
import { apiClient } from '../api/client';
import { formatPrice } from '../utils/formatting';

interface RecipeCreationScreenProps {
  navigation: any;
  onRecipeCreated?: () => void;
}

export function RecipeCreationScreen({ navigation, onRecipeCreated }: RecipeCreationScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showMealTypePicker, setShowMealTypePicker] = useState(false);
  const [mealTypesSelected, setMealTypesSelected] = useState(['LUNCH']);

  const CATEGORIES = ['VEGETABLES', 'MEAT', 'DAIRY', 'SPICES', 'APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE'];
  const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    costPrice: '',
    salePrice: '',
    category: 'MAIN_COURSE',
  });

  const handleCreateRecipe = async () => {
    if (!recipe.name || !recipe.costPrice || !recipe.salePrice || !recipe.category) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.createRecipe(
        recipe.name,
        recipe.description,
        parseFloat(recipe.costPrice),
        parseFloat(recipe.salePrice),
        recipe.category.toUpperCase(),
        mealTypesSelected
      );

      if (response.error) {
        setError(response.error);
      } else {
        onRecipeCreated?.();
        navigation.goBack();
      }
    } catch (err) {
      setError('Failed to create recipe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealType = (type: string) => {
    if (mealTypesSelected.includes(type)) {
      setMealTypesSelected(mealTypesSelected.filter(t => t !== type));
    } else {
      setMealTypesSelected([...mealTypesSelected, type]);
    }
  };

  const margin = recipe.costPrice && recipe.salePrice 
    ? ((parseFloat(recipe.salePrice) - parseFloat(recipe.costPrice)) / parseFloat(recipe.salePrice) * 100)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>🍽️ Create Recipe</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#c00', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {/* Recipe Name */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Recipe Name *</Text>
          <TextInput
            placeholder="e.g., Pasta Carbonara, Grilled Chicken"
            value={recipe.name}
            onChangeText={(text) => setRecipe({ ...recipe, name: text })}
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              color: '#333',
            }}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Description (Optional)</Text>
          <TextInput
            placeholder="e.g., Classic Italian pasta with eggs, bacon, and cheese"
            value={recipe.description}
            onChangeText={(text) => setRecipe({ ...recipe, description: text })}
            editable={!loading}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              color: '#333',
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Category */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Category *</Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            disabled={loading}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: showCategoryPicker ? '#f0f9ff' : '#fff',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>{recipe.category}</Text>
            <ChevronDown size={18} color="#666" />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f8f8f8', overflow: 'hidden' }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setRecipe({ ...recipe, category: cat });
                    setShowCategoryPicker(false);
                  }}
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    backgroundColor: recipe.category === cat ? '#e8f8f5' : '#fff',
                  }}
                >
                  <Text style={{ color: recipe.category === cat ? '#27ae60' : '#333', fontWeight: recipe.category === cat ? '600' : '400' }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Meal Types */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Available for (Multiple) *</Text>
          <TouchableOpacity
            onPress={() => setShowMealTypePicker(!showMealTypePicker)}
            disabled={loading}
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              borderRadius: 8,
              backgroundColor: showMealTypePicker ? '#f0f9ff' : '#fff',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {mealTypesSelected.join(', ')}
            </Text>
          </TouchableOpacity>
          {showMealTypePicker && (
            <View style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f8f8f8', overflow: 'hidden' }}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleMealType(type)}
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    backgroundColor: mealTypesSelected.includes(type) ? '#e8f8f5' : '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: '#27ae60',
                      marginRight: 10,
                      backgroundColor: mealTypesSelected.includes(type) ? '#27ae60' : '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {mealTypesSelected.includes(type) && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                  </View>
                  <Text style={{ color: mealTypesSelected.includes(type) ? '#27ae60' : '#333', fontWeight: mealTypesSelected.includes(type) ? '600' : '400' }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Pricing Section */}
        <View style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#2ecc71' }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Cost Price (PLN) *</Text>
              <TextInput
                placeholder="15.50"
                value={recipe.costPrice}
                onChangeText={(text) => setRecipe({ ...recipe, costPrice: text })}
                editable={!loading}
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#333',
                  backgroundColor: '#fff',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Sale Price (PLN) *</Text>
              <TextInput
                placeholder="45.00"
                value={recipe.salePrice}
                onChangeText={(text) => setRecipe({ ...recipe, salePrice: text })}
                editable={!loading}
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#333',
                  backgroundColor: '#fff',
                }}
              />
            </View>
          </View>

          {/* Margin Display */}
          <View style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: 10, borderRadius: 6 }}>
            <Text style={{ fontSize: 12, color: '#27ae60', fontWeight: '600' }}>
              💰 Profit Margin: {margin.toFixed(1)}%
            </Text>
            {recipe.costPrice && recipe.salePrice && (
              <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                Profit per dish: {formatPrice(parseFloat(recipe.salePrice) - parseFloat(recipe.costPrice))} PLN
              </Text>
            )}
          </View>
        </View>

        {/* Info Box */}
        <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', lineHeight: 18 }}>
            💡 <Text style={{ fontWeight: '600' }}>Tip:</Text> You can add ingredients and adjust the recipe later. For now, provide the basic pricing and details.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#333', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateRecipe}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: loading ? '#ccc' : '#2ecc71',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '600' }}>Create Recipe</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
