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

  const fetchInventory = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await apiClient.getInventoryItems();

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Sprawdzamy czy to na pewno tablica, jeśli nie - wstawiamy pustą
        setItems(Array.isArray(response.data) ? response.data : []);
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
      // Zamiast irytującego odliczania, po prostu cicho odświeżamy dane w tle.
      // Dzięki temu, gdy inny pracownik zgłosi stratę, u nas stan magazynu zaktualizuje się automatycznie.
      fetchInventory(); 
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchInventory]);

  const calculateWasteValue = useCallback((): number => {
    if (!selectedItem || !quantity) return 0;
    return parseFloat(quantity) * selectedItem.costPrice;
  }, [selectedItem, quantity]);

  // Główna funkcja wysyłająca dane do API
  const handleLogWaste = async () => {
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
        setReason('Przeterminowany'); // Poprawiono z 'Expired' na polskie tłumaczenie
        
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

  // NOWA FUNKCJA: Wywołuje okno potwierdzenia przed wykonaniem handleLogWaste
  const confirmLogWaste = () => {
    if (!selectedItem || !quantity) {
      Alert.alert('Błąd walidacji', 'Proszę wybrać produkt i wprowadzić ilość.');
      return;
    }

    Alert.alert(
      'Potwierdzenie rejestracji',
      `Czy na pewno chcesz zgłosić stratę?\n\nProdukt: ${selectedItem.name}\nIlość: ${quantity} ${selectedItem.unit}\nPowód: ${reason}`,
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Zgłoś stratę',
          style: 'destructive',
          onPress: handleLogWaste,
        },
      ],
      { cancelable: true }
    );
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
    calculateWasteValue,
    confirmLogWaste, // Zwracamy nową funkcję zamiast handleLogWaste
    fetchInventory
  };
}