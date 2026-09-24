/**
 * Enterprise Database Configuration
 * Konfigurasi koneksi MySQL Server aoisamin.com
 */
import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'aoisamin.com',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'aois5856_mitraniaga01',
  user: process.env.DB_USER || 'aois5856_user_mitraniaga',
  password: process.env.DB_PASSWORD || 'Mitra@2026',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  timezone: '+07:00', // Asia/Jakarta (WIB)
};
