import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, ChevronDown, Info } from 'lucide-react-native';

import { formatPrice, formatQty } from '../utils/formatting';
import { WasteReason } from '../types/domain';
import { AppHeader } from '../components/AppHeader';
import { useWasteLogging } from '../hooks/useWasteLogging';

interface WasteLoggingScreenProps {
  navigation: any;
}

const WASTE_REASONS: WasteReason[] = ['Przeterminowany', 'Uszkodzony', 'Nadprodukcja', 'Inne'];

export function WasteLoggingScreen({ navigation }: WasteLoggingScreenProps) {
  // Pobieramy całą zaktualizowaną logikę z hooka
  const {
    items,
    loading,
    refreshing,
    error,
    success,
    submitting,
    selectedItem,
    setSelectedItem,
    quantity,
    setQuantity,
    reason,
    setReason,
    calculateWasteValue,
    confirmLogWaste, // Pobieramy nową funkcję z oknem potwierdzenia
    fetchInventory
  } = useWasteLogging();

  // Lokalny stan - służy WYŁĄCZNIE do sterowania widokiem UI (otwieranie pickera)
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  const wasteValue = calculateWasteValue();

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Rejestr strat" 
        onBack={() => navigation.goBack()} 
        showNotifications={true} 
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchInventory(true)} />}
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* Success Message */}
          {success && (
            <View style={styles.successAlert}>
              <CheckCircle size={20} color="#2b8a3e" />
              <Text style={styles.successAlertText}>Strata została zarejestrowana.</Text>
            </View>
          )}

          {/* Error Message with Graceful Degradation */}
          {error && (
            <View style={styles.errorAlert}>
              <AlertCircle size={20} color="#c92a2a" />
              <Text style={styles.errorAlertText}>{error}</Text>
              <TouchableOpacity 
                onPress={() => fetchInventory()}
                style={{ backgroundColor: '#c92a2a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Ponów</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Zgłoszenie nowej straty</Text>
            
            {/* Item Selector */}
            <View style={[styles.inputGroup, { zIndex: 2000 }]}>
              <Text style={styles.label}>Wybierz produkt *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowItemPicker(!showItemPicker);
                  setShowReasonPicker(false);
                }}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, !selectedItem && { color: '#adb5bd' }]}>
                  {selectedItem ? selectedItem.name : 'Wybierz produkt z magazynu...'}
                </Text>
                <ChevronDown size={20} color="#adb5bd" style={{ transform: [{ rotate: showItemPicker ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>

              {showItemPicker && (
                <View style={styles.dropdownMenu}>
                  <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {items.length === 0 ? (
                      <Text style={styles.emptyText}>Brak dostępnych pozycji w magazynie</Text>
                    ) : (
                      items.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => {
                            setSelectedItem(item);
                            setShowItemPicker(false);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text style={styles.dropdownItemTitle}>{item.name}</Text>
                          <Text style={styles.dropdownItemSub}>
                            Ilość: {formatQty(item.quantity)} {item.unit} • Koszt: {formatPrice(item.costPrice)} PLN/{item.unit}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Quantity Input */}
            <View style={[styles.inputGroup, { zIndex: 1 }]}>
              <Text style={styles.label}>
                Utracona ilość * {selectedItem ? `(${selectedItem.unit})` : ''}
              </Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#adb5bd"
                onFocus={() => {
                  setShowItemPicker(false);
                  setShowReasonPicker(false);
                }}
                style={styles.textInput}
              />
            </View>

            {/* Reason Selector */}
            <View style={[styles.inputGroup, { zIndex: 1000 }]}>
              <Text style={styles.label}>Powód straty *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowReasonPicker(!showReasonPicker);
                  setShowItemPicker(false);
                }}
                style={styles.pickerButton}
              >
                <Text style={styles.pickerButtonText}>{reason}</Text>
                <ChevronDown size={20} color="#adb5bd" style={{ transform: [{ rotate: showReasonPicker ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>

              {showReasonPicker && (
                <View style={styles.dropdownMenu}>
                  <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {WASTE_REASONS.map((r) => (
                      <TouchableOpacity
                        key={r}
                        onPress={() => {
                          setReason(r);
                          setShowReasonPicker(false);
                        }}
                        style={[styles.dropdownItem, reason === r && { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}
                      >
                        <Text style={[styles.dropdownItemTitle, reason === r && { color: '#2ecc71', fontWeight: '700' }]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Waste Value Display */}
            {selectedItem && quantity ? (
              <View style={styles.financialImpactBox}>
                <Text style={styles.financialImpactLabel}>Szacowana strata finansowa</Text>
                <Text style={styles.financialImpactValue}>{formatPrice(wasteValue)} PLN</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={confirmLogWaste} // Podłączono naszą nową funkcję z alertem
              disabled={submitting || !selectedItem || !quantity}
              style={[styles.submitButton, (!selectedItem || !quantity) && styles.submitButtonDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Zgłoś stratę</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Info size={16} color="#868e96" style={{ marginTop: 2 }} />
            <Text style={styles.infoBoxText}>
              Rejestrowanie przypadków marnowania pozwala na lepsze zrozumienie, które produkty są najczęściej wyrzucane i dlaczego. Dzięki temu możesz podejmować świadome decyzje dotyczące zamówień i produkcji, minimalizując straty i zwiększając efektywność operacyjną.
            </Text>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  scrollContainer: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  formCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingBottom: 12 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#495057', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#e9ecef', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 8 },
  pickerButtonText: { fontSize: 15, color: '#212529', fontWeight: '500' },
  textInput: { borderWidth: 1.5, borderColor: '#e9ecef', backgroundColor: '#f8f9fa', padding: 14, borderRadius: 8, fontSize: 15, color: '#212529', fontWeight: '500' },
  dropdownMenu: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef', maxHeight: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  dropdownItemTitle: { fontSize: 15, color: '#212529', fontWeight: '500' },
  dropdownItemSub: { fontSize: 12, color: '#868e96', marginTop: 4 },
  emptyText: { padding: 16, color: '#868e96', textAlign: 'center' },
  financialImpactBox: { marginBottom: 24, padding: 16, backgroundColor: '#fff3cd', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#f5c6cb' },
  financialImpactLabel: { fontSize: 12, color: '#856404', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  financialImpactValue: { fontSize: 22, fontWeight: '800', color: '#856404', marginTop: 4 },
  submitButton: { backgroundColor: '#2ecc71', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#e9ecef' },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  infoBox: { flexDirection: 'row', backgroundColor: '#e9ecef', padding: 16, borderRadius: 8, gap: 12 },
  infoBoxText: { flex: 1, fontSize: 13, color: '#495057', lineHeight: 18 },
  successAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ebfbee', padding: 14, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#40c057' },
  successAlertText: { marginLeft: 10, color: '#2b8a3e', fontWeight: '600', fontSize: 14 },
  errorAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', padding: 14, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252' },
  errorAlertText: { marginLeft: 10, color: '#c92a2a', fontWeight: '600', fontSize: 14, flex: 1 },
});