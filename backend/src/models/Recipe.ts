import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './Restaurant';

export enum RecipeCategory {
  MAIN = 'Danie główne',
  SIDE = 'Dodatki',
  DESSERT = 'Desery',
  DRINK = 'Napoje',
  APPETIZER = 'Przystawki',
}

export enum MealType {
  BREAKFAST = 'Śniadanie',
  LUNCH = 'Obiad',
  DINNER = 'Kolacja',
  SNACK = 'Przekąska',
}

@Entity('recipes')
export class Recipe {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  restaurantId: string = '';

  @ManyToOne(() => Restaurant, { eager: false })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Restaurant;

  @Column('varchar', { length: 255 })
  name: string = '';

  @Column('text', { nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  ingredientIds: string[] = [];

  @Column('float')
  costPrice: number = 0;

  @Column('float')
  salePrice: number = 0;

  @Column('varchar', { length: 50 })
  category: RecipeCategory = RecipeCategory.MAIN;

  @Column('simple-array', { nullable: true })
  mealTypes: MealType[] = [MealType.LUNCH];

  @Column('int', { default: 0 })
  prepTimeMinutes: number = 0;

  @Column('boolean', { default: true })
  isActive: boolean = true;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  // Calculate margin on-the-fly
  getMargin(): number {
    if (this.salePrice === 0) return 0;
    return ((this.salePrice - this.costPrice) / this.salePrice) * 100;
  }
}
