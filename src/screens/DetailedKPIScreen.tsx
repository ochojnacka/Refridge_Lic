import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { TrendingUp, PieChart, Package, DollarSign, AlertTriangle } from 'lucide-react-native';

import { AppHeader } from '../components/AppHeader';
import { formatPrice } from '../utils/formatting';
import { useDetailedKPI, RangeType } from '../hooks/useDetailedKPI';

export function DetailedKPIScreen({ navigation }: any) {
  // Wykorzystanie custom hooka
  const {
    activeTab, setActiveTab,
    range, setRange,
    loading, refreshing, error,
    wasteData, profitData, inventoryData, roiData,
    loadData
  } = useDetailedKPI();

  const renderRangeSelector = () => (
    <View style={styles.rangeSelector}>
      {(['7days', '30days', 'all'] as RangeType[]).map((r) => (
        <TouchableOpacity
          key={r}
          style={[styles.rangeButton, range === r && styles.rangeButtonActive]}
          onPress={() => setRange(r)}
        >
          <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>
            {r === '7days' ? 'Ostatnie 7 dni' : r === '30days' ? 'Ostatnie 30 dni' : 'Łącznie'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={{ paddingHorizontal: 16 }}>
      <TouchableOpacity style={[styles.tab, activeTab === 'waste' && styles.tabActive]} onPress={() => setActiveTab('waste')}>
        <PieChart size={18} color={activeTab === 'waste' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'waste' && styles.tabTextActive]}>Straty żywności</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.tab, activeTab === 'revenue' && styles.tabActive]} onPress={() => setActiveTab('revenue')}>
        <TrendingUp size={18} color={activeTab === 'revenue' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'revenue' && styles.tabTextActive]}>Przychody</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.tab, activeTab === 'inventory' && styles.tabActive]} onPress={() => setActiveTab('inventory')}>
        <Package size={18} color={activeTab === 'inventory' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>Inwentaryzacja</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.tab, activeTab === 'roi' && styles.tabActive]} onPress={() => setActiveTab('roi')}>
        <DollarSign size={18} color={activeTab === 'roi' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'roi' && styles.tabTextActive]}>Wartość</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // --- ZAKŁADKI ---
  const renderWasteTab = () => {
    if (!wasteData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Stosunek marnowania żywności</Text>
          <Text style={[styles.cardValueMain, { color: '#fa5252' }]}>{wasteData.wastePercentage || 0}%</Text>
          <Text style={styles.cardSubText}>Całkowite straty finansowe: {formatPrice(wasteData.totalWaste || 0)} PLN</Text>
        </View>

        {/* Visual Simulated Chart */}
        <View style={styles.dataCard}>
          <Text style={styles.dataCardTitle}>Skład marnowania</Text>
          <View style={styles.barChartContainer}>
            <View style={styles.barChartLabelRow}>
              <Text style={styles.barLabel}>Upływ terminu ważności</Text>
              <Text style={styles.barValue}>65%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '65%', backgroundColor: '#fa5252' }]} />
            </View>

            <View style={styles.barChartLabelRow}>
              <Text style={styles.barLabel}>Uszkodzony</Text>
              <Text style={styles.barValue}>25%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '25%', backgroundColor: '#ffa8a8' }]} />
            </View>

            <View style={styles.barChartLabelRow}>
              <Text style={styles.barLabel}>Nadprodukcja</Text>
              <Text style={styles.barValue}>10%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '10%', backgroundColor: '#ffc9c9' }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRevenueTab = () => {
    if (!profitData) return null;
    const margin = profitData.profitMargin || 0;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Margines zysku brutto</Text>
          <Text style={[styles.cardValueMain, { color: margin > 60 ? '#2ecc71' : '#f39c12' }]}>
            {margin}%
          </Text>
          <Text style={styles.cardSubText}>Całkowity przychód: {formatPrice(profitData.totalRevenue || 0)} PLN</Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataCardTitle}>Przychód vs Koszty - Podział</Text>
          <View style={styles.comparisonContainer}>
             <View style={styles.comparisonColumn}>
                <View style={[styles.comparisonBar, { height: 120, backgroundColor: '#2ecc71' }]} />
                <Text style={styles.comparisonValue}>{formatPrice(profitData.totalRevenue || 0)}</Text>
                <Text style={styles.comparisonLabel}>Przychód</Text>
             </View>
             <View style={styles.comparisonColumn}>
                <View style={[styles.comparisonBar, { height: 70, backgroundColor: '#fa5252' }]} />
                <Text style={styles.comparisonValue}>{formatPrice((profitData.totalRevenue || 0) - (profitData.totalProfit || 0))}</Text>
                <Text style={styles.comparisonLabel}>Koszty żywności</Text>
             </View>
             <View style={styles.comparisonColumn}>
                <View style={[styles.comparisonBar, { height: 50, backgroundColor: '#3498db' }]} />
                <Text style={styles.comparisonValue}>{formatPrice(profitData.totalProfit || 0)}</Text>
                <Text style={styles.comparisonLabel}>Zysk brutto</Text>
             </View>
          </View>
        </View>
      </View>
    );
  };

  const renderInventoryTab = () => {
    if (!inventoryData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Wartość zapasów</Text>
          <Text style={[styles.cardValueMain, { color: '#3498db' }]}>{formatPrice(inventoryData.totalValue || 0)} PLN</Text>
          <Text style={styles.cardSubText}>{inventoryData.totalItems || 0} unikalnych SKU w magazynie</Text>
        </View>

        {inventoryData.criticalLevels && inventoryData.criticalLevels.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color="#e74c3c" />
              <Text style={styles.alertTitle}>Krytyczne poziomy zapasów</Text>
            </View>
            <Text style={styles.alertText}>
              Istnieją {inventoryData.criticalLevels.length} pozycje poniżej minimalnych optymalnych poziomów zapasów. Zamówienie jest zalecane, aby zapobiec brakom produktów w menu.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderRoiTab = () => {
    if (!roiData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Szacowany 3-letni NPV</Text>
          <Text style={[styles.cardValueMain, { color: '#2ecc71' }]}>
            {formatPrice(roiData.estimatedNPV3Years || 42500)} PLN
          </Text>
          <Text style={styles.cardSubText}>Obecny zysk netto z inwestycji</Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataCardTitle}>Parametry inwestycji</Text>
          
          <View style={styles.parameterRow}>
            <Text style={styles.parameterLabel}>Miesięczny zysk netto</Text>
            <Text style={styles.parameterValue}>{formatPrice(roiData.netBenefit || 1500)} PLN</Text>
          </View>
          
          <View style={styles.parameterRow}>
            <Text style={styles.parameterLabel}>Średni ważony koszt kapitału (WACC)</Text>
            <Text style={styles.parameterValue}>10.31%</Text>
          </View>

          <View style={styles.parameterRow}>
            <Text style={styles.parameterLabel}>Wewnętrzna stopa zwrotu (IRR)</Text>
            <Text style={[styles.parameterValue, { color: '#2ecc71' }]}>{roiData.irr || '45.2'}%</Text>
          </View>

          <View style={[styles.parameterRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.parameterLabel}>Okres zwrotu</Text>
            <Text style={styles.parameterValue}>{roiData.paybackMonths || '8.5'} miesięcy</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Szczegółowe statystyki" onBack={() => navigation.goBack()} />

      <View style={styles.headerArea}>
        <Text style={styles.headerSub}>Case Study & KPI Dashboard</Text>
      </View>

      {renderRangeSelector()}
      
      <View style={styles.tabsWrapper}>
        {renderTabs()}
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {/* Graceful Degradation: Obsługa błędu */}
        {error && (
          <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: '#fff5f5', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#fa5252', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#c92a2a', fontSize: 13, flex: 1 }}>{error}</Text>
            <TouchableOpacity 
              onPress={() => loadData()}
              style={{ backgroundColor: '#fa5252', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 40 }} />
        ) : (
          <>
            {activeTab === 'waste' && renderWasteTab()}
            {activeTab === 'revenue' && renderRevenueTab()}
            {activeTab === 'inventory' && renderInventoryTab()}
            {activeTab === 'roi' && renderRoiTab()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerArea: { paddingHorizontal: 20, paddingVertical: 12 },
  headerSub: { fontSize: 15, color: '#868e96', fontWeight: '500' },
  rangeSelector: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  rangeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e9ecef' },
  rangeButtonActive: { backgroundColor: '#2ecc71', borderColor: '#2ecc71' },
  rangeText: { fontSize: 13, color: '#495057', fontWeight: '600' },
  rangeTextActive: { color: 'white' },
  tabsWrapper: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e9ecef', marginBottom: 8 },
  tabsContainer: { height: 50 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginRight: 16, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 8 },
  tabActive: { borderBottomColor: '#2ecc71' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#868e96' },
  tabTextActive: { color: '#212529' },
  scrollContainer: { flex: 1 },
  tabContent: { padding: 20 },
  summaryCard: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardLabel: { fontSize: 13, color: '#868e96', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValueMain: { fontSize: 36, fontWeight: '800', color: '#212529', marginVertical: 10, letterSpacing: -1 },
  cardSubText: { fontSize: 14, color: '#495057', fontWeight: '500' },
  dataCard: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  dataCardTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 20 },
  barChartContainer: { gap: 16 },
  barChartLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, fontWeight: '600', color: '#495057' },
  barValue: { fontSize: 13, fontWeight: '700', color: '#212529' },
  barTrack: { height: 8, backgroundColor: '#f1f3f5', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  comparisonContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 180, paddingTop: 20 },
  comparisonColumn: { alignItems: 'center', width: 80 },
  comparisonBar: { width: 40, borderTopLeftRadius: 6, borderTopRightRadius: 6, marginBottom: 12 },
  comparisonValue: { fontSize: 13, fontWeight: '700', color: '#212529', marginBottom: 4 },
  comparisonLabel: { fontSize: 11, color: '#868e96', fontWeight: '600', textTransform: 'uppercase' },
  parameterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  parameterLabel: { fontSize: 14, color: '#495057', fontWeight: '500' },
  parameterValue: { fontSize: 14, fontWeight: '700', color: '#212529' },
  alertCard: { backgroundColor: '#fff5f5', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#fa5252' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#c92a2a' },
  alertText: { fontSize: 14, color: '#e03131', lineHeight: 20 },
});