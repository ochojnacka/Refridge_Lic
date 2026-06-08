import { Router, Response } from 'express';
import { AppDataSource } from '../database';
import { AuthRequest, authenticateToken, authorizeRole } from '../middleware/auth';
import { WasteLog } from '../models/WasteLog';
import { InventoryItem } from '../models/InventoryItem';
import { io } from '../server';

const router = Router();
const wasteLogRepository = AppDataSource.getRepository(WasteLog);
const inventoryRepository = AppDataSource.getRepository(InventoryItem);

// Wszyscy mogą zgłaszać straty
router.post('/log', authenticateToken, authorizeRole(['Menedżer', 'Szef kuchni', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, quantity, reason, unit } = req.body;
    if (!itemId || quantity === undefined || quantity <= 0) return res.status(400).json({ error: 'Nieprawidłowe pola' });

    let savedWasteLog: WasteLog;

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const item = await transactionalEntityManager.findOne(InventoryItem, { where: { id: itemId, restaurantId: req.user!.restaurantId } });
      if (!item) throw new Error('Produkt nie znaleziony');
      if (item.quantity < quantity) throw new Error(`Brak wystarczającego stanu magazynowego. Dostępne: ${item.quantity} ${item.unit}`);

      const value = quantity * item.costPrice;

      const wasteLog = transactionalEntityManager.create(WasteLog, {
        restaurantId: req.user!.restaurantId,
        itemId, quantity, reason, value, unit: unit || item.unit,
      });
      savedWasteLog = await transactionalEntityManager.save(wasteLog);

      item.quantity -= quantity;
      await transactionalEntityManager.save(item);
    });

    if (io) io.emit('waste:logged', savedWasteLog!);
    res.status(201).json(savedWasteLog!);
  } catch (error: any) {
    console.error('Błąd logowania odpadów:', error);
    const status = error.message.includes('nie znaleziony') || error.message.includes('Brak wystarczającego stanu') ? 400 : 500;
    res.status(status).json({ error: error.message || 'Wewnętrzny błąd serwera' });
  }
});

// Wszyscy mogą przeglądać listę strat
router.get('/logs', authenticateToken, authorizeRole(['Menedżer', 'Szef kuchni', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let query = wasteLogRepository.createQueryBuilder('waste')
      .where('waste.restaurantId = :restaurantId', { restaurantId: req.user!.restaurantId });

    if (dateFrom) query = query.andWhere('waste.timestamp >= :dateFrom', { dateFrom: new Date(dateFrom as string) });
    if (dateTo) query = query.andWhere('waste.timestamp <= :dateTo', { dateTo: new Date(dateTo as string) });

    const logs = await query.orderBy('waste.timestamp', 'DESC').getMany();
    res.json(logs);
  } catch (error) {
    console.error('Błąd pobierania logów odpadów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// ZABLOKOWANE DLA SZEFA KUCHNI: Kasowanie historii strat
router.delete('/logs/:id', authenticateToken, authorizeRole(['Menedżer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const log = await wasteLogRepository.findOne({ where: { id, restaurantId: req.user!.restaurantId } });
    
    if (!log) return res.status(404).json({ error: 'Log odpadów nie znaleziony' });
    
    await wasteLogRepository.remove(log);
    res.json({ success: true, message: 'Log odpadów usunięty' });
  } catch (error) {
    console.error('Błąd usuwania logu odpadów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

export default router;