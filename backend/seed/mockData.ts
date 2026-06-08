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
    console.log('📊 Baza danych zainicjalizowana do seedowania');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    
    // Lista tabel w kolejności zależności (od tych bez kluczy obcych do głównych)
    // Ważne: usuwamy w kolejności odwrotnej do zależności!
    // 1. Zaktualizowana kolejność usuwania (od tabel najbardziej "zależnych" do "głównych")
    await queryRunner.query('DELETE FROM waste_logs');
    await queryRunner.query('DELETE FROM sales');
    await queryRunner.query('DELETE FROM menu_suggestions'); // <--- DODAJ TO
    await queryRunner.query('DELETE FROM recipes');
    await queryRunner.query('DELETE FROM inventory_items');
    await queryRunner.query('DELETE FROM users');
    await queryRunner.query('DELETE FROM restaurants');

    console.log('🧹 Baza danych wyczyszczona!');

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
      city: 'Gdańsk',
      seats: 45,
      avgCoversPerDay: 75,
      description: 'Włoskie bistro w sercu Gdańska, serwujące autentyczne dania kuchni włoskiej z lokalnych składników.',
    });
    await restaurantRepo.save(restaurant);
    console.log('✅ Restauracja utworzona');

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const manager = userRepo.create({
      id: MANAGER_ID,
      restaurantId: RESTAURANT_ID,
      email: 'menedzer@bistro.pl',
      passwordHash: hashedPassword,
      name: 'Paweł Nowak',
      role: UserRole.MANAGER,
      isActive: true,
    });

    const chef = userRepo.create({
      id: CHEF_ID,
      restaurantId: RESTAURANT_ID,
      email: 'szef@bistro.pl',
      passwordHash: hashedPassword,
      name: 'Michał Kowalski',
      role: UserRole.CHEF,
      isActive: true,
    });

    await userRepo.save([manager, chef]);
    console.log('✅ Użytkownicy utworzeni (menedżer + szef kuchni)');

    // 3. Create Inventory Items (Italian products)
    const ingredients = [
      { name: 'Pomidory', unit: Unit.KG, costPrice: 4.5, category: ItemCategory.VEGETABLES, suppliedBy: 'Hurtownia Warzyw' },
      { name: 'Mozzarella', unit: Unit.KG, costPrice: 22, category: ItemCategory.DAIRY, suppliedBy: 'Dostawca Mleczarni' },
      { name: 'Makaron Spaghetti', unit: Unit.KG, costPrice: 3.5, category: ItemCategory.BREAD, suppliedBy: 'Makaron Import' },
      { name: 'Oliwa z oliwek', unit: Unit.LITER, costPrice: 45, category: ItemCategory.BEVERAGES, suppliedBy: 'Włochy Oliwa' },
      { name: 'Bazylia suszona', unit: Unit.GRAM, costPrice: 0.05, category: ItemCategory.SPICES, suppliedBy: 'Przyprawy Kraków' },
      { name: 'Mięso wołowe', unit: Unit.KG, costPrice: 35, category: ItemCategory.MEAT, suppliedBy: 'Mięsna Hala' },
      { name: 'Ser Parmezan', unit: Unit.KG, costPrice: 28, category: ItemCategory.DAIRY, suppliedBy: 'Dostawca Mleczarni' },
      { name: 'Cytryny', unit: Unit.KG, costPrice: 3, category: ItemCategory.VEGETABLES, suppliedBy: 'Hurtownia Warzyw' },
      { name: 'Łosoś norweski', unit: Unit.KG, costPrice: 65, category: ItemCategory.MEAT, suppliedBy: 'Ryby Morza' },
      { name: 'Wino białe', unit: Unit.LITER, costPrice: 30, category: ItemCategory.BEVERAGES, suppliedBy: 'Winiarnia' },
      { name: 'Mrożony groszek', unit: Unit.KG, costPrice: 8, category: ItemCategory.OTHER, suppliedBy: 'Mrożonki' },
    ];

    const inventoryItems = [];
    for (let i = 0; i < ingredients.length; i++) {
      const ing = ingredients[i];
      const item = inventoryRepo.create({
        restaurantId: RESTAURANT_ID,
        name: ing.name,
        quantity: Math.random() * 70 + 20,
        unit: ing.unit,
        costPrice: ing.costPrice,
        expiryDate: i < 2 
          ? new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 2 pierwsze produkty zepsują się za 1 dzień!
          : new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),        
        category: ing.category,
        suppliedBy: ing.suppliedBy,
        wastePercentage: Math.random() * 15 + 2,
      });
      inventoryItems.push(item);
    }
    await inventoryRepo.save(inventoryItems);
    console.log(`✅ Pozycje magazynowe utworzone (${inventoryItems.length})`);

    // 4. Create Recipes
    const recipes = [
      { name: 'Spaghetti Carbonara', description: 'Klasyk włoski', costPrice: 8.5, salePrice: 28, category: RecipeCategory.MAIN, mealTypes: [MealType.LUNCH, MealType.DINNER], prepTimeMinutes: 12 },
      { name: 'Pizza Margherita', description: 'Pizza z mozzarellą', costPrice: 9, salePrice: 32, category: RecipeCategory.MAIN, mealTypes: [MealType.LUNCH, MealType.DINNER], prepTimeMinutes: 18 },
      { name: 'Stek z łososia', description: 'Łosoś z cytryną', costPrice: 15, salePrice: 45, category: RecipeCategory.MAIN, mealTypes: [MealType.DINNER], prepTimeMinutes: 20 },
      { name: 'Risotto szafranowe', description: 'Ryż po mediolańsku', costPrice: 10.5, salePrice: 35, category: RecipeCategory.MAIN, mealTypes: [MealType.LUNCH], prepTimeMinutes: 25 },
      { name: 'Caprese', description: 'Sałatka z mozzarellą', costPrice: 6.5, salePrice: 22, category: RecipeCategory.APPETIZER, mealTypes: [MealType.LUNCH, MealType.DINNER], prepTimeMinutes: 5 },
      { name: 'Tiramisu', description: 'Włoski deser', costPrice: 3, salePrice: 14, category: RecipeCategory.DESSERT, mealTypes: [MealType.DINNER], prepTimeMinutes: 0 },
      { name: 'Zupa pomidorowa', description: 'Zupa z bazylią', costPrice: 4, salePrice: 18, category: RecipeCategory.APPETIZER, mealTypes: [MealType.LUNCH], prepTimeMinutes: 15 },
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
    console.log(`✅ Przepisy utworzone (${recipeEntities.length})`);

    // 5. Create 6 months of Sales data (Z trendem wzrostowym)
    const salesData = [];
    const now = new Date();

    for (let month = 0; month < 6; month++) {
      const daysInMonth = 30;

      for (let day = 0; day < daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth() - month, day + 1);
        const dayOfWeek = date.getDay();
        const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        // NARRACJA BIZNESOWA: W ostatnim tygodniu i miesiącu ruch znacznie wzrósł!
        let trendMultiplier = 1.0;
        if (daysAgo <= 7) trendMultiplier = 1.6; // Ostatnie 7 dni: 60% więcej gości
        else if (daysAgo <= 30) trendMultiplier = 1.3; // Ostatnie 30 dni: 30% więcej gości
        else trendMultiplier = 0.8; // Starsze dane: mniejszy ruch

        // Symulacja: Większy ruch w weekendy
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseCovers = isWeekend ? 100 : 65;
        const coversVariation = Math.random() * 20 - 10;
        const totalCovers = Math.max(10, Math.floor((baseCovers + coversVariation) * trendMultiplier));

        // Każdy przepis ma szansę na sprzedaż
        for (let i = 0; i < recipeEntities.length; i++) {
          const probability = 0.5 + Math.random() * 0.4; 
          if (Math.random() < probability) {
            const quantity = Math.floor(Math.random() * (totalCovers * 0.4) + 1);
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
    console.log(`✅ Dane sprzedażowe utworzone (${salesData.length} wpisów - z nałożonym trendem)`);

    // 6. Create Waste logs (Codzienne logi z trendem malejącym!)
    const wasteData = [];

    for (let month = 0; month < 6; month++) {
      const daysInMonth = 30;

      // Zamiast co 3 dni, generujemy logi CODZIENNIE
      for (let day = 0; day < daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth() - month, day + 1);
        const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        // NARRACJA BIZNESOWA: Dzięki aplikacji Refridge odpady drastycznie spadły w ostatnim miesiącu!
        let wasteMultiplier = 1.0;
        if (daysAgo <= 7) wasteMultiplier = 0.3; // Tylko 30% historycznych strat w ostatnim tygodniu!
        else if (daysAgo <= 30) wasteMultiplier = 0.5; // 50% mniejsze straty w ostatnim miesiącu
        else wasteMultiplier = 1.5; // Kiedyś restauracja bardzo dużo marnowała

        // Ilość logów w danym dniu
        const maxLogs = Math.max(1, Math.floor(4 * wasteMultiplier));
        const wasteCount = Math.floor(Math.random() * maxLogs) + 1;

        for (let w = 0; w < wasteCount; w++) {
          const item = inventoryItems[Math.floor(Math.random() * inventoryItems.length)];
          // Ilość wyrzucona też spada
          const quantity = (Math.random() * 4 + 0.5) * wasteMultiplier; 
          const value = quantity * item.costPrice;
          const reasons = ['Przeterminowany', 'Uszkodzony', 'Nadprodukcja', 'Obróbka', 'Problemy jakościowe'];

          const waste = wasteRepo.create({
            restaurantId: RESTAURANT_ID,
            itemId: item.id,
            quantity: Math.round(quantity * 100) / 100,
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            value: Math.round(value * 100) / 100,
            unit: item.unit,
            timestamp: date,
          });
          wasteData.push(waste);
        }
      }
    }

    await wasteRepo.save(wasteData);
    console.log(`✅ Rejestracja wyrzucanych produktów utworzona - (${wasteData.length} wpisów - udowodniona redukcja strat)`);

    console.log('\n✨ Seedowanie zakończone pomyślnie!');
    console.log('\n🔑 Dane logowania:');
    console.log('   Menedżer: menedzer@bistro.pl / demo123');
    console.log('   Szef kuchni: szef@bistro.pl / demo123');
    console.log('   Administrator: admin@bistro.pl / demo123');    
    console.log('\n📊 ID Restauracji:', RESTAURANT_ID);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seedowanie nie powiodło się:', error);
    process.exit(1);
  }
}

seedDatabase();
