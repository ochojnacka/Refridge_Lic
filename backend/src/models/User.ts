import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from './Restaurant';

export enum UserRole {
  MANAGER = 'Menedzer',
  CHEF = 'Szef kuchni',
  ADMIN = 'Administrator',
}

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  restaurantId: string = '';

  @ManyToOne(() => Restaurant, { eager: true })
  @JoinColumn({ name: 'restaurantId' })
  restaurant?: Restaurant;

  @Column('varchar', { length: 255, unique: true })
  email: string = '';

  @Column('varchar', { length: 255 })
  passwordHash: string = '';

  @Column('varchar', { length: 50 })
  name: string = '';

  @Column('varchar', { length: 50, default: 'Menedzer' })
  role: UserRole = UserRole.MANAGER;

  @Column('boolean', { default: true })
  isActive: boolean = true;

  @CreateDateColumn()
  createdAt: Date = new Date();
}
