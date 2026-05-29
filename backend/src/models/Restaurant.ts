import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

@Entity('restaurants')
export class Restaurant {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('varchar', { length: 255 })
  name: string = '';

  @Column('varchar', { length: 255 })
  city: string = '';

  @Column('int', { default: 50 })
  seats: number = 50;

  @Column('int', { default: 85 })
  avgCoversPerDay: number = 85;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date = new Date();
}
