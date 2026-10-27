import { pool } from '../config/db'

const DEFAULT_CONFIGS: { type: string; signalTimes: number[] }[] = [
  { type: 'three_way', signalTimes: [30, 25, 20] },
  { type: 'four_way_type1', signalTimes: [30, 25, 20, 15] },
  { type: 'four_way_type2', signalTimes: [20, 20, 20, 20] },
  { type: 'five_way', signalTimes: [30, 25, 20, 15, 10] },
]

const run = async () => {
  for (const { type, signalTimes } of DEFAULT_CONFIGS) {
    await pool.query(
      `INSERT INTO signal_configurations (intersection_type, signal_times)
       VALUES ($1, $2)
       ON CONFLICT (intersection_type) DO NOTHING`,
      [type, signalTimes]
    )
    console.log(`seeded  ${type}`)
  }
}

run()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error('Seeding failed:', err)
    await pool.end()
    process.exit(1)
  })
