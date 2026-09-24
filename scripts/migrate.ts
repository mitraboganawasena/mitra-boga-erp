/**
 * Script Otomatisasi Migrasi Database MySQL
 * Menjalankan pembuatan tabel & inisialisasi Superadmin
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/db/config.ts';

async function runMigration() {
  console.log('------------------------------------------------------------');
  console.log('ERP ENTERPRISE DATABASE MIGRATION RUNNER');
  console.log(`Target: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log('------------------------------------------------------------');

  let connection: mysql.Connection | null = null;
  try {
    console.log('Menghubungkan ke MySQL...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true,
      connectTimeout: 10000,
    });

    console.log('✓ Terhubung ke database.');

    const sqlFilePath = path.resolve(process.cwd(), 'database/00_master_install.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`File ${sqlFilePath} tidak ditemukan.`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    console.log('Mengeksekusi skema database (00_master_install.sql)...');
    
    await connection.query(sqlContent);
    console.log('✓ Skema tabel dan seed superadmin berhasil dieksekusi!');

    const [tables] = await connection.query<mysql.RowDataPacket[]>('SHOW TABLES');
    console.log('\nDaftar Tabel Terbentuk:');
    tables.forEach((t, idx) => {
      console.log(`  ${idx + 1}. ${Object.values(t)[0]}`);
    });

    const [users] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id, username, id_role, akses_semua_cabang, status FROM user'
    );
    console.log('\nData User Terdaftar:');
    console.table(users);

    console.log('\nMigrasi SELESAI DENGAN SUKSES.');
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('\n[GAGAL MIGRASI]:', error.message || err);
    if (error.code === 'ETIMEDOUT') {
      console.error('\nCATATAN DEVOPS & INFRASTRUKTUR:');
      console.error('Koneksi mengalami Time-out ke port 3306 aoisamin.com.');
      console.error('Pada cPanel hosting standar, port 3306 MySQL secara default ditutup untuk koneksi luar (remote).');
      console.error('Langkah Solusi:');
      console.error('1. Buka cPanel aoisamin.com -> Menu "Remote MySQL" (atau "MySQL Jarak Jauh").');
      console.error('2. Tambahkan host "%" (izinkan semua) atau IP server aplikasi.');
      console.error('3. ATAU Anda dapat langsung mengimpor file: "database/00_master_install.sql" via phpMyAdmin cPanel.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
