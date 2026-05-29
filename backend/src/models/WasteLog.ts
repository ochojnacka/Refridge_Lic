import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './Restaurant';
import { InventoryItem } from './InventoryItem';

@Entity('waste_logs')
export class WasteLog {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  restaurantId: string = '';

  @ManyToOne(() => Restaurant, { eager: false })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Restaurant;

  @Column('uuid')
  itemId: string = '';

  @ManyToOne(() => InventoryItem, { eager: true })
  @JoinColumn({ name: 'itemId' })
  item?: InventoryItem;

  @Column('float')
  quantity: number = 0;

  @Column('varchar', { length: 500, nullable: true })
  reason?: string;

  @Column('float')
  value: number = 0; // PLN - calculated from quantity * costPrice

  @Column('varchar', { length: 50, nullable: true })
  unit?: string;

  @CreateDateColumn()
  timestamp: Date = new Date();
}
