import { connectDB, disconnectDB } from '../config/db.js';
import { seedUsers } from './seedUsers.js';
import { seedCandidates } from './seedCandidates.js';

async function runSeed() {
  console.log('[Seed] Starting database seeding process...');
  await connectDB();

  await seedUsers();
  await seedCandidates();

  console.log('[Seed] Seeding completed successfully.');
  await disconnectDB();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed Error] Seeding failed:', err);
  process.exit(1);
});
