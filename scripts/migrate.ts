/**
 * Safe database migration runner.
 * Runs drizzle-kit migrate instead of db:push to prevent destructive schema changes.
 *
 * Usage:
 *   npx tsx scripts/migrate.ts
 *
 * This should be used in production instead of `db:push` (which can destructively
 * alter or drop columns). Migrations in the ./migrations folder are applied
 * incrementally and tracked in the __drizzle_migrations table.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');

function run(cmd: string) {
  console.log(`\n► ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

// 1. Ensure migrations folder has content — generate if empty
const migrationsDir = path.join(root, 'migrations');
const hasMigrations = existsSync(migrationsDir) &&
  require('fs').readdirSync(migrationsDir).some((f: string) => f.endsWith('.sql'));

if (!hasMigrations) {
  console.log('No migration files found — generating from current schema...');
  run('npx drizzle-kit generate');
}

// 2. Apply all pending migrations
run('npx drizzle-kit migrate');

console.log('\n✓ Database migrations applied successfully.');
