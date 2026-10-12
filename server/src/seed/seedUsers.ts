import bcrypt from 'bcrypt';
import { User } from '../models/User.model.js';

export async function seedUsers(): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Demo@1234', salt);

  const demoAccounts = [
    {
      fullName: 'Priya Sharma',
      email: 'matchmaker@datecrew.in',
      passwordHash,
      role: 'matchmaker',
    },
    {
      fullName: 'Arjun Kapoor',
      email: 'lead@datecrew.in',
      passwordHash,
      role: 'senior_matchmaker',
    },
  ];

  for (const account of demoAccounts) {
    await User.findOneAndUpdate(
      { email: account.email },
      { $set: account },
      { upsert: true, new: true }
    );
  }

  console.log('[Seed] Demo matchmaker accounts created successfully.');
}
