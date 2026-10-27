import * as SignalConfigModel from '../models/signalConfig.model'
import {
  INTERSECTION_TYPES,
  SIGNAL_COUNT,
  IntersectionType,
  SignalConfig,
} from '../models/signalConfig.model'
import { HttpError } from '../utils/httpError'

const MIN_SECONDS = 1
const MAX_SECONDS = 600

const parseType = (value: string): IntersectionType => {
  if (!INTERSECTION_TYPES.includes(value as IntersectionType)) {
    throw new HttpError(
      400,
      `Invalid intersection type "${value}". Allowed: ${INTERSECTION_TYPES.join(', ')}`
    )
  }
  return value as IntersectionType
}

const validateSignalTimes = (type: IntersectionType, signalTimes: unknown): number[] => {
  const expected = SIGNAL_COUNT[type]

  if (!Array.isArray(signalTimes) || signalTimes.length !== expected) {
    throw new HttpError(400, `signalTimes must be an array of exactly ${expected} numbers`)
  }

  signalTimes.forEach((t, i) => {
    if (!Number.isInteger(t) || t < MIN_SECONDS || t > MAX_SECONDS) {
      throw new HttpError(
        400,
        `Signal ${i + 1} time must be a whole number between ${MIN_SECONDS} and ${MAX_SECONDS} seconds`
      )
    }
  })

  return signalTimes as number[]
}

export const getAllConfigs = (): Promise<SignalConfig[]> => SignalConfigModel.findAll()

export const getConfig = async (typeParam: string): Promise<SignalConfig> => {
  const type = parseType(typeParam)
  const config = await SignalConfigModel.findByType(type)
  if (!config) {
    throw new HttpError(404, `No configuration found for "${type}"`)
  }
  return config
}

export const saveConfig = async (typeParam: string, signalTimes: unknown): Promise<SignalConfig> => {
  const type = parseType(typeParam)
  const times = validateSignalTimes(type, signalTimes)
  return SignalConfigModel.upsert(type, times)
}
