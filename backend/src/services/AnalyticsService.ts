import { AppDataSource } from '../database';
import { WasteLog } from '../models/WasteLog';
import { Sale } from '../models/Sale';
import { InventoryItem } from '../models/InventoryItem';
import { Recipe } from '../models/Recipe';

export interface WasteReport {
  totalWaste: number; // PLN
  totalQuantity: number; // kg/units
  wastePercentage: number; // %
  topWastedItems: Array<{ itemName: string; quantity: number; value: number; reason: string }>;
  wasteByCategory: Record<string, number>;
  trend: Array<{ date: string; waste: number }>;
}

export interface ProfitabilityReport {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number; // %
  topRecipes: Array<{ name: string; revenue: number; cost: number; profit: number; quantity: number }>;
  bottomRecipes: Array<{ name: string; revenue: number; cost: number; profit: number; quantity: number }>;
  trend: Array<{ date: string; revenue: number }>;
}

export interface InventoryHealthReport {
  totalItems: number;
  totalValue: number;
  stockTurnoverDays: number;
  turnoverRatio: number;
  estimatedDepletionDays: number;
  categoryBreakdown: Array<{ category: string; value: number; percentage: number }>; // NOWE: Struktura kapitału
  criticalLevels: Array<{ itemName: string; quantity: number; unit: string; status: 'CRITICAL' | 'LOW' | 'OK' }>;
}

export interface InvestmentAppraisal {
  monthlySavings: number;
  monthlySaaSCost: number;
  netBenefit: number;
  estimatedNPV3Years: number;
}

export class AnalyticsService {
  private wasteRepository = AppDataSource.getRepository(WasteLog);
  private saleRepository = AppDataSource.getRepository(Sale);
  private inventoryRepository = AppDataSource.getRepository(InventoryItem);
  private recipeRepository = AppDataSource.getRepository(Recipe);

  async getWasteReport(restaurantId: string, rangeDays: number = 30): Promise<WasteReport> {
    const now = new Date();
    const from = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const logs = await this.wasteRepository
      .createQueryBuilder('waste')
      .leftJoinAndSelect('waste.item', 'item')
      .where('waste.restaurantId = :restaurantId', { restaurantId })
      .andWhere('waste.timestamp >= :from', { from })
      .getMany();

    const totalWaste = logs.reduce((sum, l) => sum + (l.value || 0), 0);
    const totalQuantity = logs.reduce((sum, l) => sum + l.quantity, 0);

    // Waste by category
    const wasteByCategory: Record<string, number> = {};
    for (const log of logs) {
      const category = log.item?.category || 'Inne';
      wasteByCategory[category] = (wasteByCategory[category] || 0) + (log.value || 0);
    }

    // Top wasted items
    const byItem = new Map<string, { itemName: string; quantity: number; value: number; reason: string }>();
    for (const log of logs) {
      // TWORZYMY KLUCZ: Jeśli itemId to null (produkt usunięty), używamy klucza 'usuniety'
      const itemIdKey = log.itemId || 'usuniety'; 

      if (!byItem.has(itemIdKey)) {
        byItem.set(itemIdKey, {
          // Jeśli nie ma produktu, nazywamy go w raporcie "Produkt usunięty"
          itemName: log.item?.name || 'Produkt usunięty', 
          quantity: 0,
          value: 0,
          reason: log.reason || 'Przeterminowany',
        });
      }
      const record = byItem.get(itemIdKey)!;
      record.quantity += log.quantity;
      record.value += log.value;
    }
    const topWastedItems = Array.from(byItem.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Trend
    const trendMap = new Map<string, number>();
    for (const log of logs) {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + log.value);
    }
    
    // Fill empty days for the trend
    const trend: Array<{ date: string; waste: number }> = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      trend.push({ date: dateStr, waste: Math.round((trendMap.get(dateStr) || 0) * 100) / 100 });
    }

    // Waste percentage (waste value / estimated COGS + waste)
    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.recipe', 'recipe')
      .where('sale.restaurantId = :restaurantId', { restaurantId })
      .andWhere('sale.timestamp >= :from', { from })
      .getMany();
      
    const totalCOGS = sales.reduce((sum, s) => sum + (s.quantity * (s.recipe?.costPrice || 0)), 0);
    const wastePercentage = (totalCOGS + totalWaste) > 0 ? (totalWaste / (totalCOGS + totalWaste)) * 100 : 0;

    return {
      totalWaste: Math.round(totalWaste * 100) / 100,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      wastePercentage: Math.round(wastePercentage * 100) / 100,
      topWastedItems,
      wasteByCategory,
      trend,
    };
  }

  async getProfitabilityReport(restaurantId: string, rangeDays: number = 30): Promise<ProfitabilityReport> {
    const now = new Date();
    const from = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.recipe', 'recipe')
      .where('sale.restaurantId = :restaurantId', { restaurantId })
      .andWhere('sale.timestamp >= :from', { from })
      .getMany();

    let totalRevenue = 0;
    let totalCost = 0;
    const byRecipe = new Map<string, { name: string; revenue: number; cost: number; quantity: number }>();
    const trendMap = new Map<string, number>();

    for (const sale of sales) {
      totalRevenue += sale.revenue;
      const cost = sale.quantity * (sale.recipe?.costPrice || 0);
      totalCost += cost;

      const dateStr = new Date(sale.timestamp).toISOString().split('T')[0];
      trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + sale.revenue);

      if (sale.recipe) {
        if (!byRecipe.has(sale.recipeId)) {
          byRecipe.set(sale.recipeId, { name: sale.recipe.name, revenue: 0, cost: 0, quantity: 0 });
        }
        const rec = byRecipe.get(sale.recipeId)!;
        rec.revenue += sale.revenue;
        rec.cost += cost;
        rec.quantity += sale.quantity;
      }
    }

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const recipesList = Array.from(byRecipe.values()).map(r => ({
      name: r.name,
      revenue: Math.round(r.revenue * 100) / 100,
      cost: Math.round(r.cost * 100) / 100,
      profit: Math.round((r.revenue - r.cost) * 100) / 100,
      quantity: r.quantity,
    }));

    recipesList.sort((a, b) => b.profit - a.profit);
    const topRecipes = recipesList.slice(0, 5);
    const bottomRecipes = [...recipesList].reverse().slice(0, 5);

    const trend: Array<{ date: string; revenue: number }> = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      trend.push({ date: dateStr, revenue: Math.round((trendMap.get(dateStr) || 0) * 100) / 100 });
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      topRecipes,
      bottomRecipes,
      trend,
    };
  }

  async getInventoryHealth(restaurantId: string): Promise<InventoryHealthReport> {
  const items = await this.inventoryRepository.find({ where: { restaurantId } });
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. Obliczanie struktury kapitału (Category Breakdown)
    const categoryTotals: Record<string, number> = {};
    for (const item of items) {
      const cat = item.category || 'Inne';
      const itemValue = item.quantity * item.costPrice;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + itemValue;
    }

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, value]) => ({
        category,
        value: Math.round(value * 100) / 100,
        percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value); // Sortowanie od największej wartości

    // 2. Wyznaczanie poziomów krytycznych
    const criticalLevels = items
    .filter(item => {
      const isLowStock = item.quantity < 10;
      const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= threeDaysFromNow;
      return isLowStock || isExpiringSoon;
    })
    .map(item => {
      const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= threeDaysFromNow;
      return {
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        // Priorytet dla przeterminowania
        status: isExpiringSoon ? ('CRITICAL' as const) : ('LOW' as const),
      };
    })
    .sort((a, b) => a.quantity - b.quantity);

    // 3. Obliczanie wskaźników rotacji (Turnover Ratio) i wyczerpania (Depletion Days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.recipe', 'recipe')
      .where('sale.restaurantId = :restaurantId', { restaurantId })
      .andWhere('sale.timestamp >= :from', { from: thirtyDaysAgo })
      .getMany();

    const monthlyCOGS = sales.reduce((sum, s) => sum + (s.quantity * (s.recipe?.costPrice || 0)), 0);
    
    // Wskaźnik rotacji zapasów: Koszt sprzedanych towarów (COGS) / Wartość magazynu
    const turnoverRatio = totalValue > 0 ? (monthlyCOGS / totalValue) : 0;
    
    // Czas wyczerpania: Ile dni wystarczy obecnych zapasów przy aktualnym średnim dziennym zużyciu
    const dailyCOGS = monthlyCOGS / 30;
    const estimatedDepletionDays = dailyCOGS > 0 ? (totalValue / dailyCOGS) : 0;

    return {
      totalItems: items.length,
      totalValue: Math.round(totalValue * 100) / 100,
      stockTurnoverDays: Math.round(estimatedDepletionDays * 10) / 10,
      turnoverRatio: Math.round(turnoverRatio * 10) / 10,
      estimatedDepletionDays: Math.round(estimatedDepletionDays * 10) / 10,
      categoryBreakdown,
      criticalLevels,
    };
  }

  async getInvestmentAppraisal(restaurantId: string): Promise<InvestmentAppraisal> {
    const WACC = 0.1031; // Wartość 10.31% dla modelu kalkulacji zalecona w ramach weryfikacji WACC
    const monthlySaaSCost = 300; 
    
    // Szacunkowe uśrednione oszczędności miesięczne z tytułu redukcji odpadów (na podstawie baseline studium przypadku)
    const monthlyWasteSavings = 960; 
    const monthlyMarginImprovement = 750;
    const netBenefit = (monthlyWasteSavings + monthlyMarginImprovement) - monthlySaaSCost;

    // Kalkulacja NPV dla przepływów z 3 lat (36 miesięcy)
    let npv = 0;
    const monthlyDiscountRate = Math.pow(1 + WACC, 1 / 12) - 1;

    for (let month = 1; month <= 36; month++) {
      npv += netBenefit / Math.pow(1 + monthlyDiscountRate, month);
    }

    return {
      monthlySavings: monthlyWasteSavings + monthlyMarginImprovement,
      monthlySaaSCost,
      netBenefit,
      estimatedNPV3Years: Math.round(npv * 100) / 100
    };
  }
}