import { db } from './drizzle';
import { songs, users } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  const name = 'Camel';
  const email = 'camel@sahara.com';
  const password = 'desertrose';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        name,
        email,
        passwordHash,
        role: 'owner',
      },
    ])
    .returning();

  console.log('Initial user created.');

  await db
    .insert(songs)
    .values({
      name: 'Test Song',
      content: 'Test content',
      userId: user.id,
    })
    .returning();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
