import mysql from 'mysql2/promise';
import { env } from './env.js';

// Pool reutiliza conexões e evita abrir/fechar uma conexão a cada requisição.
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  decimalNumbers: false,
  dateStrings: true,
});

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}

export async function closeDatabaseConnection() {
  await pool.end();
}
