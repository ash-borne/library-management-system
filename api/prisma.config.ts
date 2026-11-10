import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Used by "npx prisma db seed"
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Read from .env. Left empty when unset so "prisma generate" still works
    // on a fresh clone; migrate and seed need a real value.
    url: process.env.DATABASE_URL ?? '',
  },
});
