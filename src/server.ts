import { httpServer } from './app.js';
import { env } from './config/env.js';
import { initializeDatabaseSchema } from './config/database.js';

async function startServer() {
  console.log('🚀 Starting Clean Architecture Showcase API...');
  
  // Resilient DB schema check/initialization
  await initializeDatabaseSchema();

  httpServer.listen(env.PORT, env.HOST, () => {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`  🎯 Portfolio Showcase API Running`);
    console.log(`  📡 Address: http://${env.HOST}:${env.PORT}`);
    console.log(`  🔒 CORS Allowed: ${env.ALLOWED_ORIGINS}`);
    console.log(`  ⚙️  Node Environment: ${env.NODE_ENV}`);
    console.log('═══════════════════════════════════════');
    console.log('');
  });
}

// Global Exception Safety Nets
process.on('unhandledRejection', (reason) => {
  console.error('💥 [Unhandled Rejection] Promise rejected unexpectedly:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('💥 [Uncaught Exception] Critical application crash:', error.message);
  process.exit(1);
});

startServer();
