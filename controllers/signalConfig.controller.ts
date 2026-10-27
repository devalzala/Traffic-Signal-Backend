import { Request, Response } from 'express'
import * as SignalConfigService from '../services/signalConfig.service'

export const getAllConfigs = async (_req: Request, res: Response) => {
  const configs = await SignalConfigService.getAllConfigs()
  res.json({ data: configs })
}

export const getConfig = async (req: Request, res: Response) => {
  const config = await SignalConfigService.getConfig(String(req.params.type))
  res.json({ data: config })
}

export const saveConfig = async (req: Request, res: Response) => {
  const config = await SignalConfigService.saveConfig(
    String(req.params.type),
    req.body?.signalTimes
  )
  res.json({ data: config })
}
