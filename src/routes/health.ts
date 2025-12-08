import { Router } from 'express';
import { getSupabaseClient } from '../services/supabase';

const router = Router();

// Simple health check - always returns 200 if server is running
router.get('/', async (_req, res) => {
  const startTime = Date.now();

  // Basic health check - server is running
  const basicHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // Try to check database connection (optional, don't fail if DB is unavailable)
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('categories').select('count').limit(1).single();
    const responseTime = Date.now() - startTime;

    res.json({
      ...basicHealth,
      database: error ? 'unhealthy' : 'healthy',
      responseTime: `${responseTime}ms`,
    });
  } catch {
    // Even if DB check fails, server is still healthy
    res.json({
      ...basicHealth,
      database: 'unchecked',
      responseTime: `${Date.now() - startTime}ms`,
    });
  }
});

export default router;
