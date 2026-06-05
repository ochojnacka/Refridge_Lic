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
  totalValue: number; // PLN
  stockTurnoverDays: number;
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
      const category = log.item?.category || 'Other';
      wasteByCategory[category] = (wasteByCategory[category] || 0) + (log.value || 0);
    }

    // Top wasted items
    const byItem = new Map<string, { itemName: string; quantity: number; value: number; reason: string }>();
    for (const log of logs) {
      if (!byItem.has(log.itemId)) {
        byItem.set(log.itemId, {
          itemName: log.item?.name || 'Unknown',
          quantity: 0,
          value: 0,
          reason: log.reason || 'Expired',
        });
      }
      const record = byItem.get(log.itemId)!;
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

    const criticalLevels = items
      .filter(item => item.quantity < 30)
      .map(item => ({
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.quantity < 10 ? ('CRITICAL' as const) : ('LOW' as const),
      }))
      .sort((a, b) => a.quantity - b.quantity);

    // Calculate Stock Turnover Days based on last 30 days COGS
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.recipe', 'recipe')
      .where('sale.restaurantId = :restaurantId', { restaurantId })
      .andWhere('sale.timestamp >= :from', { from: thirtyDaysAgo })
      .getMany();

    const monthlyCOGS = sales.reduce((sum, s) => sum + (s.quantity * (s.recipe?.costPrice || 0)), 0);
    const stockTurnoverDays = monthlyCOGS > 0 ? (totalValue / (monthlyCOGS / 30)) : 0;

    return {
      totalItems: items.length,
      totalValue: Math.round(totalValue * 100) / 100,
      stockTurnoverDays: Math.round(stockTurnoverDays * 10) / 10,
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