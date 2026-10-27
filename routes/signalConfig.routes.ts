import { Router } from 'express'
import * as SignalConfigController from '../controllers/signalConfig.controller'

const router = Router()

router.get('/', SignalConfigController.getAllConfigs)
router.get('/:type', SignalConfigController.getConfig)
router.put('/:type', SignalConfigController.saveConfig)

export default router
