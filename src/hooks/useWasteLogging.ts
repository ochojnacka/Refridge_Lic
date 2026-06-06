import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { apiClient, API_BASE_URL } from '../api/client';
import { WasteReason } from '../types/domain';

export function useWasteLogging() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<WasteReason>('Przeterminowany');

  // WebSocket state
  const socketRef = useRef<Socket | null>(null);
  const [lastWasteTime, setLastWasteTime] = useState<number | null>(null);
  const [badgeText, setBadgeText] = useState<string | null>(null);

  const fetchInventory = useCallback(async (showRefresh = false) => {
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
      console.error('Błąd ładowania zapasów:', err);
      setError('Nie udało się załadować zapasów. Proszę sprawdzić połączenie z internetem.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Inicjalizacja danych i WebSocketów
  useEffect(() => {
    fetchInventory();

    // Używamy dynamicznego adresu z api/client.ts
    socketRef.current = io(API_BASE_URL); 

    socketRef.current.on('waste:logged', () => {
      setLastWasteTime(Date.now());
      fetchInventory(); // Odśwież listę w tle
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchInventory]);

  // Timer dla powiadomień w czasie rzeczywistym
  useEffect(() => {
    if (!lastWasteTime) {
      setBadgeText(null);
      return;
    }

    const interval = setInterval(() => {
      const secondsAgo = Math.floor((Date.now() - lastWasteTime) / 1000);
      if (secondsAgo <= 10) {
        setBadgeText(`Nowe marnotrawstwo! (${secondsAgo}s temu)`);
      } else {
        setBadgeText(null);
        setLastWasteTime(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastWasteTime]);

  const calculateWasteValue = useCallback((): number => {
    if (!selectedItem || !quantity) return 0;
    return parseFloat(quantity) * selectedItem.costPrice;
  }, [selectedItem, quantity]);

  const handleLogWaste = async () => {
    if (!selectedItem || !quantity) {
      Alert.alert('Błąd walidacji', 'Proszę wybrać element i wprowadzić ilość.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiClient.logWaste(selectedItem.id, parseFloat(quantity), reason);

      if (response.error) {
        setError(response.error);
        Alert.alert('Błąd systemu', response.error);
      } else {
        setSuccess(true);
        // Reset formularza
        setSelectedItem(null);
        setQuantity('');
        setReason('Expired');
        
        setTimeout(() => setSuccess(false), 2500);
        fetchInventory();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Nie udało się połączyć z serwerem.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
    badgeText,
    calculateWasteValue,
    handleLogWaste,
    fetchInventory
  };
}