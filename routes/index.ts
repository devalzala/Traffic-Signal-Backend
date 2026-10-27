import { Router } from 'express'
import healthRoutes from './health.routes'
import signalConfigRoutes from './signalConfig.routes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/configurations', signalConfigRoutes)

export default router
