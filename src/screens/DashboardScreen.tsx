import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, AlertTriangle, Package } from 'lucide-react-native';

import { formatPrice, formatPercent, formatInteger } from '../utils/formatting';
import { useDashboard } from '../hooks/useDashboard';

interface DashboardScreenProps {
  navigation: any;
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  // Cała logika biznesowa ukryta w custom hooku!
  const {
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
  } = useDashboard();

  if (loading && !refreshing) {
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
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>Analytics Dashboard</Text>

          {/* Time Range Toggle */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => setTimeRange('today')}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: timeRange === 'today' ? '#2ecc71' : '#f8f9fa',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: timeRange === 'today' ? '#2ecc71' : '#e9ecef',
              }}
            >
              <Text style={{ fontWeight: '600', color: timeRange === 'today' ? '#fff' : '#495057', fontSize: 13 }}>
                Today
              </Text>
              <Text style={{ fontWeight: '500', color: timeRange === 'today' ? 'rgba(255,255,255,0.8)' : '#868e96', fontSize: 11, marginTop: 2 }}>
                {todayLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTimeRange('week')}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: timeRange === 'week' ? '#3498db' : '#f8f9fa',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: timeRange === 'week' ? '#3498db' : '#e9ecef',
              }}
            >
              <Text style={{ fontWeight: '600', color: timeRange === 'week' ? '#fff' : '#495057', fontSize: 13 }}>
                This Week
              </Text>
              <Text style={{ fontWeight: '500', color: timeRange === 'week' ? 'rgba(255,255,255,0.8)' : '#868e96', fontSize: 11, marginTop: 2 }}>
                {weekLabel}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Graceful Degradation - Error Alert with Retry mechanism */}
          {error && (
            <View style={{ backgroundColor: '#fff5f5', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: '#c92a2a', fontSize: 14, fontWeight: '500' }}>{error}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => loadAnalytics()}
                style={{ backgroundColor: '#fa5252', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Retry</Text>
              </TouchableOpacity>
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
                  <Text style={{ fontSize: 12, color: '#2ecc71', fontWeight: '700' }}>
                    Margin: {formatPercent(profitabilityReport.profitMargin || 0)}%
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Waste Report Card */}
            {wasteReport && (
              <TouchableOpacity
                style={{ backgroundColor: '#fff5f5', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252' }}
                onPress={() => navigation.navigate('DetailedKPI')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <AlertTriangle size={24} color="#fa5252" />
                  <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>Waste Report</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Waste</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fa5252' }}>
                      {formatPrice(wasteReport.totalWaste || 0)} PLN
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Waste %</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fa5252' }}>
                      {formatPercent(wasteReport.wastePercentage || 0)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Inventory Health Card */}
            {inventoryHealth && (
              <TouchableOpacity
                style={{ backgroundColor: '#f8f9fa', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3498db' }}
                onPress={() => navigation.navigate('DetailedKPI')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Package size={24} color="#3498db" />
                  <Text style={{ fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' }}>Inventory Status</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Items</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                      {inventoryHealth.totalItems || 0}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Value</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                      {formatPrice(inventoryHealth.totalValue || 0)} PLN
                    </Text>
                  </View>
                </View>
                {inventoryHealth.criticalLevels && inventoryHealth.criticalLevels.length > 0 && (
                  <View style={{ marginTop: 12, backgroundColor: '#fff5f5', padding: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
                    <AlertTriangle size={14} color="#fa5252" />
                    <Text style={{ fontSize: 12, color: '#c92a2a', fontWeight: '600', marginLeft: 6 }}>
                      {inventoryHealth.criticalLevels.length} items at critical stock level!
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Top Recipes */}
            {profitabilityReport?.topRecipes && profitabilityReport.topRecipes.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#212529' }}>Top Recipes</Text>
                {profitabilityReport.topRecipes.slice(0, 5).map((recipe: any, idx: number) => (
                  <View key={idx} style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#f1c40f', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#343a40' }}>{recipe.name}</Text>
                        <Text style={{ fontSize: 13, color: '#868e96', marginTop: 4 }}>Profit: {formatPrice(recipe.profit)} PLN</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', backgroundColor: '#f8f9fa', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#495057' }}>{formatInteger(recipe.quantity)} sold</Text>
                      </View>
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