import { AppDataSource } from '../src/database';
import { Restaurant } from '../src/models/Restaurant';
import { User, UserRole } from '../src/models/User';
import { InventoryItem, Unit, ItemCategory } from '../src/models/InventoryItem';
import { Recipe, RecipeCategory, MealType } from '../src/models/Recipe';
import { Sale } from '../src/models/Sale';
import { WasteLog } from '../src/models/WasteLog';
import * as bcrypt from 'bcryptjs';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

const RESTAURANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const MANAGER_ID = 'a1b2c3d4-e5f6-47a8-9b1c-2d3e4f5a6b7c';
const CHEF_ID = 'b2c3d4e5-f6a7-48b9-c2d3-e4f5a6b7c8d9';

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('📊 Database initialized for seeding');

    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    const userRepo = AppDataSource.getRepository(User);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    const recipeRepo = AppDataSource.getRepository(Recipe);
    const saleRepo = AppDataSource.getRepository(Sale);
    const wasteRepo = AppDataSource.getRepository(WasteLog);

    // 1. Create Restaurant
    const restaurant = restaurantRepo.create({
      id: RESTAURANT_ID,
      name: 'Bistro Na Rogu',
      city: 'Kraków',
      seats: 45,
      avgCoversPerDay: 75,
      description: 'Włoskie bistro w sercu Krakowa',
    });
    await restaurantRepo.save(restaurant);
    console.log('✅ Restaurant created');

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const manager = userRepo.create({
      id: MANAGER_ID,
      restaurantId: RESTAURANT_ID,
      email: 'manager@bistro.pl',
      passwordHash: hashedPassword,
      name: 'Paweł Nowak',
      role: UserRole.MANAGER,
      isActive: true,
    });

    const chef = userRepo.create({
      id: CHEF_ID,
      restaurantId: RESTAURANT_ID,
      email: 'chef@bistro.pl',
      passwordHash: hashedPassword,
      name: 'Michał Kowalski',
      role: UserRole.CHEF,
      isActive: true,
    });

    await userRepo.save([manager, chef]);
    console.log('✅ Users created (manager + chef)');

    // 3. Create Inventory Items (Italian products)
    const ingredients = [
      { name: 'Pomidory', unit: Unit.KG, costPrice: 4.5, category: ItemCategory.VEGETABLES, suppliedBy: 'Hurtownia Warzyw' },
      { name: 'Mozzarella', unit: Unit.KG, costPrice: 22, category: ItemCategory.DAIRY, suppliedBy: 'Dostawca Mleczarni' },
      { name: 'Pasta Spaghetti', unit: Unit.KG, costPrice: 3.5, category: ItemCategory.BREAD, suppliedBy: 'Makaron Import' },
      { name: 'Oliwa z oliwek', unit: Unit.LITER, costPrice: 45, category: ItemCategory.BEVERAGES, suppliedBy: 'Włochy Oliwa' },
      { name: 'Basilicum', unit: Unit.GRAM, costPrice: 0.05, category: ItemCategory.SPICES, suppliedBy: 'Przyprawy Kraków' },
      { name: 'Mięso wołowe', unit: Unit.KG, costPrice: 35, category: ItemCategory.MEAT, suppliedBy: 'Mięsna Hala' },
      { name: 'Ser Parmezana', unit: Unit.KG, costPrice: 28, category: ItemCategory.DAIRY, suppliedBy: 'Dostawca Mleczarni' },
      { name: 'Cytryny', unit: Unit.KG, costPrice: 3, category: ItemCategory.VEGETABLES, suppliedBy: 'Hurtownia Warzyw' },
    ];

    const inventoryItems = [];
    for (const ing of ingredients) {
      const item = inventoryRepo.create({
        restaurantId: RESTAURANT_ID,
        name: ing.name,
        quantity: Math.random() * 100 + 50,
        unit: ing.unit,
        costPrice: ing.costPrice,
        expiryDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        category: ing.category,
        suppliedBy: ing.suppliedBy,
        wastePercentage: Math.random() * 15 + 5,
      });
      inventoryItems.push(item);
    }
    await inventoryRepo.save(inventoryItems);
    console.log(`✅ Inventory items created (${inventoryItems.length})`);

    // 4. Create Recipes
    const recipes = [
      {
        name: 'Spaghetti Carbonara',
        description: 'Klasyczna włoska pasta',
        costPrice: 8.5,
        salePrice: 28,
        category: RecipeCategory.MAIN,
        mealTypes: [MealType.LUNCH, MealType.DINNER],
        prepTimeMinutes: 12,
      },
      {
        name: 'Margherita Pizza',
        description: 'Pizza z pomidorami i mozzarellą',
        costPrice: 9,
        salePrice: 32,
        category: RecipeCategory.MAIN,
        mealTypes: [MealType.LUNCH, MealType.DINNER],
        prepTimeMinutes: 18,
      },
      {
        name: 'Risotto Milanese',
        description: 'Risotto z szafranem',
        costPrice: 10.5,
        salePrice: 35,
        category: RecipeCategory.MAIN,
        mealTypes: [MealType.LUNCH, MealType.DINNER],
        prepTimeMinutes: 25,
      },
      {
        name: 'Salata Caprese',
        description: 'Sałatka z mozzarellą i pomidorami',
        costPrice: 6.5,
        salePrice: 22,
        category: RecipeCategory.APPETIZER,
        mealTypes: [MealType.LUNCH, MealType.DINNER],
        prepTimeMinutes: 5,
      },
      {
        name: 'Tiramisu',
        description: 'Włoski deser klasyk',
        costPrice: 3,
        salePrice: 14,
        category: RecipeCategory.DESSERT,
        mealTypes: [MealType.LUNCH, MealType.DINNER],
        prepTimeMinutes: 0,
      },
      {
        name: 'Espresso',
        description: 'Silna włoska kawa',
        costPrice: 0.8,
        salePrice: 6,
        category: RecipeCategory.DRINK,
        mealTypes: [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER],
        prepTimeMinutes: 1,
      },
    ];

    const recipeEntities = [];
    for (const recipe of recipes) {
      const rec = recipeRepo.create({
        restaurantId: RESTAURANT_ID,
        ...recipe,
        ingredientIds: inventoryItems.slice(0, 3).map(i => i.id),
      });
      recipeEntities.push(rec);
    }
    await recipeRepo.save(recipeEntities);
    console.log(`✅ Recipes created (${recipeEntities.length})`);

    // 5. Create 6 months of Sales data
    const salesData = [];
    const now = new Date();

    for (let month = 0; month < 6; month++) {
      const daysInMonth = 30;

      for (let day = 0; day < daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth() - month, day + 1);
        const dayOfWeek = date.getDay();

        // Simulation: Different demand patterns
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseCovers = isWeekend ? 95 : 70;
        const coversVariation = Math.random() * 30 - 15;
        const totalCovers = Math.max(20, baseCovers + coversVariation);

        // Each recipe sold with some probability
        for (let i = 0; i < recipeEntities.length; i++) {
          const probability = 0.6 + Math.random() * 0.3; // 60-90% chance
          if (Math.random() < probability) {
            const quantity = Math.floor(Math.random() * (totalCovers * 0.5) + 2);
            const recipe = recipeEntities[i];
            const revenue = quantity * recipe.salePrice;

            const sale = saleRepo.create({
              restaurantId: RESTAURANT_ID,
              recipeId: recipe.id,
              quantity,
              revenue,
              dayOfWeek,
              dayOfMonth: date.getDate(),
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              timestamp: date,
            });
            salesData.push(sale);
          }
        }
      }
    }

    await saleRepo.save(salesData);
    console.log(`✅ Sales data created (${salesData.length} entries)`);

    // 6. Create Waste logs (2-3 per week)
    const wasteData = [];

    for (let month = 0; month < 6; month++) {
      const daysInMonth = 30;

      for (let day = 0; day < daysInMonth; day += 3) {
        const date = new Date(now.getFullYear(), now.getMonth() - month, day + 1);

        // Random waste incidents
        const wasteCount = Math.random() > 0.5 ? 2 : 1;

        for (let w = 0; w < wasteCount; w++) {
          const item = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
          const quantity = Math.random() * 5 + 0.5;
          const value = quantity * item.costPrice;
          const reasons = ['Expired', 'Damaged', 'Over-production', 'Trim loss', 'Quality issue'];

          const waste = wasteRepo.create({
            restaurantId: RESTAURANT_ID,
            itemId: item.id,
            quantity,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            value,
            unit: item.unit,
            timestamp: date,
          });
          wasteData.push(waste);
        }
      }
    }

    await wasteRepo.save(wasteData);
    console.log(`✅ Waste logs created (${wasteData.length} entries)`);

    console.log('\n✨ Seed completed successfully!');
    console.log('\n🔑 Test Credentials:');
    console.log('   Manager: manager@bistro.pl / demo123');
    console.log('   Chef: chef@bistro.pl / demo123');
    console.log('\n📊 Restaurant ID:', RESTAURANT_ID);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
