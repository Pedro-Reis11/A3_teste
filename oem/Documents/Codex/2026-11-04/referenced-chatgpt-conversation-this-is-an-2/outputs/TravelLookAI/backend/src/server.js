import { app } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection, closeDatabaseConnection } from './config/database.js';

let server;

async function startServer() {
  try {
    await checkDatabaseConnection();
    console.log('MySQL conectado com sucesso.');

    server = app.listen(env.PORT, () => {
      console.log(`TravelLookAI Budget API disponível em http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível iniciar a API:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando aplicação...`);

  if (server) {
    server.close(async () => {
      try {
        await closeDatabaseConnection();
        console.log('Servidor e pool MySQL encerrados.');
        process.exit(0);
      } catch (error) {
        console.error('Erro ao encerrar conexão MySQL:', error.message);
        process.exit(1);
      }
    });
  } else {
    await closeDatabaseConnection();
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

await startServer();
