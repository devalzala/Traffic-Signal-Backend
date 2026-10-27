import fs from 'fs'
import path from 'path'
import { pool } from '../config/db'

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

const run = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const applied = new Set(
    (await pool.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map(
      (r) => r.name
    )
  )

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip    ${file}`)
      continue
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`applied ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

run()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error('Migration failed:', err)
    await pool.end()
    process.exit(1)
  })
