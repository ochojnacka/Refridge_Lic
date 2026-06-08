import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, authorizeRole } from '../middleware/auth';
import { AnalyticsService } from '../services/AnalyticsService';
import { MenuSuggestionService } from '../services/MenuSuggestionService';

const router = Router();
const analyticsService = new AnalyticsService();
const menuService = new MenuSuggestionService();

const parseRange = (range: any): number => {
  if (range === '7days') return 7;
  if (range === 'all') return 365;
  return 30;
};

// Dostęp dla wszystkich załogantów (Raport odpadów jest potrzebny kuchni do optymalizacji)
router.get('/waste-report', authenticateToken, authorizeRole(['Menedzer', 'Szef kuchni', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const rangeDays = parseRange(req.query.range);
    const report = await analyticsService.getWasteReport(req.user!.restaurantId, rangeDays);
    res.json(report);
  } catch (error) {
    console.error('Błąd pobierania raportu odpadów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// ZABLOKOWANE DLA SZEFA KUCHNI: Finanse i rentowność
router.get('/profitability', authenticateToken, authorizeRole(['Menedzer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const rangeDays = parseRange(req.query.range);
    const report = await analyticsService.getProfitabilityReport(req.user!.restaurantId, rangeDays);
    res.json(report);
  } catch (error) {
    console.error('Błąd pobierania raportu rentowności:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Dostęp dla wszystkich (Kuchnia musi widzieć, co jest w magazynie)
router.get('/inventory-health', authenticateToken, authorizeRole(['Menedzer', 'Szef kuchni', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const report = await analyticsService.getInventoryHealth(req.user!.restaurantId);
    res.json(report);
  } catch (error) {
    console.error('Błąd pobierania statusu zapasów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// ZABLOKOWANE DLA SZEFA KUCHNI: Wskaźniki WACC, ROI, itp.
router.get('/investment-appraisal', authenticateToken, authorizeRole(['Menedzer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const appraisal = await analyticsService.getInvestmentAppraisal(req.user!.restaurantId);
    res.json(appraisal);
  } catch (error) {
    console.error('Błąd pobierania oszacowania inwestycji:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Dostęp dla wszystkich (Sugestie menu na bazie zapasów)
router.get('/suggestions', authenticateToken, authorizeRole(['Menedzer', 'Szef kuchni', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const suggestions = await menuService.suggestMenuForToday(req.user!.restaurantId, limit);
    
    await Promise.all(suggestions.map(s => menuService.saveSuggestion(req.user!.restaurantId, s)));
    
    res.json({ date: new Date().toISOString().split('T')[0], suggestions, count: suggestions.length });
  } catch (error) {
    console.error('Błąd generowania propozycji menu:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

export default router;