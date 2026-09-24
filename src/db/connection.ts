import mysql from 'mysql2/promise';
import { dbConfig } from './config.ts';

// Enterprise Connection Pool
export const pool = mysql.createPool({
  ...dbConfig,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function testConnection(): Promise<{ success: boolean; message: string; tables?: string[] }> {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>('SHOW TABLES');
      const tableNames = rows.map((r) => Object.values(r)[0] as string);
      return {
        success: true,
        message: 'Koneksi ke MySQL Host (aoisamin.com) berhasil.',
        tables: tableNames,
      };
    } finally {
      connection.release();
    }
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    let tip = '';
    if (error.code === 'ETIMEDOUT') {
      tip = ' [Catatan: Port 3306 diblokir firewall hosting cPanel. Aktifkan Remote MySQL di cPanel -> Remote Database (tambahkan IP atau %)].';
    }
    return {
      success: false,
      message: `Gagal terkoneksi: ${error.message || String(err)}${tip}`,
    };
  }
}
