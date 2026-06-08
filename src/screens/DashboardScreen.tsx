import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, AlertTriangle, Package, BarChart2, ChevronRight } from 'lucide-react-native';

import { formatPrice, formatPercent, formatInteger } from '../utils/formatting';
import { useDashboard } from '../hooks/useDashboard';

interface DashboardScreenProps {
  navigation: any;
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const {
    profitabilityReport,
    wasteReport,
    inventoryHealth,
    loading,
    refreshing,
    error,
    userRole,
    cardsOpacity,
    cardsTranslateY,
    loadAnalytics
  } = useDashboard();

  // Flaga pomocnicza do ukrywania elementów finansowych
  const isChef = userRole === 'Szef kuchni';

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAnalytics(true)} />}
      >
        <View style={styles.container}>
          <Text style={styles.headerTitle}>📊 Przegląd operacyjny</Text>

          {/* CTA ZAAWANSOWANA ANALITYKA: Widoczne tylko dla Menedżera i Administratora */}
          {!isChef && (
            <TouchableOpacity 
              style={styles.kpiButton}
              onPress={() => navigation.navigate('DetailedKPI')}
            >
              <View style={styles.kpiButtonLeft}>
                <View style={styles.kpiIconWrapper}>
                  <BarChart2 size={24} color="#ffffff" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.kpiButtonTitle}>Zaawansowana Analityka</Text>
                  <Text style={styles.kpiButtonSub}>Wskaźniki ROI, rotacja i marże</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#adb5bd" />
            </TouchableOpacity>
          )}

          {error && (
            <View style={styles.errorBox}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
              <TouchableOpacity onPress={() => loadAnalytics()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Ponów</Text>
              </TouchableOpacity>
            </View>
          )}

          <Animated.View style={{ opacity: cardsOpacity, transform: [{ translateY: cardsTranslateY }] }}>
            
            {/* RENTOWNOŚĆ: Widoczna tylko dla Menedżera */}
            {!isChef && profitabilityReport && (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#f0f9ff', borderLeftColor: '#2ecc71' }]}
                onPress={() => navigation.navigate('DetailedKPI')}
              >
                <View style={styles.cardHeader}>
                  <TrendingUp size={24} color="#2ecc71" />
                  <Text style={styles.cardTitle}>Rentowność bieżąca</Text>
                </View>
                <View style={styles.cardMetrics}>
                  <View>
                    <Text style={styles.metricLabel}>Przychód</Text>
                    <Text style={[styles.metricValue, { color: '#2ecc71' }]}>
                      {formatPrice(profitabilityReport.totalRevenue || 0)} PLN
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.metricLabel}>Zysk</Text>
                    <Text style={[styles.metricValue, { color: '#2ecc71' }]}>
                      {formatPrice(profitabilityReport.totalProfit || 0)} PLN
                    </Text>
                  </View>
                </View>
                <View style={styles.marginBadge}>
                  <Text style={styles.marginBadgeText}>
                    Marża: {formatPercent(profitabilityReport.profitMargin || 0)}%
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* RAPORT ODPADÓW: Szef kuchni widzi jako statyczną kartę, Menedżer jako klikalną */}
            {wasteReport && (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#fff5f5', borderLeftColor: '#fa5252' }]}
                onPress={!isChef ? () => navigation.navigate('DetailedKPI') : undefined}
                activeOpacity={!isChef ? 0.2 : 1} // Brak animacji kliknięcia dla Szefa
              >
                <View style={styles.cardHeader}>
                  <AlertTriangle size={24} color="#fa5252" />
                  <Text style={styles.cardTitle}>Zgłoszone straty</Text>
                </View>
                <View style={styles.cardMetrics}>
                  <View>
                    <Text style={styles.metricLabel}>Łączna wartość strat</Text>
                    <Text style={[styles.metricValue, { color: '#fa5252' }]}>
                      {formatPrice(wasteReport.totalWaste || 0)} PLN
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.metricLabel}>% strat</Text>
                    <Text style={[styles.metricValue, { color: '#fa5252' }]}>
                      {formatPercent(wasteReport.wastePercentage || 0)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* STATUS MAGAZYNU: Szef kuchni widzi jako statyczną kartę */}
            {inventoryHealth && (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: '#f8f9fa', borderLeftColor: '#3498db' }]}
                onPress={!isChef ? () => navigation.navigate('DetailedKPI') : undefined}
                activeOpacity={!isChef ? 0.2 : 1}
              >
                <View style={styles.cardHeader}>
                  <Package size={24} color="#3498db" />
                  <Text style={styles.cardTitle}>Status magazynu</Text>
                </View>
                <View style={styles.cardMetrics}>
                  <View>
                    <Text style={styles.metricLabel}>Ilość unikalnych pozycji</Text>
                    <Text style={[styles.metricValue, { color: '#3498db' }]}>
                      {inventoryHealth.totalItems || 0}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.metricLabel}>Zamrożony kapitał</Text>
                    <Text style={[styles.metricValue, { color: '#3498db' }]}>
                      {formatPrice(inventoryHealth.totalValue || 0)} PLN
                    </Text>
                  </View>
                </View>
                {inventoryHealth.criticalLevels && inventoryHealth.criticalLevels.length > 0 && (
                  <View style={styles.criticalAlertBox}>
                    <AlertTriangle size={14} color="#fa5252" />
                    <Text style={styles.criticalAlertText}>
                      {inventoryHealth.criticalLevels.length} pozycji na krytycznym poziomie!
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* BESTSELLERY: Szef kuchni widzi popularność potraw, ale nie widzi generowanego przez nie zysku w PLN */}
            {profitabilityReport?.topRecipes && profitabilityReport.topRecipes.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.recipesSectionTitle}>Bestsellery (Najlepsze Przepisy)</Text>
                {profitabilityReport.topRecipes.slice(0, 5).map((recipe: any, idx: number) => (
                  <View key={idx} style={styles.recipeCard}>
                    <View style={styles.recipeCardInner}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recipeName}>{recipe.name}</Text>
                        {!isChef && (
                          <Text style={styles.recipeProfit}>Zysk: {formatPrice(recipe.profit)} PLN</Text>
                        )}
                      </View>
                      <View style={styles.recipeQuantityBox}>
                        <Text style={styles.recipeQuantityText}>{formatInteger(recipe.quantity)} sprzedanych</Text>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  
  kpiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#f1f3f5' },
  kpiButtonLeft: { flexDirection: 'row', alignItems: 'center' },
  kpiIconWrapper: { backgroundColor: '#2b8a3e', padding: 12, borderRadius: 12 },
  kpiButtonTitle: { fontSize: 16, fontWeight: '700', color: '#212529' },
  kpiButtonSub: { fontSize: 13, color: '#868e96', marginTop: 2 },
  
  errorBox: { backgroundColor: '#fff5f5', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { color: '#c92a2a', fontSize: 14, fontWeight: '500' },
  retryButton: { backgroundColor: '#fa5252', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  retryButtonText: { color: 'white', fontSize: 12, fontWeight: '700' },
  
  card: { padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#333' },
  cardMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metricLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: 'bold' },
  marginBadge: { backgroundColor: 'rgba(46, 204, 113, 0.1)', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  marginBadgeText: { fontSize: 12, color: '#2ecc71', fontWeight: '700' },
  criticalAlertBox: { marginTop: 12, backgroundColor: '#fff5f5', padding: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  criticalAlertText: { fontSize: 12, color: '#c92a2a', fontWeight: '600', marginLeft: 6 },
  
  recipesSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#212529' },
  recipeCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#f1c40f', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  recipeCardInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeName: { fontSize: 15, fontWeight: '600', color: '#343a40' },
  recipeProfit: { fontSize: 13, color: '#868e96', marginTop: 4 },
  recipeQuantityBox: { alignItems: 'flex-end', backgroundColor: '#f8f9fa', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  recipeQuantityText: { fontSize: 13, fontWeight: '700', color: '#495057' },
});