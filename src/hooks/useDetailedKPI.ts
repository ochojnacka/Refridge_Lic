import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export type TabType = 'waste' | 'revenue' | 'inventory' | 'roi';
export type RangeType = '7days' | '30days' | 'all';

export function useDetailedKPI() {
  const [activeTab, setActiveTab] = useState<TabType>('waste');
  const [range, setRange] = useState<RangeType>('30days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [wasteData, setWasteData] = useState<any>(null);
  const [profitData, setProfitData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [roiData, setRoiData] = useState<any>(null);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Zrównoleglone pobieranie danych dla najwyższej wydajności
      const [wasteRes, profitRes, invRes, roiRes] = await Promise.all([
        apiClient.getWasteReport(range),
        apiClient.getProfitabilityReport(range),
        apiClient.getInventoryHealth(),
        apiClient.getInvestmentAppraisal()
      ]);

      // Sprawdzenie czy którykolwiek z requestów zwrócił błąd
      if (wasteRes.error || profitRes.error || invRes.error || roiRes.error) {
        setError('Niektóre raporty nie zostały załadowane poprawnie. Dane mogą być niekompletne.');
      }

      if (wasteRes.data) setWasteData(wasteRes.data);
      if (profitRes.data) setProfitData(profitRes.data);
      if (invRes.data) setInventoryData(invRes.data);
      if (roiRes.data) setRoiData(roiRes.data);

    } catch (err) {
      console.error('Failed to load KPI data', err);
      setError('Błąd sieci. Proszę sprawdzić połączenie z internetem.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  // Automatyczne przeładowanie po zmianie zakresu czasu (range)
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    activeTab,
    setActiveTab,
    range,
    setRange,
    loading,
    refreshing,
    error,
    wasteData,
    profitData,
    inventoryData,
    roiData,
    loadData
  };
}