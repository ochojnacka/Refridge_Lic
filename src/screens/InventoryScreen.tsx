import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ChevronDown } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { formatPrice, formatQty } from '../utils/formatting';
import { useInventory } from '../hooks/useInventory'; // Importujemy naszego custom hooka

interface InventoryScreenProps {
  navigation: any;
}

const UNITS = ['kg', 'g', 'l', 'ml', 'szt.', 'op.', 'zest.'];
const CATEGORIES = ['Warzywa', 'Mięso', 'Nabiał', 'Przyprawy', 'Spiżarnia', 'Mrożone', 'Napoje', 'Inne'];

export function InventoryScreen({ navigation }: InventoryScreenProps) {
  // Wyciągamy potrzebne dane i funkcje z hooka
  const { items, loading, refreshing, error, fetchInventory, addItem, deleteItem, setError } = useInventory();

  // Stany lokalne - zarządzanie wyłącznie interfejsem użytkownika (UI)
  const [modalVisible, setModalVisible] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    costPrice: '',
    category: 'Warzywa',
  });

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [fetchInventory])
  );

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.costPrice) {
      setError('Wypełnij wszystkie wymagane pola (nazwa, ilość, cena)');
      return;
    }

    const success = await addItem(
      newItem.name,
      parseFloat(newItem.quantity),
      newItem.unit,
      parseFloat(newItem.costPrice),
      newItem.category
    );

    if (success) {
      setModalVisible(false);
      setNewItem({ name: '', quantity: '', unit: 'kg', costPrice: '', category: 'Warzywa' });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchInventory(true)} />}
        >
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>📦 Magazyn</Text>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{items.length} wprowadzonych produktów</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('WasteLogging')}
                  style={{
                    backgroundColor: '#e67e22',
                    padding: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>🗑️ Zgłoś stratę</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={{
                    backgroundColor: '#2ecc71',
                    padding: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Plus size={20} color="white" />
                  <Text style={{ color: 'white', marginLeft: 6, fontWeight: '600' }}>Dodaj produkt</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Zmodyfikowany blok błędu: Graceful Degradation z przyciskiem Retry */}
            {error && (
              <View style={{ backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#c00', fontSize: 14, flex: 1 }}>{error}</Text>
                <TouchableOpacity 
                  onPress={() => fetchInventory()}
                  style={{ backgroundColor: '#c00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Ponów</Text>
                </TouchableOpacity>
              </View>
            )}

            {items.length === 0 && !error ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ fontSize: 16, color: '#999' }}>Brak produktów w magazynie</Text>
              </View>
            ) : (
              <>
                {items.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: '#f8f8f8',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                      borderLeftWidth: 3,
                      borderLeftColor: '#3498db',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 8, gap: 16 }}>
                          <View>
                            <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Ilość</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#2ecc71' }}>
                              {formatQty(item.quantity)} {item.unit}
                            </Text>
                          </View>
                          <View>
                            <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Cena zakupu</Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#3498db' }}>
                              {formatPrice(item.costPrice)} PLN/{item.unit}
                            </Text>
                          </View>
                          <View>
                            <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Kategoria</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>{item.category}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteItem(item.id)}
                        style={{ padding: 8 }}
                      >
                        <Trash2 size={18} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        {/* Add Item Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 20, color: '#333' }}>Dodaj pozycję do magazynu</Text>

                {/* Item Name */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Nazwa *</Text>
                  <TextInput
                    placeholder="e.g., Tomatoes, Chicken Breast"
                    value={newItem.name}
                    onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </View>

                {/* Quantity & Unit Row */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Ilość *</Text>
                    <TextInput
                      placeholder="100"
                      value={newItem.quantity}
                      onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
                      keyboardType="decimal-pad"
                      style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        padding: 12,
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Jednostka *</Text>
                    <TouchableOpacity
                      onPress={() => setShowUnitPicker(!showUnitPicker)}
                      style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        padding: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: showUnitPicker ? '#f0f9ff' : '#fff',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>{newItem.unit}</Text>
                      <ChevronDown size={18} color="#666" />
                    </TouchableOpacity>
                    {showUnitPicker && (
                      <View style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f8f8f8', overflow: 'hidden' }}>
                        {UNITS.map((unit) => (
                          <TouchableOpacity
                            key={unit}
                            onPress={() => {
                              setNewItem({ ...newItem, unit });
                              setShowUnitPicker(false);
                            }}
                            style={{
                              padding: 10,
                              borderBottomWidth: 1,
                              borderBottomColor: '#eee',
                              backgroundColor: newItem.unit === unit ? '#e8f8f5' : '#fff',
                            }}
                          >
                            <Text style={{ color: newItem.unit === unit ? '#27ae60' : '#333', fontWeight: newItem.unit === unit ? '600' : '400' }}>
                              {unit}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Cost Price */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Cena zakupu za {newItem.unit} (PLN) *</Text>
                  <TextInput
                    placeholder="15.50"
                    value={newItem.costPrice}
                    onChangeText={(text) => setNewItem({ ...newItem, costPrice: text })}
                    keyboardType="decimal-pad"
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                  <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>💡 To jest cena zakupu za {newItem.unit} (np. 5 PLN/kg)</Text>
                </View>

                {/* Category */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#666' }}>Kategoria *</Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
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
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>{newItem.category}</Text>
                    <ChevronDown size={18} color="#666" />
                  </TouchableOpacity>
                  {showCategoryPicker && (
                    <View style={{ marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f8f8f8', overflow: 'hidden' }}>
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => {
                            setNewItem({ ...newItem, category: cat });
                            setShowCategoryPicker(false);
                          }}
                          style={{
                            padding: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: '#eee',
                            backgroundColor: newItem.category === cat ? '#e8f8f5' : '#fff',
                          }}
                        >
                          <Text style={{ color: newItem.category === cat ? '#27ae60' : '#333', fontWeight: newItem.category === cat ? '600' : '400' }}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setShowUnitPicker(false);
                      setShowCategoryPicker(false);
                    }}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#333', fontWeight: '600' }}>Anuluj</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleAddItem}
                    style={{
                      flex: 1,
                      backgroundColor: '#2ecc71',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Dodaj produkt</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}