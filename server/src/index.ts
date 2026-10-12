import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function bootstrap() {
  await connectDB();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[Server] The Date Crew API running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Server Error] Startup failure:', err);
  process.exit(1);
});
