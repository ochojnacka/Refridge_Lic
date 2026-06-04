import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'refridge_user',
  password: process.env.DATABASE_PASSWORD || 'SecurePass123!',
  database: process.env.DATABASE_NAME || 'refridge_dev',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/models/**/*.ts'],
  migrations: [__dirname + '/migrations/**/*.ts'],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ PostgreSQL Database connected successfully');
    console.log(`📊 Database: ${process.env.DATABASE_NAME} @ ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
