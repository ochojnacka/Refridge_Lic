import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './Restaurant';

export enum ItemCategory {
  VEGETABLES = 'Warzywa',
  MEAT = 'Mięso',
  DAIRY = 'Nabiał',
  BREAD = 'Chleb',
  SPICES = 'Przyprawy',
  BEVERAGES = 'Napoje',
  OTHER = 'Inne',
}

export enum Unit {
  KG = 'kg',
  LITER = 'l',
  PIECE = 'pc',
  GRAM = 'g',
  MILLILITER = 'ml',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  restaurantId: string = '';

  @ManyToOne(() => Restaurant, { eager: false })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Restaurant;

  @Column('varchar', { length: 255 })
  name: string = '';

  @Column('float')
  quantity: number = 0;

  @Column('varchar', { length: 50 })
  unit: Unit = Unit.KG;

  @Column('float')
  costPrice: number = 0;

  @Column('date', { nullable: true })
  expiryDate?: Date;

  @Column('varchar', { length: 50 })
  category: ItemCategory = ItemCategory.OTHER;

  @Column('varchar', { length: 255, nullable: true })
  suppliedBy?: string;

  @Column('float', { default: 0 })
  wastePercentage: number = 0;

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();
}
