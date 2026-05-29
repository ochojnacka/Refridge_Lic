import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { AnalyticsService } from '../services/AnalyticsService';
import { MenuSuggestionService } from '../services/MenuSuggestionService';

const router = Router();
const analyticsService = new AnalyticsService();
const menuService = new MenuSuggestionService();

// GET /analytics/waste-report - Waste analysis
router.get('/waste-report', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dateFrom, dateTo } = req.query;

    const report = await analyticsService.getWasteReport(
      req.user.restaurantId,
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json(report);
  } catch (error) {
    console.error('Error fetching waste report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/profitability - Profitability analysis
router.get('/profitability', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dateFrom, dateTo } = req.query;

    const report = await analyticsService.getProfitabilityReport(
      req.user.restaurantId,
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json(report);
  } catch (error) {
    console.error('Error fetching profitability report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/inventory-health - Inventory status
router.get('/inventory-health', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const report = await analyticsService.getInventoryHealth(req.user.restaurantId);

    res.json(report);
  } catch (error) {
    console.error('Error fetching inventory health:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /analytics/demand-pattern/:recipeId - Recipe demand analysis
router.get('/demand-pattern/:recipeId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { recipeId } = req.params;

    const pattern = await analyticsService.getDemandPattern(
      req.user.restaurantId,
      recipeId
    );

    if (!pattern) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(pattern);
  } catch (error) {
    console.error('Error fetching demand pattern:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /recipes/suggestions - Menu suggestions for today
router.get('/suggestions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 5;

    const suggestions = await menuService.suggestMenuForToday(
      req.user.restaurantId,
      limitNum
    );

    // Save suggestions to database
    await Promise.all(
      suggestions.map(s => menuService.saveSuggestion(req.user!.restaurantId, s))
    );

    res.json({
      date: new Date().toISOString().split('T')[0],
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('Error generating menu suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
