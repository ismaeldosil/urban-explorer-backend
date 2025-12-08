import { Router } from 'express';
import { getSupabaseClient } from '../services/supabase';

const router = Router();

router.get('/', async (_req, res) => {
  const startTime = Date.now();

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('categories').select('count').limit(1).single();

    const dbStatus = error ? 'unhealthy' : 'healthy';
    const responseTime = Date.now() - startTime;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
