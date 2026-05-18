import fs from 'fs';
import path from 'path';
import mysql from 'mysql2';
import mysqlPromise from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
};

if (!cfg.host || !cfg.user || !cfg.database) {
  throw new Error('Missing DB config (DB_HOST/DB_USER/DB_NAME).');
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

const outDir = path.join(__dirname, '..', 'out', 'db_backups');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `prod_${cfg.database}_${stamp}.sql`);

const conn = await mysqlPromise.createConnection(cfg);
const ws = fs.createWriteStream(outFile, { encoding: 'utf8' });

const write = (s = '') => ws.write(s + '\n');

try {
  write('-- Production DB backup');
  write(`-- Database: ${cfg.database}`);
  write(`-- Generated at: ${now.toISOString()}`);
  write('SET FOREIGN_KEY_CHECKS = 0;');
  write('');

  const [tablesRows] = await conn.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type='BASE TABLE' ORDER BY table_name`,
    [cfg.database]
  );

  const tables = tablesRows.map((r) => r.table_name);

  for (const table of tables) {
    const [createRows] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = createRows[0]['Create Table'];

    write(`-- ----------------------------`);
    write(`-- Table: ${table}`);
    write(`-- ----------------------------`);
    write(`DROP TABLE IF EXISTS \`${table}\`;`);
    write(`${createSql};`);

    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (rows.length > 0) {
      const columns = Object.keys(rows[0]).map((c) => `\`${c}\``).join(', ');

      for (const row of rows) {
        const values = Object.values(row).map((v) => mysql.escape(v)).join(', ');
        write(`INSERT INTO \`${table}\` (${columns}) VALUES (${values});`);
      }
    }

    write('');
  }

  write('SET FOREIGN_KEY_CHECKS = 1;');
  write('');

  await new Promise((resolve, reject) => {
    ws.end(() => resolve());
    ws.on('error', reject);
  });

  const st = fs.statSync(outFile);
  console.log(JSON.stringify({ outFile, bytes: st.size, tables: tables.length }, null, 2));
} finally {
  await conn.end();
}
