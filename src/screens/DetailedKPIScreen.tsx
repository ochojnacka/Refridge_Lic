import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, PieChart, Package, DollarSign } from 'lucide-react-native';
import { apiClient } from '../api/client';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { formatPrice } from '../utils/formatting';

type TabType = 'waste' | 'revenue' | 'inventory' | 'roi';
type RangeType = '7days' | '30days' | 'all';

export function DetailedKPIScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('waste');
  const [range, setRange] = useState<RangeType>('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [wasteData, setWasteData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [roiData, setRoiData] = useState<any>(null);

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [wasteRes, profitRes, invRes, roiRes] = await Promise.all([
        apiClient.getWasteReport(range),
        apiClient.getProfitabilityReport(range),
        apiClient.getInventoryHealth(),
        apiClient.getInvestmentAppraisal()
      ]);

      if (wasteRes.data) setWasteData(wasteRes.data);
      if (profitRes.data) setProfitData(profitRes.data);
      if (invRes.data) setInventoryData(invRes.data);
      if (roiRes.data) setRoiData(roiRes.data);

    } catch (error) {
      console.error('Failed to load KPI data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range]); // Przeładuj przy zmianie zakresu czasu

  // Komponenty pomocnicze UI
  const renderRangeSelector = () => (
    <View style={styles.rangeSelector}>
      {(['7days', '30days', 'all'] as RangeType[]).map((r) => (
        <TouchableOpacity
          key={r}
          style={[styles.rangeButton, range === r && styles.rangeButtonActive]}
          onPress={() => setRange(r)}
        >
          <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>
            {r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : 'All Time'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
      <TouchableOpacity style={[styles.tab, activeTab === 'waste' && styles.tabActive]} onPress={() => setActiveTab('waste')}>
        <PieChart size={20} color={activeTab === 'waste' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'waste' && styles.tabTextActive]}>Waste</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.tab, activeTab === 'revenue' && styles.tabActive]} onPress={() => setActiveTab('revenue')}>
        <TrendingUp size={20} color={activeTab === 'revenue' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'revenue' && styles.tabTextActive]}>Revenue</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.tab, activeTab === 'inventory' && styles.tabActive]} onPress={() => setActiveTab('inventory')}>
        <Package size={20} color={activeTab === 'inventory' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>Inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.tab, activeTab === 'roi' && styles.tabActive]} onPress={() => setActiveTab('roi')}>
        <DollarSign size={20} color={activeTab === 'roi' ? COLORS.primary : COLORS.textSecondary} />
        <Text style={[styles.tabText, activeTab === 'roi' && styles.tabTextActive]}>ROI</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // --- ZAKŁADKI ---
  const renderWasteTab = () => {
    if (!wasteData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Food Waste Percentage</Text>
          <Text style={styles.cardValueMain}>{wasteData.wastePercentage}%</Text>
          <Text style={styles.cardSubText}>Total value lost: {formatPrice(wasteData.totalWaste)}</Text>
        </View>
        <View style={styles.chartContainer}>
           <Text style={styles.chartTitle}>Waste Trend (Placeholder)</Text>
           {/* Tutaj wstawimy LineChart */}
        </View>
      </View>
    );
  };

  const renderRevenueTab = () => {
    if (!profitData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Profit Margin</Text>
          <Text style={[styles.cardValueMain, { color: '#28A745' }]}>{profitData.profitMargin}%</Text>
          <Text style={styles.cardSubText}>Total Revenue: {formatPrice(profitData.totalRevenue)}</Text>
        </View>
        <View style={styles.chartContainer}>
           <Text style={styles.chartTitle}>Revenue Trend (Placeholder)</Text>
           {/* Tutaj wstawimy BarChart */}
        </View>
      </View>
    );
  };

  const renderInventoryTab = () => {
    if (!inventoryData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Stock Turnover</Text>
          <Text style={styles.cardValueMain}>{inventoryData.stockTurnoverDays} Days</Text>
          <Text style={styles.cardSubText}>Total inventory value: {formatPrice(inventoryData.totalValue)}</Text>
        </View>
      </View>
    );
  };

  const renderRoiTab = () => {
    if (!roiData) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Estimated 3-Year NPV</Text>
          <Text style={[styles.cardValueMain, { color: COLORS.primary }]}>{formatPrice(roiData.estimatedNPV3Years)}</Text>
          <Text style={styles.cardSubText}>Monthly Net Benefit: {formatPrice(roiData.netBenefit)}</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advanced Analytics</Text>
        <Text style={styles.headerSub}>Case Study KPIs</Text>
      </View>

      {renderRangeSelector()}
      
      <View style={{ height: 60 }}>
        {renderTabs()}
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {activeTab === 'waste' && renderWasteTab()}
        {activeTab === 'revenue' && renderRevenueTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'roi' && renderRoiTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rangeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rangeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rangeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rangeTextActive: {
    color: 'white',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardValueMain: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 8,
  },
  cardSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});