import { checkDatabaseConnection, closeDatabaseConnection } from '../src/config/database.js';

try {
  await checkDatabaseConnection();
  console.log('OK: conexão com MySQL estabelecida.');
  process.exitCode = 0;
} catch (error) {
  console.error('ERRO: não foi possível conectar ao MySQL.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await closeDatabaseConnection();
}
