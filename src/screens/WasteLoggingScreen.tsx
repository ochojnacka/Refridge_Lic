import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, Alert, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, ChevronDown, Bell, Info } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../api/client';
import { formatPrice, formatQty } from '../utils/formatting';
import { WasteReason } from '../types/domain';
import { AppHeader } from '../components/AppHeader';

interface WasteLoggingScreenProps {
  navigation: any;
}

export function WasteLoggingScreen({ navigation }: WasteLoggingScreenProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<WasteReason>('Expired');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  // WebSocket state
  const socketRef = useRef<Socket | null>(null);
  const [lastWasteTime, setLastWasteTime] = useState<number | null>(null);
  const [badgeText, setBadgeText] = useState<string | null>(null);

  const WASTE_REASONS: WasteReason[] = ['Expired', 'Damaged', 'Over-production', 'Other'];

  const loadInventory = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await apiClient.getInventoryItems();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setItems(response.data);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();

    // Setup WebSocket connection
    // Adres IP jest zgodny z tym w api/client.ts
    socketRef.current = io('http://192.168.1.188:3000'); 

    socketRef.current.on('waste:logged', () => {
      setLastWasteTime(Date.now());
      loadInventory(); // Odśwież listę w tle po zgłoszeniu przez kogoś innego
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Timer for real-time badge
  useEffect(() => {
    if (!lastWasteTime) {
      setBadgeText(null);
      return;
    }

    const interval = setInterval(() => {
      const secondsAgo = Math.floor((Date.now() - lastWasteTime) / 1000);
      if (secondsAgo <= 10) {
        setBadgeText(`New waste logged ${secondsAgo}s ago by staff`);
      } else {
        setBadgeText(null);
        setLastWasteTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastWasteTime]);

  const calculateWasteValue = (): number => {
    if (!selectedItem || !quantity) return 0;
    return parseFloat(quantity) * selectedItem.costPrice;
  };

  const handleLogWaste = async () => {
    if (!selectedItem || !quantity) {
      Alert.alert('Validation Error', 'Please select an item and enter the quantity.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiClient.logWaste(selectedItem.id, parseFloat(quantity), reason);

      if (response.error) {
        setError(response.error);
        Alert.alert('System Error', response.error);
      } else {
        setSuccess(true);
        // Reset form
        setSelectedItem(null);
        setQuantity('');
        setReason('Expired');
        
        setTimeout(() => setSuccess(false), 2500);
        loadInventory();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to connect to the server.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  const wasteValue = calculateWasteValue();

  return (
    <View style={styles.container}>
      {/* Zintegrowany biznesowy header z obsługą przycisku Wstecz */}
      <AppHeader 
        title="Waste Logging" 
        onBack={() => navigation.goBack()} 
        showNotifications={true} 
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadInventory(true)} />}
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* Real-time Notification Badge */}
          {badgeText && (
            <View style={styles.socketAlert}>
              <Bell size={18} color="#0056b3" />
              <Text style={styles.socketAlertText}>{badgeText}</Text>
            </View>
          )}

          {/* Success Message */}
          {success && (
            <View style={styles.successAlert}>
              <CheckCircle size={20} color="#2b8a3e" />
              <Text style={styles.successAlertText}>Waste entry successfully recorded in the system.</Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorAlert}>
              <AlertCircle size={20} color="#c92a2a" />
              <Text style={styles.errorAlertText}>{error}</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Record Incident</Text>
            
            {/* Item Selector */}
            <View style={[styles.inputGroup, { zIndex: 2000 }]}>
              <Text style={styles.label}>Select Inventory Item *</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowItemPicker(!showItemPicker);
                  setShowReasonPicker(false);
                }}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, !selectedItem && { color: '#adb5bd' }]}>
                  {selectedItem ? selectedItem.name : 'Choose an item from storage...'}
                </Text>
                <ChevronDown size={20} color="#adb5bd" style={{ transform: [{ rotate: showItemPicker ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>

              {showItemPicker && (
                <View style={styles.dropdownMenu}>
                  <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {items.length === 0 ? (
                      <Text style={styles.emptyText}>No items available in inventory</Text>
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
                            Stock: {formatQty(item.quantity, item.unit)} • Cost: {formatPrice(item.costPrice)} PLN/{item.unit}
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
                Quantity Wasted * {selectedItem ? `(${selectedItem.unit})` : ''}
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
              <Text style={styles.label}>Reason for Waste *</Text>
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
                <Text style={styles.financialImpactLabel}>Estimated Financial Loss</Text>
                <Text style={styles.financialImpactValue}>{formatPrice(wasteValue)} PLN</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLogWaste}
              disabled={submitting || !selectedItem || !quantity}
              style={[styles.submitButton, (!selectedItem || !quantity) && styles.submitButtonDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Commit Waste Log</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Info size={16} color="#868e96" style={{ marginTop: 2 }} />
            <Text style={styles.infoBoxText}>
              Logging waste incidents updates your inventory levels in real-time and calculates the impact on your restaurant's profit margin.
            </Text>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 8,
    fontSize: 15,
    color: '#212529',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dropdownItemTitle: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '500',
  },
  dropdownItemSub: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 4,
  },
  emptyText: {
    padding: 16,
    color: '#868e96',
    textAlign: 'center',
  },
  financialImpactBox: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f5c6cb',
  },
  financialImpactLabel: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  financialImpactValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#856404',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  socketAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f5ff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a5d8ff',
  },
  socketAlertText: {
    marginLeft: 10,
    color: '#0056b3',
    fontWeight: '600',
    fontSize: 14,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebfbee',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#40c057',
  },
  successAlertText: {
    marginLeft: 10,
    color: '#2b8a3e',
    fontWeight: '600',
    fontSize: 14,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fa5252',
  },
  errorAlertText: {
    marginLeft: 10,
    color: '#c92a2a',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
});