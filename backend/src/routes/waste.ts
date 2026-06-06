import { Router, Response } from 'express';
import { AppDataSource } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { WasteLog } from '../models/WasteLog';
import { InventoryItem } from '../models/InventoryItem';
import { io } from '../server'; // Bezpośredni import instancji io

const router = Router();
const wasteLogRepository = AppDataSource.getRepository(WasteLog);
const inventoryRepository = AppDataSource.getRepository(InventoryItem);

// POST /waste/log - Log waste
router.post('/log', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    }

    const { itemId, quantity, reason, unit } = req.body;

    if (!itemId || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ error: 'Nieprawidłowe lub brakujące pola' });
    }

    let savedWasteLog: WasteLog;

    // --- TRANSAKCJA ---
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Pobierz produkt wewnątrz transakcji
      const item = await transactionalEntityManager.findOne(InventoryItem, {
        where: { id: itemId, restaurantId: req.user!.restaurantId },
      });

      if (!item) {
        throw new Error('Produkt nie znaleziony');
      }

      // 2. Walidacja stanu (nie pozwalamy na ujemny stan)
      if (item.quantity < quantity) {
        throw new Error(`Brak wystarczającego stanu magazynowego. Dostępne: ${item.quantity} ${item.unit}`);
      }

      // 3. Oblicz wartość straty
      const value = quantity * item.costPrice;

      // 4. Utwórz log straty
      const wasteLog = transactionalEntityManager.create(WasteLog, {
        restaurantId: req.user!.restaurantId,
        itemId,
        quantity,
        reason,
        value,
        unit: unit || item.unit,
      });
      savedWasteLog = await transactionalEntityManager.save(wasteLog);

      // 5. Zaktualizuj stan magazynowy
      item.quantity -= quantity;
      await transactionalEntityManager.save(item);
    });

    // --- PO ZATWIERDZENIU TRANSAKCJI ---
    // Jeśli dotarliśmy tutaj, transakcja przebiegła pomyślnie.
    
    // Integracja WebSocket
    if (io) {
      io.emit('waste:logged', savedWasteLog!);
    }

    res.status(201).json(savedWasteLog!);
  } catch (error: any) {
    console.error('Błąd logowania odpadów:', error);
    // Zwróć błąd (jeśli błąd pochodzi z naszej walidacji, przekaż go dalej)
    const status = error.message.includes('nie znaleziony') || error.message.includes('Brak wystarczającego stanu magazynowego') ? 400 : 500;
    res.status(status).json({ error: error.message || 'Wewnętrzny błąd serwera' });
  }
});

// GET /waste/logs - Get waste logs
router.get('/logs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
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
    console.error('Błąd pobierania logów odpadów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// DELETE /waste/logs/:id - Delete waste log
router.delete('/logs/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    }

    const { id } = req.params;

    const log = await wasteLogRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!log) {
      return res.status(404).json({ error: 'Log odpadów nie znaleziony' });
    }

    await wasteLogRepository.remove(log);

    res.json({ success: true, message: 'Log odpadów usunięty' });
  } catch (error) {
    console.error('Błąd usuwania logu odpadów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

export default router;