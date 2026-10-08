import dotenv from 'dotenv';
import { resetReviewsToSeed } from '../src/lib/server-reviews';

dotenv.config({ path: '.env.local' });

resetReviewsToSeed()
  .then(() => {
    console.log('Seeded Supabase reviews from the repository seed catalog.');
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
