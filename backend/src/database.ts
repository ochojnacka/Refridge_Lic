import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '..', 'refridge.db'),
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/models/**/*.ts'],
  migrations: [__dirname + '/migrations/**/*.ts'],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
