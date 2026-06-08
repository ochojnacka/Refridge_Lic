import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { TrendingUp, PieChart, Package, DollarSign, AlertTriangle } from 'lucide-react-native';

import { AppHeader } from '../components/AppHeader';
import { formatPrice } from '../utils/formatting';
import { useDetailedKPI, RangeType } from '../hooks/useDetailedKPI';

export function DetailedKPIScreen({ navigation }: any) {
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
            {r === '7days' ? '7 dni' : r === '30days' ? '30 dni' : 'Cały czas'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={{ paddingHorizontal: 16 }}>
      <TouchableOpacity style={[styles.tab, activeTab === 'waste' && styles.tabActive]} onPress={() => setActiveTab('waste')}>
        <PieChart size={18} color={activeTab === 'waste' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'waste' && styles.tabTextActive]}>Raport strat</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.tab, activeTab === 'revenue' && styles.tabActive]} onPress={() => setActiveTab('revenue')}>
        <TrendingUp size={18} color={activeTab === 'revenue' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'revenue' && styles.tabTextActive]}>Rentowność</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.tab, activeTab === 'inventory' && styles.tabActive]} onPress={() => setActiveTab('inventory')}>
        <Package size={18} color={activeTab === 'inventory' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>Magazyn</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.tab, activeTab === 'roi' && styles.tabActive]} onPress={() => setActiveTab('roi')}>
        <DollarSign size={18} color={activeTab === 'roi' ? '#2ecc71' : '#868e96'} />
        <Text style={[styles.tabText, activeTab === 'roi' && styles.tabTextActive]}>Inwestycja</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // --- ZAKŁADKI ---
  const renderWasteTab = () => {
    if (!wasteData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Wskaźnik strat żywności</Text>
          <Text style={[styles.cardValueMain, { color: '#fa5252' }]}>{wasteData.wastePercentage || 0}%</Text>
          <Text style={styles.cardSubText}>Łączna strata finansowa: {formatPrice(wasteData.totalWaste || 0)} PLN</Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataCardTitle}>Struktura strat</Text>
          <View style={styles.barChartContainer}>
            <View style={styles.barChartLabelRow}>
              <Text style={styles.barLabel}>Upływ terminu ważności</Text>
              <Text style={styles.barValue}>65%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '65%', backgroundColor: '#fa5252' }]} />
            </View>

            <View style={styles.barChartLabelRow}>
              <Text style={styles.barLabel}>Uszkodzony produkt</Text>
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
    const revenue = profitData.totalRevenue || 0;
    const profit = profitData.totalProfit || 0;
    const cost = revenue - profit;

    const maxBarHeight = 120;
    const revenueHeight = revenue > 0 ? maxBarHeight : 0;
    const costHeight = revenue > 0 ? (cost / revenue) * maxBarHeight : 0;
    const profitHeight = revenue > 0 ? (profit / revenue) * maxBarHeight : 0;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Marża zysku brutto</Text>
          <Text style={[styles.cardValueMain, { color: margin > 60 ? '#2ecc71' : '#f39c12' }]}>
            {margin}%
          </Text>
          <Text style={styles.cardSubText}>Całkowity przychód: {formatPrice(revenue)} PLN</Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataCardTitle}>Przychód vs Koszty - Podział</Text>
          
          <View style={styles.comparisonContainer}>
             <View style={styles.comparisonColumn}>
                <View style={[styles.comparisonBar, { height: revenueHeight, backgroundColor: '#2ecc71' }]} />
                <Text style={styles.comparisonValue}>{formatPrice(revenue)}</Text>
                <Text style={styles.comparisonLabel}>Przychód</Text>
             </View>
             
             <View style={styles.comparisonColumn}>
                <View style={[styles.comparisonBar, { height: costHeight, backgroundColor: '#fa5252' }]} />
                <Text style={styles.comparisonValue}>{formatPrice(cost)}</Text>
                <Text style={styles.comparisonLabel} numberOfLines={1} adjustsFontSizeToFit>Koszt surowca</Text>
             </View>
             
             <View style={styles.comparisonColumn}>
                <View style={[styles.comparisonBar, { height: profitHeight, backgroundColor: '#3498db' }]} />
                <Text style={styles.comparisonValue}>{formatPrice(profit)}</Text>
                <Text style={styles.comparisonLabel}>Zysk brutto</Text>
             </View>
          </View>

          <View style={{ marginTop: 24, backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#adb5bd' }}>
            <Text style={{ fontSize: 13, color: '#495057', lineHeight: 20 }}>
              💡 <Text style={{ fontWeight: '700' }}>Jak analizować ten wykres?</Text>{"\n\n"}
              Pierwszy słupek to <Text style={{ fontWeight: '700' }}>Całkowity Przychód</Text> (100% gotówki). Dzieli się on na dwa elementy obrazowane przez mniejsze słupki:{"\n"}
              • <Text style={{ fontWeight: '700', color: '#fa5252' }}>Koszt surowca (Food Cost)</Text> – sumę wydaną na składniki.{"\n"}
              • <Text style={{ fontWeight: '700', color: '#3498db' }}>Zysk brutto</Text> – marżę, która zostaje po odliczeniu kosztów żywności.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderInventoryTab = () => {
    if (!inventoryData) return null;

    const categoryColors = ['#e74c3c', '#f1c40f', '#2ecc71', '#95a5a6', '#9b59b6'];

    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Wartość zamrożonego kapitału</Text>
          <Text style={[styles.cardValueMain, { color: '#3498db' }]}>{formatPrice(inventoryData.totalValue || 0)} PLN</Text>
          <Text style={styles.cardSubText}>{inventoryData.totalItems || 0} unikalnych SKU w magazynie</Text>
        </View>

        {/* 1. LISTA KRYTYCZNYCH PRODUKTÓW */}
        {inventoryData.criticalLevels && inventoryData.criticalLevels.length > 0 ? (
          <View style={styles.criticalListContainer}>
            <Text style={styles.sectionHeader}>⚠️ Produkty wymagające zamówienia</Text>
            {inventoryData.criticalLevels.map((item: any, index: number) => (
              <View key={index} style={styles.criticalRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.itemStock}>
                    Aktualny stan: {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'CRITICAL' && { backgroundColor: '#fff5f5', borderColor: '#ffc9c9' }]}>
                  <Text style={[styles.statusText, item.status === 'CRITICAL' && { color: '#c92a2a' }]}>
                    {item.status === 'CRITICAL' ? 'Krytyczny' : 'Niski'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Wszystkie stany magazynowe w normie.</Text>
          </View>
        )}

        {/* 2. WYKRES STRUKTURY KAPITAŁU */}
        {inventoryData.categoryBreakdown && inventoryData.categoryBreakdown.length > 0 && (
          <View style={[styles.dataCard, { marginTop: 20 }]}>
            <Text style={styles.dataCardTitle}>Struktura kapitału wg kategorii</Text>
            <View style={styles.barChartContainer}>
              {inventoryData.categoryBreakdown.map((item: any, idx: number) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <View style={styles.barChartLabelRow}>
                    <Text style={styles.barLabel}>{item.category}</Text>
                    <Text style={styles.barValue}>{item.percentage}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${item.percentage}%`, backgroundColor: categoryColors[idx % categoryColors.length] }]} />
                  </View>
                </View>
              ))}
            </View>
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
          <Text style={styles.cardSubText}>Wartość bieżąca netto inwestycji w oprogramowanie</Text>
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
            <Text style={styles.parameterValue}>{roiData.paybackMonths || '8.5'} miesiąca</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Zaawansowana Analityka" onBack={() => navigation.goBack()} />

      <View style={styles.headerArea}>
        <Text style={styles.headerSub}>Wskaźniki efektywności (KPI)</Text>
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
        {error && (
          <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: '#fff5f5', padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#fa5252', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#c92a2a', fontSize: 13, flex: 1 }}>{error}</Text>
            <TouchableOpacity 
              onPress={() => loadData()}
              style={{ backgroundColor: '#fa5252', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Ponów</Text>
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
  rangeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e9ecef' },
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
  comparisonColumn: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
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
  criticalListContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: '#212529' },
  criticalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#212529' },
  itemStock: { fontSize: 13, color: '#868e96', marginTop: 4 },
  statusBadge: { backgroundColor: '#fff9db', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ffec99' },
  statusText: { fontSize: 12, color: '#f59f00', fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#868e96', fontStyle: 'italic' },
});