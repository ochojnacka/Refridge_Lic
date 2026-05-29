import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './Restaurant';
import { Recipe } from './Recipe';

@Entity('menu_suggestions')
export class MenuSuggestion {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  restaurantId: string = '';

  @ManyToOne(() => Restaurant, { eager: false })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Restaurant;

  @Column('uuid')
  recipeId: string = '';

  @ManyToOne(() => Recipe, { eager: true })
  @JoinColumn({ name: 'recipeId' })
  recipe?: Recipe;

  @Column('float', { default: 0 })
  score: number = 0; // 0-10 recommendation score

  @Column('varchar', { length: 50 })
  suggestedDate: string = ''; // YYYY-MM-DD

  @Column('simple-array', { nullable: true })
  reasons: string[] = []; // ["In stock", "Expires today", "High margin", "Popular today"]

  @Column('int', { default: 1 })
  recommendedQuantity: number = 1;

  @Column('float', { default: 0 })
  estimatedProfit: number = 0; // PLN

  @Column('boolean', { default: false })
  isAddedToMenu: boolean = false;

  @CreateDateColumn()
  createdAt: Date = new Date();
}
