import 'dotenv/config'
import { Pool } from 'pg'

export const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'traffic_signal',
})

export const connectDB = async (): Promise<void> => {
  const client = await pool.connect()
  client.release()
  console.log('PostgreSQL connected')
}
