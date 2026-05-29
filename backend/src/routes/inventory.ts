import { Router, Response } from 'express';
import { AppDataSource } from '../database';
import { AuthRequest, authenticateToken, authorizeRole } from '../middleware/auth';
import { InventoryItem } from '../models/InventoryItem';

const router = Router();
const inventoryRepository = AppDataSource.getRepository(InventoryItem);

// GET /inventory/items - List all items for restaurant
router.get('/items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const items = await inventoryRepository.find({
      where: { restaurantId: req.user.restaurantId },
      order: { createdAt: 'DESC' },
    });

    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /inventory/items - Add new item
router.post('/items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, quantity, unit, costPrice, expiryDate, category, suppliedBy } = req.body;

    if (!name || quantity === undefined || !unit || costPrice === undefined || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = inventoryRepository.create({
      restaurantId: req.user.restaurantId,
      name,
      quantity,
      unit,
      costPrice,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      category,
      suppliedBy,
    });

    await inventoryRepository.save(item);

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /inventory/items/:id - Update item
router.patch('/items/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { quantity, expiryDate, costPrice, wastePercentage } = req.body;

    const item = await inventoryRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (expiryDate !== undefined) item.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    if (costPrice !== undefined) item.costPrice = costPrice;
    if (wastePercentage !== undefined) item.wastePercentage = wastePercentage;

    await inventoryRepository.save(item);

    res.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /inventory/items/:id - Delete item
router.delete('/items/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const item = await inventoryRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await inventoryRepository.remove(item);

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
