import { AppDataSource } from '../database';
import { Recipe } from '../models/Recipe';
import { Sale } from '../models/Sale';
import { InventoryItem } from '../models/InventoryItem';
import { MenuSuggestion } from '../models/MenuSuggestion';

export interface RecipeSuggestion {
  recipeId: string;
  recipeName: string;
  score: number; // 0-100
  reasons: string[];
  margin: number;
  estimatedProfit: number;
  demandScore: number;
  inventoryScore: number;
  marginScore: number;
}

export class MenuSuggestionService {
  private recipeRepository = AppDataSource.getRepository(Recipe);
  private saleRepository = AppDataSource.getRepository(Sale);
  private inventoryRepository = AppDataSource.getRepository(InventoryItem);
  private suggestionRepository = AppDataSource.getRepository(MenuSuggestion);

  /**
   * Calculate inventory score (0-30 points)
   * - Full stock: 30 points
   * - Partial stock: 15 points
   * - Low/expiring stock: 0 points
   */
  private async getInventoryScore(recipe: Recipe, restaurantId: string): Promise<number> {
    if (!recipe.ingredientIds || recipe.ingredientIds.length === 0) {
      return 20; // Neutral if no ingredients tracked
    }

    let totalScore = 0;
    let itemsCount = 0;

    for (const itemId of recipe.ingredientIds) {
      try {
        const item = await this.inventoryRepository.findOne({
          where: { id: itemId, restaurantId },
        });

        if (!item) {
          totalScore += 0; // Not in stock
        } else if (item.quantity > 50) {
          totalScore += 10; // Full stock
        } else if (item.quantity > 10) {
          totalScore += 5; // Partial stock
        } else {
          totalScore += 0; // Low stock
        }
      } catch (err) {
        console.error('Błąd sprawdzania stanu magazynowego:', err);
      }

      itemsCount++;
    }

    return itemsCount > 0 ? (totalScore / itemsCount) * (30 / 10) : 15;
  }

  /**
   * Calculate expiring item bonus (0-20 points)
   * Recipes using soon-to-expire ingredients get bonus
   */
  private async getExpiringItemBonus(recipe: Recipe, restaurantId: string): Promise<number> {
    if (!recipe.ingredientIds || recipe.ingredientIds.length === 0) {
      return 0;
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    let expiringCount = 0;

    for (const itemId of recipe.ingredientIds) {
      try {
        const item = await this.inventoryRepository.findOne({
          where: { id: itemId, restaurantId },
        });

        if (item && item.expiryDate && new Date(item.expiryDate) < threeDaysFromNow) {
          expiringCount++;
        }
      } catch (err) {
        console.error('Błąd sprawdzania daty ważności:', err);
      }
    }

    // More expiring items = higher bonus (up to 20 points)
    return Math.min(20, expiringCount * 5);
  }

  /**
   * Calculate margin score (0-20 points)
   * Higher margin = higher score
   */
  private getMarginScore(recipe: Recipe): number {
    const margin = recipe.getMargin();
    if (margin >= 60) return 20;
    if (margin >= 50) return 15;
    if (margin >= 40) return 10;
    if (margin >= 30) return 5;
    return 0;
  }

  /**
   * Calculate demand score (0-30 points)
   * Based on past 30 days sales volume
   */
  private async getDemandScore(recipe: Recipe, restaurantId: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sales = await this.saleRepository.find({
      where: {
        restaurantId,
        recipeId: recipe.id,
        timestamp: thirtyDaysAgo,
      },
    });

    const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);

    if (totalQuantity > 100) return 30;
    if (totalQuantity > 50) return 20;
    if (totalQuantity > 20) return 10;
    if (totalQuantity > 0) return 5;
    return 0; // No sales = less priority
  }

  /**
   * Score single recipe for menu suggestion
   */
  async scoreRecipe(recipe: Recipe, restaurantId: string): Promise<RecipeSuggestion> {
    const reasons: string[] = [];
    let score = 50; // Base score

    // Inventory score (0-30)
    const inventoryScore = await this.getInventoryScore(recipe, restaurantId);
    score += inventoryScore / 3;

    if (inventoryScore > 20) {
      reasons.push('✅ Dużo produktów na stanie');
    }

    // Expiring item bonus (0-20)
    const expiringBonus = await this.getExpiringItemBonus(recipe, restaurantId);
    score += expiringBonus / 2;

    if (expiringBonus > 10) {
      reasons.push('⏰ Zbliża się koniec daty ważności produktów!');
    }

    // Margin score (0-20)
    const marginScore = this.getMarginScore(recipe);
    score += marginScore / 2;
    reasons.push(`💰 Marża: ${recipe.getMargin().toFixed(1)}%`);

    // Demand score (0-30)
    const demandScore = await this.getDemandScore(recipe, restaurantId);
    score += demandScore / 3;

    if (demandScore > 15) {
      reasons.push('📈 Wysoki popyt - popularny wybór');
    }

    // Clamp score to 0-100
    const finalScore = Math.min(100, Math.max(0, score));

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      score: Math.round(finalScore),
      reasons,
      margin: recipe.getMargin(),
      estimatedProfit: recipe.salePrice - recipe.costPrice,
      demandScore: Math.round(demandScore),
      inventoryScore: Math.round(inventoryScore),
      marginScore: Math.round(marginScore),
    };
  }

  /**
   * Get top recipe suggestions for today's menu
   */
  async suggestMenuForToday(restaurantId: string, limit: number = 5): Promise<RecipeSuggestion[]> {
    try {
      const recipes = await this.recipeRepository.find({
        where: {
          restaurantId,
          isActive: true,
        },
      });

      const scoredRecipes = await Promise.all(
        recipes.map(r => this.scoreRecipe(r, restaurantId))
      );

      // Sort by score descending
      return scoredRecipes
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Błąd sugerowania menu:', error);
      throw error;
    }
  }

  /**
   * Save suggestion to database
   */
  async saveSuggestion(
    restaurantId: string,
    suggestion: RecipeSuggestion
  ): Promise<MenuSuggestion> {
    const menuSuggestion = this.suggestionRepository.create({
      restaurantId,
      recipeId: suggestion.recipeId,
      score: suggestion.score,
      reasons: suggestion.reasons,
      recommendedQuantity: 10, // Default recommendation
      estimatedProfit: suggestion.estimatedProfit,
      suggestedDate: new Date().toISOString().split('T')[0],
      isAddedToMenu: false,
    });

    return this.suggestionRepository.save(menuSuggestion);
  }

  /**
   * Get today's suggestions and save them
   */
  async generateTodaySuggestions(restaurantId: string): Promise<MenuSuggestion[]> {
    const suggestions = await this.suggestMenuForToday(restaurantId, 5);
    
    // Delete old suggestions for today
    const today = new Date().toISOString().split('T')[0];
    await this.suggestionRepository
      .createQueryBuilder()
      .delete()
      .where('restaurantId = :restaurantId AND suggestedDate = :today', { restaurantId, today })
      .execute();

    // Save new suggestions
    return Promise.all(
      suggestions.map(s => this.saveSuggestion(restaurantId, s))
    );
  }
}
