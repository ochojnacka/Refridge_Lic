import { Router, Response } from 'express';
import { AppDataSource } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { WasteLog } from '../models/WasteLog';
import { InventoryItem } from '../models/InventoryItem';

const router = Router();
const wasteLogRepository = AppDataSource.getRepository(WasteLog);
const inventoryRepository = AppDataSource.getRepository(InventoryItem);

// POST /waste/log - Log waste
router.post('/log', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { itemId, quantity, reason } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get inventory item to calculate waste value
    const item = await inventoryRepository.findOne({
      where: { id: itemId, restaurantId: req.user.restaurantId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Calculate waste value
    const value = quantity * item.costPrice;

    // Create waste log
    const wasteLog = wasteLogRepository.create({
      restaurantId: req.user.restaurantId,
      itemId,
      quantity,
      reason,
      value,
      unit: item.unit,
    });

    await wasteLogRepository.save(wasteLog);

    // Optionally reduce inventory quantity (commented out for now)
    // item.quantity -= quantity;
    // await inventoryRepository.save(item);

    res.status(201).json(wasteLog);
  } catch (error) {
    console.error('Error logging waste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /waste/logs - Get waste logs
router.get('/logs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dateFrom, dateTo } = req.query;

    let query = wasteLogRepository
      .createQueryBuilder('waste')
      .where('waste.restaurantId = :restaurantId', { restaurantId: req.user.restaurantId });

    if (dateFrom) {
      query = query.andWhere('waste.timestamp >= :dateFrom', { dateFrom: new Date(dateFrom as string) });
    }
    if (dateTo) {
      query = query.andWhere('waste.timestamp <= :dateTo', { dateTo: new Date(dateTo as string) });
    }

    const logs = await query.orderBy('waste.timestamp', 'DESC').getMany();

    res.json(logs);
  } catch (error) {
    console.error('Error fetching waste logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /waste/logs/:id - Delete waste log
router.delete('/logs/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const log = await wasteLogRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!log) {
      return res.status(404).json({ error: 'Waste log not found' });
    }

    await wasteLogRepository.remove(log);

    res.json({ success: true, message: 'Waste log deleted' });
  } catch (error) {
    console.error('Error deleting waste log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
