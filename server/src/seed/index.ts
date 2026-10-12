import { connectDB, disconnectDB } from '../config/db.js';
import { seedUsers } from './seedUsers.js';
import { seedDeterministicCandidates } from './seedCandidatesDeterministic.js';

async function runSeed() {
  console.log('--------------------------------------------------');
  console.log('[Seed Master] Starting idempotent database seed...');
  console.log('--------------------------------------------------');

  await connectDB();

  // 1. Seed demo matchmaker accounts
  await seedUsers();

  // 2. Seed deterministic candidates (120 profiles: 60M + 60F, all adults 21-45, separate preferences)
  const result = await seedDeterministicCandidates();

  console.log('--------------------------------------------------');
  console.log(`[Seed Master] Summary:`);
  console.log(`- Inserted/Upserted Candidates: ${result.insertedCount}`);
  console.log(`- Total Candidates in DB:       ${result.totalCandidates}`);
  console.log(`- Total MatchPreferences in DB: ${result.totalPreferences}`);
  console.log('--------------------------------------------------');

  await disconnectDB();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed Master Error] Seeding failed with error:', err);
  process.exit(1);
});
