import { Router, Response } from 'express';
import { AppDataSource } from '../database';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { Recipe, RecipeCategory, MealType } from '../models/Recipe';

const router = Router();
const recipeRepository = AppDataSource.getRepository(Recipe);

// GET /recipes - List all recipes for restaurant
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    }

    const recipes = await recipeRepository.find({
      where: { restaurantId: req.user.restaurantId },
      order: { createdAt: 'DESC' },
    });

    // Calculate margin for each recipe
    const recipesWithMargin = recipes.map(r => ({
      ...r,
      margin: r.getMargin(),
    }));

    res.json(recipesWithMargin);
  } catch (error) {
    console.error('Błąd pobierania przepisów:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// POST /recipes - Create new recipe
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    }

    const { name, description, ingredientIds, costPrice, salePrice, category, mealTypes, prepTimeMinutes } = req.body;

    if (!name || costPrice === undefined || salePrice === undefined || !category) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const recipe = recipeRepository.create({
      restaurantId: req.user.restaurantId,
      name,
      description,
      ingredientIds: ingredientIds || [],
      costPrice,
      salePrice,
      category,
      mealTypes: mealTypes || [MealType.LUNCH],
      prepTimeMinutes: prepTimeMinutes || 0,
    });

    await recipeRepository.save(recipe);

    res.status(201).json({
      ...recipe,
      margin: recipe.getMargin(),
    });
  } catch (error) {
    console.error('Błąd tworzenia przepisu:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// PUT /recipes/:id - Update recipe
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    }

    const { id } = req.params;
    const { name, description, ingredientIds, costPrice, salePrice, category, mealTypes, prepTimeMinutes, isActive } = req.body;

    const recipe = await recipeRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    if (name !== undefined) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (ingredientIds !== undefined) recipe.ingredientIds = ingredientIds;
    if (costPrice !== undefined) recipe.costPrice = costPrice;
    if (salePrice !== undefined) recipe.salePrice = salePrice;
    if (category !== undefined) recipe.category = category;
    if (mealTypes !== undefined) recipe.mealTypes = mealTypes;
    if (prepTimeMinutes !== undefined) recipe.prepTimeMinutes = prepTimeMinutes;
    if (isActive !== undefined) recipe.isActive = isActive;

    await recipeRepository.save(recipe);

    res.json({
      ...recipe,
      margin: recipe.getMargin(),
    });
  } catch (error) {
    console.error('Błąd aktualizacji przepisu:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// DELETE /recipes/:id - Delete recipe
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nieautoryzowany dostęp' });
    }

    const { id } = req.params;

    const recipe = await recipeRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Przepis nie znaleziony' });
    }

    await recipeRepository.remove(recipe);

    res.json({ success: true, message: 'Przepis usunięty' });
  } catch (error) {
    console.error('Błąd usuwania przepisu:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

export default router;
