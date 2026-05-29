import { AppDataSource } from '../database';
import { WasteLog } from '../models/WasteLog';
import { Sale } from '../models/Sale';
import { InventoryItem } from '../models/InventoryItem';
import { Recipe } from '../models/Recipe';

export interface WasteReport {
  totalWaste: number; // PLN
  totalQuantity: number; // kg/units
  wastePercentage: number; // % of inventory
  topWastedItems: Array<{
    itemName: string;
    quantity: number;
    value: number;
    reason: string;
  }>;
  wasteByReason: { [key: string]: { count: number; value: number } };
  trend7days: number[]; // Daily waste values
}

export interface ProfitabilityReport {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number; // %
  topRecipes: Array<{
    name: string;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    quantity: number;
  }>;
}

export interface InventoryHealthReport {
  totalItems: number;
  totalValue: number; // PLN
  criticalLevels: Array<{
    itemName: string;
    quantity: number;
    unit: string;
    status: 'CRITICAL' | 'LOW' | 'OK';
  }>;
  expiringItems: Array<{
    itemName: string;
    expiryDate: string;
    daysUntilExpiry: number;
    quantity: number;
  }>;
  averageWastePercentage: number;
}

export interface DemandPattern {
  recipeId: string;
  recipeName: string;
  avgDailyDemand: number;
  peakDays: string[]; // Days of week with highest demand
  trend: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
}

export class AnalyticsService {
  private wasteRepository = AppDataSource.getRepository(WasteLog);
  private saleRepository = AppDataSource.getRepository(Sale);
  private inventoryRepository = AppDataSource.getRepository(InventoryItem);
  private recipeRepository = AppDataSource.getRepository(Recipe);

  /**
   * Get waste report for date range
   */
  async getWasteReport(
    restaurantId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<WasteReport> {
    const now = new Date();
    const from = dateFrom || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo || now;

    const logs = await this.wasteRepository.find({
      where: {
        restaurantId,
        timestamp: from,
      },
    });

    const filteredLogs = logs.filter(l => new Date(l.timestamp) <= to);

    // Calculate totals
    const totalWaste = filteredLogs.reduce((sum, l) => sum + (l.value || 0), 0);
    const totalQuantity = filteredLogs.reduce((sum, l) => sum + l.quantity, 0);

    // Group by item
    const byItem = new Map<string, WasteLog[]>();
    for (const log of filteredLogs) {
      if (!byItem.has(log.itemId)) {
        byItem.set(log.itemId, []);
      }
      byItem.get(log.itemId)!.push(log);
    }

    // Top wasted items
    const topWastedItems = await Promise.all(
      Array.from(byItem.entries())
        .map(async ([itemId, itemLogs]) => {
          const item = await this.inventoryRepository.findOne({ where: { id: itemId } });
          return {
            itemName: item?.name || 'Unknown',
            quantity: itemLogs.reduce((sum, l) => sum + l.quantity, 0),
            value: itemLogs.reduce((sum, l) => sum + (l.value || 0), 0),
            reason: itemLogs[0]?.reason || 'Unknown',
          };
        })
    );

    topWastedItems.sort((a, b) => b.value - a.value);

    // Waste by reason
    const wasteByReason: { [key: string]: { count: number; value: number } } = {};
    for (const log of filteredLogs) {
      const reason = log.reason || 'Unknown';
      if (!wasteByReason[reason]) {
        wasteByReason[reason] = { count: 0, value: 0 };
      }
      wasteByReason[reason].count++;
      wasteByReason[reason].value += log.value || 0;
    }

    // 7-day trend
    const trend7days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayLogs = filteredLogs.filter(
        l => new Date(l.timestamp) >= dayStart && new Date(l.timestamp) < dayEnd
      );

      const dayTotal = dayLogs.reduce((sum, l) => sum + (l.value || 0), 0);
      trend7days.push(Math.round(dayTotal * 100) / 100);
    }

    // Estimate waste percentage (rough: waste value / inventory value)
    const allInventory = await this.inventoryRepository.find({
      where: { restaurantId },
    });
    const inventoryValue = allInventory.reduce(
      (sum, item) => sum + item.quantity * item.costPrice,
      0
    );

    const wastePercentage = inventoryValue > 0 ? (totalWaste / inventoryValue) * 100 : 0;

    return {
      totalWaste: Math.round(totalWaste * 100) / 100,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      wastePercentage: Math.round(wastePercentage * 100) / 100,
      topWastedItems: topWastedItems.slice(0, 5),
      wasteByReason,
      trend7days,
    };
  }

  /**
   * Get profitability report
   */
  async getProfitabilityReport(
    restaurantId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ProfitabilityReport> {
    const now = new Date();
    const from = dateFrom || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo || now;

    const sales = await this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.recipe', 'recipe')
      .where('sale.restaurantId = :restaurantId', { restaurantId })
      .andWhere('sale.timestamp >= :from', { from })
      .andWhere('sale.timestamp <= :to', { to })
      .getMany();

    let totalRevenue = 0;
    let totalCost = 0;

    const byRecipe = new Map<
      string,
      {
        name: string;
        revenue: number;
        cost: number;
        quantity: number;
      }
    >();

    for (const sale of sales) {
      totalRevenue += sale.revenue;

      if (sale.recipe) {
        const cost = sale.quantity * sale.recipe.costPrice;
        totalCost += cost;

        if (!byRecipe.has(sale.recipeId)) {
          byRecipe.set(sale.recipeId, {
            name: sale.recipe.name,
            revenue: 0,
            cost: 0,
            quantity: 0,
          });
        }

        const rec = byRecipe.get(sale.recipeId)!;
        rec.revenue += sale.revenue;
        rec.cost += cost;
        rec.quantity += sale.quantity;
      }
    }

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const topRecipes = Array.from(byRecipe.values())
      .map(r => ({
        name: r.name,
        totalRevenue: Math.round(r.revenue * 100) / 100,
        totalCost: Math.round(r.cost * 100) / 100,
        profit: Math.round((r.revenue - r.cost) * 100) / 100,
        quantity: r.quantity,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
      topRecipes,
    };
  }

  /**
   * Get inventory health report
   */
  async getInventoryHealth(restaurantId: string): Promise<InventoryHealthReport> {
    const items = await this.inventoryRepository.find({
      where: { restaurantId },
    });

    const now = new Date();
    const totalValue = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

    // Critical levels: < 10 units, Low: < 30 units
    const criticalLevels = items
      .filter(item => item.quantity < 30)
      .map(item => ({
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.quantity < 10 ? ('CRITICAL' as const) : ('LOW' as const),
      }))
      .sort((a, b) => a.quantity - b.quantity);

    // Expiring items: within 7 days
    const expiringItems = items
      .filter(item => {
        if (!item.expiryDate) return false;
        const daysUntil =
          (new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= 7;
      })
      .map(item => ({
        itemName: item.name,
        expiryDate: new Date(item.expiryDate!).toISOString().split('T')[0],
        daysUntilExpiry: Math.round(
          (new Date(item.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
        quantity: item.quantity,
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Average waste percentage from inventory
    const avgWaste = items.length > 0 ? items.reduce((sum, i) => sum + i.wastePercentage, 0) / items.length : 0;

    return {
      totalItems: items.length,
      totalValue: Math.round(totalValue * 100) / 100,
      criticalLevels,
      expiringItems,
      averageWastePercentage: Math.round(avgWaste * 100) / 100,
    };
  }

  /**
   * Get demand pattern for recipe
   */
  async getDemandPattern(
    restaurantId: string,
    recipeId: string
  ): Promise<DemandPattern | null> {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId, restaurantId },
    });

    if (!recipe) return null;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sales = await this.saleRepository.find({
      where: {
        restaurantId,
        recipeId,
        timestamp: thirtyDaysAgo,
      },
    });

    // Average daily demand
    const avgDailyDemand = sales.length > 0 ? sales.reduce((sum, s) => sum + s.quantity, 0) / 30 : 0;

    // Peak days (0 = Sunday, 1 = Monday, etc)
    const byDayOfWeek = new Map<number, number>();
    for (const sale of sales) {
      const day = sale.dayOfWeek;
      byDayOfWeek.set(day, (byDayOfWeek.get(day) || 0) + sale.quantity);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDays = Array.from(byDayOfWeek.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => dayNames[day]);

    // 4-week trend
    const now = new Date();
    const trend = {
      week1: 0,
      week2: 0,
      week3: 0,
      week4: 0,
    };

    for (const sale of sales) {
      const daysAgo = (now.getTime() - new Date(sale.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo <= 7) trend.week1 += sale.quantity;
      else if (daysAgo <= 14) trend.week2 += sale.quantity;
      else if (daysAgo <= 21) trend.week3 += sale.quantity;
      else trend.week4 += sale.quantity;
    }

    return {
      recipeId,
      recipeName: recipe.name,
      avgDailyDemand: Math.round(avgDailyDemand * 100) / 100,
      peakDays,
      trend,
    };
  }
}
