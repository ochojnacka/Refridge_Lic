import { Router, Response } from 'express';
import { AppDataSource } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { Sale } from '../models/Sale';

const router = Router();
const saleRepository = AppDataSource.getRepository(Sale);

// POST /sales/record - Record a sale
router.post('/record', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { recipeId, quantity, revenue } = req.body;

    if (!recipeId || quantity === undefined || revenue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get date info
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Create sale
    const sale = saleRepository.create({
      restaurantId: req.user.restaurantId,
      recipeId,
      quantity,
      revenue,
      dayOfWeek,
      dayOfMonth,
      month,
      year,
    });

    await saleRepository.save(sale);

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /sales - Get sales with optional date filtering
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dateFrom, dateTo, recipeId } = req.query;

    let query = saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.recipe', 'recipe')
      .where('sale.restaurantId = :restaurantId', { restaurantId: req.user.restaurantId });

    if (dateFrom) {
      query = query.andWhere('sale.timestamp >= :dateFrom', { dateFrom: new Date(dateFrom as string) });
    }
    if (dateTo) {
      query = query.andWhere('sale.timestamp <= :dateTo', { dateTo: new Date(dateTo as string) });
    }
    if (recipeId) {
      query = query.andWhere('sale.recipeId = :recipeId', { recipeId });
    }

    const sales = await query.orderBy('sale.timestamp', 'DESC').getMany();

    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /sales/stats - Get sales statistics
router.get('/stats/aggregate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Total revenue
    const totalRevenue = await saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.revenue)', 'total')
      .where('sale.restaurantId = :restaurantId', { restaurantId: req.user.restaurantId })
      .getRawOne();

    // Total quantity sold
    const totalQuantity = await saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.quantity)', 'total')
      .where('sale.restaurantId = :restaurantId', { restaurantId: req.user.restaurantId })
      .getRawOne();

    // Sales by recipe
    const byRecipe = await saleRepository
      .createQueryBuilder('sale')
      .select('sale.recipeId', 'recipeId')
      .addSelect('SUM(sale.quantity)', 'totalQuantity')
      .addSelect('SUM(sale.revenue)', 'totalRevenue')
      .where('sale.restaurantId = :restaurantId', { restaurantId: req.user.restaurantId })
      .groupBy('sale.recipeId')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();

    res.json({
      totalRevenue: totalRevenue?.total || 0,
      totalQuantity: totalQuantity?.total || 0,
      byRecipe,
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
