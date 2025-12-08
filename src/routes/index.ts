import { Router } from 'express';
import healthRouter from './health';
import locationsRouter from './locations';

const router = Router();

router.use('/health', healthRouter);
router.use('/locations', locationsRouter);

export default router;
