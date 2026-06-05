import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, AlertTriangle, Package } from 'lucide-react-native';
import { apiClient } from '../api/client';
import { formatPrice, formatPercent, formatQty, formatInteger } from '../utils/formatting';

interface DashboardScreenProps {
  navigation: any;
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [profitabilityReport, setProfitabilityReport] = useState<any>(null);
  const [wasteReport, setWasteReport] = useState<any>(null);
  const [inventoryHealth, setInventoryHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week'>('today');
  
  // Static date labels (calculated once, never change during session)
  const [todayLabel, setTodayLabel] = useState('');
  const [weekLabel, setWeekLabel] = useState('');
  
  // Animation refs
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(20)).current;

  // Calculate and cache date labels on mount
  useEffect(() => {
    const now = new Date();
    
    // Today label: dd.mm
    const todayStr = now.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    setTodayLabel(todayStr);
    
    // This week label: dd.mm - dd.mm (Monday - Sunday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Mon to Sun = 6 days difference
    
    const startStr = startOfWeek.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    const endStr = endOfWeek.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    setWeekLabel(`${startStr} - ${endStr}`);
  }, []);

  const getDateRangeForAPI = () => {
    const now = new Date();
    
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return {
        dateFrom: startOfDay.toISOString().split('T')[0],
        dateTo: endOfDay.toISOString().split('T')[0],
      };
    } else {
      // This week (Monday to Sunday)
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
  };

  const loadAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { dateFrom, dateTo } = getDateRangeForAPI();

      const [profResponse, wasteResponse, healthResponse] = await Promise.all([
        apiClient.getProfitabilityReport(dateFrom, dateTo),
        apiClient.getWasteReport(dateFrom, dateTo),
        apiClient.getInventoryHealth(),
      ]);

      if (profResponse.data) {
        setProfitabilityReport(profResponse.data);
      }
      if (wasteResponse.data) {
        setWasteReport(wasteResponse.data);
      }
      if (healthResponse.data) {
        setInventoryHealth(healthResponse.data);
      }
      
      // Trigger animation
      animateCardsIn();
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const animateCardsIn = useCallback(() => {
    // Reset animation values
    cardsOpacity.setValue(0);
    cardsTranslateY.setValue(20);
    
    // Run parallel animations
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

  const handleTimeRangeChange = useCallback((newRange: 'today' | 'week') => {
    setTimeRange(newRange);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAnalytics(true)} />}
      >
        <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Analytics Dashboard</Text>

        {/* Time Range Toggle */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => handleTimeRangeChange('today')}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: timeRange === 'today' ? '#2ecc71' : '#f0f0f0',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', color: timeRange === 'today' ? '#fff' : '#666', fontSize: 13 }}>
              Today
            </Text>
            <Text style={{ fontWeight: '400', color: timeRange === 'today' ? '#fff' : '#999', fontSize: 11, marginTop: 2 }}>
              {todayLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTimeRangeChange('week')}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: timeRange === 'week' ? '#2ecc71' : '#f0f0f0',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '600', color: timeRange === 'week' ? '#fff' : '#666', fontSize: 13 }}>
              This Week
            </Text>
            <Text style={{ fontWeight: '400', color: timeRange === 'week' ? '#fff' : '#999', fontSize: 11, marginTop: 2 }}>
              {weekLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={{ backgroundColor: '#fee', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#c00', fontSize: 14 }}>{error}</Text>
          </View>
        )}

        <Animated.View
          style={{
            opacity: cardsOpacity,
            transform: [{ translateY: cardsTranslateY }],
          }}
        >
        {/* Profitability Card */}
        {profitabilityReport && (
          <TouchableOpacity
            style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#2ecc71' }}
            onPress={() => navigation.navigate('DetailedKPI')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <TrendingUp size={24} color="#2ecc71" />
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>Profitability</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Revenue</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2ecc71' }}>
                  {formatPrice(profitabilityReport.totalRevenue || 0)} PLN
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Profit</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2ecc71' }}>
                  {formatPrice(profitabilityReport.totalProfit || 0)} PLN
                </Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: 8, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, color: '#2ecc71', fontWeight: '600' }}>
                Margin: {formatPercent(profitabilityReport.profitMargin || 0)}%
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Waste Report Card */}
        {wasteReport && (
          <TouchableOpacity
            style={{ backgroundColor: '#fef3f3', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e74c3c' }}
            onPress={() => navigation.navigate('DetailedKPI')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <AlertTriangle size={24} color="#e74c3c" />
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>Waste Report</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Waste</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#e74c3c' }}>
                  {formatPrice(wasteReport.totalWaste || 0)} PLN
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Waste %</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#e74c3c' }}>
                  {formatPercent(wasteReport.wastePercentage || 0)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Inventory Health Card */}
        {inventoryHealth && (
          <TouchableOpacity
            style={{ backgroundColor: '#f3f9f0', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#27ae60' }}
            onPress={() => navigation.navigate('DetailedKPI')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Package size={24} color="#27ae60" />
              <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>Inventory Status</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Items</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#27ae60' }}>
                  {inventoryHealth.totalItems || 0}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Value</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#27ae60' }}>
                  {formatPrice(inventoryHealth.totalValue || 0)} PLN
                </Text>
              </View>
            </View>
            {inventoryHealth.criticalLevels && inventoryHealth.criticalLevels.length > 0 && (
              <View style={{ marginTop: 8, backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: 8, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: '#e74c3c', fontWeight: '600' }}>
                  ⚠️ {inventoryHealth.criticalLevels.length} items at critical level
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Top Recipes */}
        {profitabilityReport?.topRecipes && profitabilityReport.topRecipes.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' }}>Top Recipes</Text>
            {profitabilityReport.topRecipes.slice(0, 5).map((recipe: any, idx: number) => (
              <View key={idx} style={{ backgroundColor: '#f8f8f8', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#2ecc71' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>{recipe.name}</Text>
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Profit: {formatPrice(recipe.profit)} PLN</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#2ecc71' }}>{formatInteger(recipe.quantity)} sold</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        </Animated.View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
