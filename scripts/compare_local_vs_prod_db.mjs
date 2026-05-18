import mysql from 'mysql2/promise';

const localCfg = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'goeventifydb',
};

const prodCfg = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '7BwYZV8pqsv5d1i.root',
  password: 'JcdhlSC3TEcYfndd',
  database: 'Event_Managment',
  ssl: { rejectUnauthorized: false },
};

function norm(v) {
  return (v ?? '').toString().trim();
}

function keyBy(arr, keyFn) {
  const m = new Map();
  for (const item of arr) m.set(keyFn(item), item);
  return m;
}

async function getTables(conn, db) {
  const [rows] = await conn.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type='BASE TABLE' ORDER BY table_name`,
    [db]
  );
  return rows.map(r => r.table_name);
}

async function getColumns(conn, db) {
  const [rows] = await conn.query(
    `SELECT table_name, column_name, ordinal_position, column_type, is_nullable, column_default, extra, column_key
     FROM information_schema.columns
     WHERE table_schema = ?
     ORDER BY table_name, ordinal_position`,
    [db]
  );
  return rows;
}

async function getIndexes(conn, db) {
  const [rows] = await conn.query(
    `SELECT table_name, index_name, non_unique, seq_in_index, column_name
     FROM information_schema.statistics
     WHERE table_schema = ?
     ORDER BY table_name, index_name, seq_in_index`,
    [db]
  );
  return rows;
}

async function getRowCounts(conn, db, tables) {
  const counts = new Map();
  for (const t of tables) {
    try {
      const [r] = await conn.query(`SELECT COUNT(*) AS c FROM \`${db}\`.\`${t}\``);
      counts.set(t, Number(r[0].c));
    } catch {
      counts.set(t, null);
    }
  }
  return counts;
}

function compareColumns(localCols, prodCols) {
  const byTableLocal = new Map();
  const byTableProd = new Map();

  for (const c of localCols) {
    if (!byTableLocal.has(c.table_name)) byTableLocal.set(c.table_name, []);
    byTableLocal.get(c.table_name).push(c);
  }
  for (const c of prodCols) {
    if (!byTableProd.has(c.table_name)) byTableProd.set(c.table_name, []);
    byTableProd.get(c.table_name).push(c);
  }

  const tables = new Set([...byTableLocal.keys(), ...byTableProd.keys()]);
  const out = [];

  for (const t of [...tables].sort()) {
    const l = byTableLocal.get(t) || [];
    const p = byTableProd.get(t) || [];
    const lm = keyBy(l, x => x.column_name);
    const pm = keyBy(p, x => x.column_name);
    const colNames = new Set([...lm.keys(), ...pm.keys()]);

    for (const cn of [...colNames].sort()) {
      const lc = lm.get(cn);
      const pc = pm.get(cn);
      if (!lc) {
        out.push({ table: t, column: cn, type: 'missing_in_local' });
        continue;
      }
      if (!pc) {
        out.push({ table: t, column: cn, type: 'missing_in_prod' });
        continue;
      }

      const fields = ['column_type', 'is_nullable', 'column_default', 'extra', 'column_key'];
      const diffs = [];
      for (const f of fields) {
        if (norm(lc[f]) !== norm(pc[f])) {
          diffs.push({ field: f, local: lc[f], prod: pc[f] });
        }
      }
      if (diffs.length) {
        out.push({ table: t, column: cn, type: 'definition_mismatch', diffs });
      }
    }
  }

  return out;
}

function compareIndexes(localIdx, prodIdx) {
  const fold = (rows) => {
    const m = new Map();
    for (const r of rows) {
      const key = `${r.table_name}::${r.index_name}`;
      if (!m.has(key)) m.set(key, { table: r.table_name, index: r.index_name, non_unique: r.non_unique, cols: [] });
      m.get(key).cols.push(r.column_name);
    }
    return m;
  };

  const lm = fold(localIdx);
  const pm = fold(prodIdx);
  const keys = new Set([...lm.keys(), ...pm.keys()]);
  const out = [];

  for (const k of [...keys].sort()) {
    const l = lm.get(k);
    const p = pm.get(k);
    if (!l) {
      out.push({ key: k, type: 'missing_in_local', prod: p });
      continue;
    }
    if (!p) {
      out.push({ key: k, type: 'missing_in_prod', local: l });
      continue;
    }
    if (String(l.non_unique) !== String(p.non_unique) || l.cols.join(',') !== p.cols.join(',')) {
      out.push({ key: k, type: 'definition_mismatch', local: l, prod: p });
    }
  }

  return out;
}

async function main() {
  let local;
  let prod;
  try {
    local = await mysql.createConnection(localCfg);
  } catch (e) {
    console.error('LOCAL_CONNECT_ERROR', e.message);
    process.exit(2);
  }

  try {
    prod = await mysql.createConnection(prodCfg);
  } catch (e) {
    console.error('PROD_CONNECT_ERROR', e.message);
    process.exit(3);
  }

  const localTables = await getTables(local, localCfg.database);
  const prodTables = await getTables(prod, prodCfg.database);

  const localSet = new Set(localTables);
  const prodSet = new Set(prodTables);

  const missingInLocal = prodTables.filter(t => !localSet.has(t));
  const missingInProd = localTables.filter(t => !prodSet.has(t));
  const common = localTables.filter(t => prodSet.has(t));

  const [localCols, prodCols, localIdx, prodIdx] = await Promise.all([
    getColumns(local, localCfg.database),
    getColumns(prod, prodCfg.database),
    getIndexes(local, localCfg.database),
    getIndexes(prod, prodCfg.database),
  ]);

  const columnDiffs = compareColumns(localCols, prodCols).filter(d => common.includes(d.table));
  const indexDiffs = compareIndexes(localIdx, prodIdx).filter(d => common.includes((d.key || '').split('::')[0]));

  const [localCounts, prodCounts] = await Promise.all([
    getRowCounts(local, localCfg.database, common),
    getRowCounts(prod, prodCfg.database, common),
  ]);

  const rowCountDiffs = [];
  for (const t of common) {
    const lc = localCounts.get(t);
    const pc = prodCounts.get(t);
    if (lc !== null && pc !== null && lc !== pc) {
      rowCountDiffs.push({ table: t, local: lc, prod: pc, delta: pc - lc });
    }
  }

  const result = {
    localDb: localCfg.database,
    prodDb: prodCfg.database,
    summary: {
      localTableCount: localTables.length,
      prodTableCount: prodTables.length,
      commonTableCount: common.length,
      missingInLocalCount: missingInLocal.length,
      missingInProdCount: missingInProd.length,
      columnDiffCount: columnDiffs.length,
      indexDiffCount: indexDiffs.length,
      rowCountDiffCount: rowCountDiffs.length,
    },
    missingInLocal,
    missingInProd,
    columnDiffs,
    indexDiffs,
    rowCountDiffs: rowCountDiffs.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 200),
  };

  console.log(JSON.stringify(result, null, 2));

  await local.end();
  await prod.end();
}

main().catch((e) => {
  console.error('COMPARE_ERROR', e.message);
  process.exit(1);
});
