import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, ChevronDown, Bell } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../api/client';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { formatPrice, formatQty } from '../utils/formatting';

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
  const [reason, setReason] = useState('Expired');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  // WebSocket state
  const socketRef = useRef<Socket | null>(null);
  const [lastWasteTime, setLastWasteTime] = useState<number | null>(null);
  const [badgeText, setBadgeText] = useState<string | null>(null);

  const WASTE_REASONS = ['Expired', 'Damaged', 'Over-production', 'Other'];

  const loadInventory = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
    socketRef.current = io('http://192.168.1.188:3000'); // Pamiętaj, by upewnić się, że to Twoje IP

    socketRef.current.on('waste:logged', (data) => {
      setLastWasteTime(Date.now());
      loadInventory(); // Odśwież listę w tle
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
      // Zmiana czasu wyświetlania powiadomienia do 10 sekund
      if (secondsAgo <= 10) {
        setBadgeText(`New waste logged ${secondsAgo}s ago`);
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
      Alert.alert('Error', 'Please select an item and enter quantity');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiClient.logWaste(selectedItem.id, parseFloat(quantity), reason);

      if (response.error) {
        setError(response.error);
        Alert.alert('Error', response.error);
      } else {
        setSuccess(true);
        // Reset form
        setSelectedItem(null);
        setQuantity('');
        setReason('Expired');
        
        // Hide success message after 2 seconds
        setTimeout(() => setSuccess(false), 2000);
        
        // Reload inventory
        loadInventory();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to log waste';
      setError(errMsg);
      Alert.alert('Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const wasteValue = calculateWasteValue();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadInventory(true)} />}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text }}>Log Waste</Text>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>
            Track ingredients and products
          </Text>
        </View>

        {/* Real-time Notification Badge */}
        {badgeText && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: '#CCE5FF',
              borderRadius: RADIUS.md,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#B8DAFF',
            }}
          >
            <Bell size={20} color="#004085" />
            <Text style={{ marginLeft: 8, color: '#004085', fontWeight: '600', flex: 1 }}>
              {badgeText}
            </Text>
          </View>
        )}

        {/* Success Message */}
        {success && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: '#D4EDDA',
              borderRadius: RADIUS.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <CheckCircle size={20} color="#28A745" />
            <Text style={{ marginLeft: 8, color: '#28A745', fontWeight: '600' }}>
              Waste logged successfully!
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: '#F8D7DA',
              borderRadius: RADIUS.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={20} color="#DC3545" />
            <Text style={{ marginLeft: 8, color: '#DC3545', fontWeight: '600', flex: 1 }}>
              {error}
            </Text>
          </View>
        )}

        {/* Form Container */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 }}>
          
          {/* Item Selector */}
          <View style={{ marginBottom: 20, zIndex: 2000 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 }}>
              Select Item *
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowItemPicker(!showItemPicker);
                setShowReasonPicker(false); // Zamknij drugi picker jeśli jest otwarty
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: COLORS.surface,
                borderRadius: RADIUS.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: selectedItem ? COLORS.text : COLORS.textSecondary,
                  flex: 1,
                }}
              >
                {selectedItem ? selectedItem.name : 'Choose an item...'}
              </Text>
              <ChevronDown
                size={20}
                color={COLORS.textSecondary}
                style={{ transform: [{ rotate: showItemPicker ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {/* Item Picker Dropdown - Z-Index i Position Absolute */}
            {showItemPicker && (
              <View
                style={{
                  position: 'absolute',
                  top: 75,
                  left: 0,
                  right: 0,
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  maxHeight: 250,
                  zIndex: 2001,
                  elevation: 5, // Cień Android
                  shadowColor: '#000', // Cienie iOS
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                  {items.length === 0 ? (
                    <Text style={{ padding: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                      No items available
                    </Text>
                  ) : (
                    items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          setSelectedItem(item);
                          setShowItemPicker(false);
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: COLORS.border,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: '500' }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
                          Stock: {formatQty(item.quantity, item.unit)} • {formatPrice(item.costPrice)}/
                          {item.unit}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Quantity Input */}
          <View style={{ marginBottom: 20, zIndex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 }}>
              Quantity * ({selectedItem?.unit || 'unit'})
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="0.00"
              onFocus={() => {
                setShowItemPicker(false);
                setShowReasonPicker(false);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: COLORS.surface,
                borderRadius: RADIUS.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                fontSize: 16,
                color: COLORS.text,
              }}
            />
          </View>

          {/* Reason Selector */}
          <View style={{ marginBottom: 20, zIndex: 1000 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 }}>
              Reason *
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowReasonPicker(!showReasonPicker);
                setShowItemPicker(false); // Zamknij drugi picker
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: COLORS.surface,
                borderRadius: RADIUS.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: COLORS.text }}>
                {reason}
              </Text>
              <ChevronDown
                size={20}
                color={COLORS.textSecondary}
                style={{ transform: [{ rotate: showReasonPicker ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {/* Reason Picker Dropdown - Z-Index i Position Absolute */}
            {showReasonPicker && (
              <View
                style={{
                  position: 'absolute',
                  top: 75,
                  left: 0,
                  right: 0,
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  zIndex: 1001,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                  {WASTE_REASONS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => {
                        setReason(r);
                        setShowReasonPicker(false);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.border,
                        backgroundColor: reason === r ? COLORS.primaryLight : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: reason === r ? COLORS.primary : COLORS.text,
                          fontWeight: reason === r ? '600' : '400',
                        }}
                      >
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
            <View
              style={{
                marginBottom: 20,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: '#FFF3CD',
                borderRadius: RADIUS.md,
                borderWidth: 1,
                borderColor: '#FFE69C',
                zIndex: 1,
              }}
            >
              <Text style={{ fontSize: 12, color: '#856404', fontWeight: '500' }}>
                Estimated Waste Value
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#856404',
                  marginTop: 4,
                }}
              >
                {formatPrice(wasteValue)}
              </Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogWaste}
            disabled={submitting || !selectedItem || !quantity}
            style={{
              paddingVertical: 14,
              backgroundColor: !selectedItem || !quantity ? COLORS.border : COLORS.primary,
              borderRadius: RADIUS.md,
              alignItems: 'center',
              zIndex: 1,
              ...SHADOW.md,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                Log Waste
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View
            style={{
              marginTop: 20,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              zIndex: 1,
            }}
          >
            <Text style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 }}>
              💡 <Text style={{ fontWeight: '600' }}>Tip:</Text> Logging waste helps track loss and identify
              areas for improvement. Values are calculated automatically.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}