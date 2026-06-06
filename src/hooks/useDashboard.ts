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
  const [timeRange, setTimeRange] = useState<'today' | 'week'>('today');

  const [todayLabel, setTodayLabel] = useState('');
  const [weekLabel, setWeekLabel] = useState('');

  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(20)).current;

  // Obliczanie etykiet dat (wykonywane tylko raz)
  useEffect(() => {
    const now = new Date();
    
    const todayStr = now.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    setTodayLabel(todayStr);
    
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startStr = startOfWeek.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    const endStr = endOfWeek.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    setWeekLabel(`${startStr} - ${endStr}`);
  }, []);

  const getDateRangeForAPI = useCallback(() => {
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return {
        dateFrom: startOfDay.toISOString().split('T')[0],
        dateTo: endOfDay.toISOString().split('T')[0],
      };
    } else {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      return {
        dateFrom: startOfWeek.toISOString().split('T')[0],
        dateTo: endOfWeek.toISOString().split('T')[0],
      };
    }
  }, [timeRange]);

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
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRangeForAPI, animateCardsIn]);

  // Odświeżanie danych przy zmianie czasu
  useEffect(() => {
    loadAnalytics();
  }, [timeRange, loadAnalytics]);

  // Real-time WebSocket: Automatyczne odświeżanie statystyk, gdy kuchnia wpisze stratę!
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on('waste:logged', () => {
      // Pobieramy nowe dane analityczne "po cichu" (jako refresh, bez blokowania ekranu ładowaniem)
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
    timeRange,
    setTimeRange,
    todayLabel,
    weekLabel,
    cardsOpacity,
    cardsTranslateY,
    loadAnalytics
  };
}