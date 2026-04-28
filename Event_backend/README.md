# Event Backend

## Run Backend

```bash
npm install
npm start
```

## Database Migrations

All SQL files in `migrations/` are executed in filename order and tracked in the `schema_migrations` table.

### Apply pending migrations

```bash
npm run migrate
```

### Baseline existing migrations (without executing SQL)

Use this only when your database is already in sync and you only want to mark current migration files as applied.

```bash
npm run migrate:baseline
```

### Notes

- Add new migration files to `migrations/` using an ordered prefix (for example: `004_add_new_table.sql`).
- Keep migrations forward-only and idempotent where possible.
- If a migration fails, fix the SQL and rerun `npm run migrate`.
