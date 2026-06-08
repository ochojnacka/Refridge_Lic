import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { io } from 'socket.io-client';
import { apiClient, API_BASE_URL } from '../api/client';

export function useDashboard() {
  const [profitabilityReport, setProfitabilityReport] = useState<any>(null);
  const [wasteReport, setWasteReport] = useState<any>(null);
  const [inventoryHealth, setInventoryHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NOWY STAN: Przechowywanie roli użytkownika do sterowania interfejsem
  const [userRole, setUserRole] = useState<string | null>(null);

  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(20)).current;

  // Pobieranie roli użytkownika z tokena JWT przy starcie dashboardu
  useEffect(() => {
    const token = (apiClient as any).token;
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(atob(base64));
          setUserRole(decoded.role);
        }
      } catch (e) {
        console.error('Błąd dekodowania tokena w Dashboardzie:', e);
      }
    }
  }, []);

  const getDateRangeForAPI = useCallback(() => {
    const now = new Date();
    // Ze względu na uproszczenie dashboardu, zawsze pobieramy dane z dzisiaj
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return {
      dateFrom: startOfDay.toISOString().split('T')[0],
      dateTo: endOfDay.toISOString().split('T')[0],
    };
  }, []);

  const animateCardsIn = useCallback(() => {
    cardsOpacity.setValue(0);
    cardsTranslateY.setValue(20);
    
    Animated.parallel([
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardsTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardsOpacity, cardsTranslateY]);

  const loadAnalytics = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const { dateFrom, dateTo } = getDateRangeForAPI();

      const [profResponse, wasteResponse, healthResponse] = await Promise.all([
        apiClient.getProfitabilityReport(dateFrom, dateTo),
        apiClient.getWasteReport(dateFrom, dateTo),
        apiClient.getInventoryHealth(),
      ]);

      if (profResponse.data) setProfitabilityReport(profResponse.data);
      if (wasteResponse.data) setWasteReport(wasteResponse.data);
      if (healthResponse.data) setInventoryHealth(healthResponse.data);
      
      animateCardsIn();
    } catch (err) {
      console.error('Błąd ładowania danych analitycznych:', err);
      setError('Nie udało się załadować danych analitycznych. Proszę sprawdzić połączenie z internetem.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRangeForAPI, animateCardsIn]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on('waste:logged', () => {
      loadAnalytics(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [loadAnalytics]);

  return {
    profitabilityReport,
    wasteReport,
    inventoryHealth,
    loading,
    refreshing,
    error,
    userRole, // Zwracamy rolę do widoku
    cardsOpacity,
    cardsTranslateY,
    loadAnalytics
  };
}