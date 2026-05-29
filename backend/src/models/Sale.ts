import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './Restaurant';
import { Recipe } from './Recipe';

@Entity('sales')
export class Sale {
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

  @Column('int')
  quantity: number = 0;

  @Column('float')
  revenue: number = 0; // PLN

  @Column('int')
  dayOfWeek: number = 0; // 0 = Sunday, 1 = Monday, etc.

  @Column('int', { nullable: true })
  dayOfMonth?: number;

  @Column('int', { nullable: true })
  month?: number;

  @Column('int', { nullable: true })
  year?: number;

  @CreateDateColumn()
  timestamp: Date = new Date();
}
