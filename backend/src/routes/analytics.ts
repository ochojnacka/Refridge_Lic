import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, authorizeRole } from '../middleware/auth';
import { AnalyticsService } from '../services/AnalyticsService';
import { MenuSuggestionService } from '../services/MenuSuggestionService';

const router = Router();
const analyticsService = new AnalyticsService();
const menuService = new MenuSuggestionService();

// Zmiana typu parametru na 'any', aby pominąć błędy niezgodności typów z biblioteki 'qs' w Expressie
const parseRange = (range: any): number => {
  if (range === '7days') return 7;
  if (range === 'all') return 365; // Przybliżenie dla studium przypadku
  return 30; // Domyślnie 30 dni
};

router.get('/waste-report', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    const rangeDays = parseRange(req.query.range);
    const report = await analyticsService.getWasteReport(req.user.restaurantId, rangeDays);
    res.json(report);
  } catch (error) {
    console.error('Błąd pobierania raportu odpadów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

router.get('/profitability', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    const rangeDays = parseRange(req.query.range);
    const report = await analyticsService.getProfitabilityReport(req.user.restaurantId, rangeDays);
    res.json(report);
  } catch (error) {
    console.error('Błąd pobierania raportu rentowności:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

router.get('/inventory-health', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    const report = await analyticsService.getInventoryHealth(req.user.restaurantId);
    res.json(report);
  } catch (error) {
    console.error('Błąd pobierania statusu zapasów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

router.get('/investment-appraisal', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    const appraisal = await analyticsService.getInvestmentAppraisal(req.user.restaurantId);
    res.json(appraisal);
  } catch (error) {
    console.error('Błąd pobierania oszacowania inwestycji:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// GET /analytics/suggestions - Menu suggestions for today
router.get('/suggestions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const suggestions = await menuService.suggestMenuForToday(req.user.restaurantId, limit);
    
    await Promise.all(suggestions.map(s => menuService.saveSuggestion(req.user!.restaurantId, s)));
    
    res.json({ date: new Date().toISOString().split('T')[0], suggestions, count: suggestions.length });
  } catch (error) {
    console.error('Błąd generowania propozycji menu:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

export default router;