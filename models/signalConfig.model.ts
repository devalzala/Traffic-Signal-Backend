import { pool } from '../config/db'

export const INTERSECTION_TYPES = [
  'three_way',
  'four_way_type1',
  'four_way_type2',
  'five_way',
] as const

export type IntersectionType = (typeof INTERSECTION_TYPES)[number]

export const SIGNAL_COUNT: Record<IntersectionType, number> = {
  three_way: 3,
  four_way_type1: 4,
  four_way_type2: 4,
  five_way: 5,
}

export interface SignalConfig {
  id: number
  intersectionType: IntersectionType
  signalTimes: number[]
  emergencyTime: number
  createdAt: Date
  updatedAt: Date
}

const COLUMNS = `
  id,
  intersection_type AS "intersectionType",
  signal_times AS "signalTimes",
  emergency_time AS "emergencyTime",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`

export const findAll = async (): Promise<SignalConfig[]> => {
  const { rows } = await pool.query<SignalConfig>(
    `SELECT ${COLUMNS} FROM signal_configurations ORDER BY id`
  )
  return rows
}

export const findByType = async (type: IntersectionType): Promise<SignalConfig | null> => {
  const { rows } = await pool.query<SignalConfig>(
    `SELECT ${COLUMNS} FROM signal_configurations WHERE intersection_type = $1`,
    [type]
  )
  return rows[0] ?? null
}

export const upsert = async (
  type: IntersectionType,
  signalTimes: number[]
): Promise<SignalConfig> => {
  const { rows } = await pool.query<SignalConfig>(
    `INSERT INTO signal_configurations (intersection_type, signal_times)
     VALUES ($1, $2)
     ON CONFLICT (intersection_type)
     DO UPDATE SET signal_times = EXCLUDED.signal_times, updated_at = NOW()
     RETURNING ${COLUMNS}`,
    [type, signalTimes]
  )
  return rows[0]
}
