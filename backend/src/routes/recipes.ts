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
      return res.status(401).json({ error: 'Unauthorized' });
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
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /recipes - Create new recipe
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, ingredientIds, costPrice, salePrice, category, mealTypes, prepTimeMinutes } = req.body;

    if (!name || costPrice === undefined || salePrice === undefined || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
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
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /recipes/:id - Update recipe
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { name, description, ingredientIds, costPrice, salePrice, category, mealTypes, prepTimeMinutes, isActive } = req.body;

    const recipe = await recipeRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
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
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /recipes/:id - Delete recipe
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const recipe = await recipeRepository.findOne({
      where: { id, restaurantId: req.user.restaurantId },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await recipeRepository.remove(recipe);

    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
