// Run all SQL migrations in Event_backend/migrations in sorted order.
// Usage:
//   node run-all-migrations.js
//   node run-all-migrations.js --baseline

import db from './Config/DatabaseCon.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATION_TABLE = 'schema_migrations';

const args = process.argv.slice(2);
const shouldBaseline = args.includes('--baseline');
const forceArg = args.find((arg) => arg.startsWith('--force='));
const forceFiles = forceArg
    ? forceArg
          .replace('--force=', '')
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
    : [];

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

const ensureMigrationTable = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            file_name VARCHAR(255) NOT NULL UNIQUE,
            batch INT NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_batch (batch)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await query(sql);
};

const getMigrationFiles = () => {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    }

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((name) => name.toLowerCase().endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
};

const getAppliedMigrations = async () => {
    const rows = await query(`SELECT file_name FROM ${MIGRATION_TABLE}`);
    return new Set(rows.map((row) => row.file_name));
};

const getNextBatchNumber = async () => {
    const rows = await query(`SELECT MAX(batch) AS maxBatch FROM ${MIGRATION_TABLE}`);
    const maxBatch = rows?.[0]?.maxBatch ?? 0;
    return Number(maxBatch) + 1;
};

const markAsApplied = async (fileName, batch) => {
    await query(
        `INSERT INTO ${MIGRATION_TABLE} (file_name, batch) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE batch = VALUES(batch)`,
        [fileName, batch]
    );
};

const runMigrationFile = async (fileName) => {
    const filePath = path.join(MIGRATIONS_DIR, fileName);
    const sql = fs.readFileSync(filePath, 'utf8');

    if (!sql || sql.trim().length === 0) {
        console.log(`- Skipping empty migration: ${fileName}`);
        return;
    }

    await query(sql);
};

const closePool = async () => {
    await new Promise((resolve) => {
        db.end(() => resolve());
    });
};

const main = async () => {
    console.log('Starting migration runner...');

    await ensureMigrationTable();
    const allFiles = getMigrationFiles();

    if (allFiles.length === 0) {
        console.log('No migration files found.');
        return;
    }

    const applied = await getAppliedMigrations();

    if (shouldBaseline) {
        const batch = await getNextBatchNumber();
        for (const fileName of allFiles) {
            if (!applied.has(fileName)) {
                await markAsApplied(fileName, batch);
                console.log(`- Baseline marked: ${fileName}`);
            }
        }
        console.log('Baseline completed.');
        return;
    }

    if (forceFiles.length > 0) {
        const batch = await getNextBatchNumber();
        for (const fileName of forceFiles) {
            if (!allFiles.includes(fileName)) {
                throw new Error(`Migration file not found: ${fileName}`);
            }

            console.log(`- Force running: ${fileName}`);
            await runMigrationFile(fileName);
            await markAsApplied(fileName, batch);
            console.log(`  Done: ${fileName}`);
        }

        console.log('Force migrations completed.');
        return;
    }

    const pending = allFiles.filter((fileName) => !applied.has(fileName));

    if (pending.length === 0) {
        console.log('No pending migrations.');
        return;
    }

    const batch = await getNextBatchNumber();
    console.log(`Applying ${pending.length} migration(s) in batch ${batch}...`);

    for (const fileName of pending) {
        console.log(`- Running: ${fileName}`);
        await runMigrationFile(fileName);
        await markAsApplied(fileName, batch);
        console.log(`  Done: ${fileName}`);
    }

    console.log('All pending migrations applied successfully.');
};

main()
    .catch((error) => {
        console.error('Migration runner failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await closePool();
    });
