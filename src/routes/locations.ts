import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../services/supabase';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

const nearbyQuerySchema = z.object({
  lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
  lng: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  radius: z.string().transform(Number).pipe(z.number().min(100).max(50000)).default('5000'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  category: z.string().optional(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)).optional(),
  lng: z.string().transform(Number).pipe(z.number().min(-180).max(180)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
});

// GET /api/locations/nearby
router.get('/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = nearbyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const error: ApiError = new Error('Invalid query parameters');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const { lat, lng, radius, limit, category } = parsed.data;
    const supabase = getSupabaseClient();

    // Call the get_nearby_locations function
    const { data, error } = await supabase.rpc('get_nearby_locations', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radius,
      max_results: limit,
      category_filter: category || null,
    });

    if (error) {
      const apiError: ApiError = new Error(error.message);
      apiError.statusCode = 500;
      apiError.code = 'DATABASE_ERROR';
      throw apiError;
    }

    res.json({
      data: data || [],
      meta: {
        total: data?.length || 0,
        center: { lat, lng },
        radius,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/locations/search
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const error: ApiError = new Error('Invalid query parameters');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const { q, lat, lng, limit } = parsed.data;
    const supabase = getSupabaseClient();

    let query = supabase
      .from('locations')
      .select('*')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      const apiError: ApiError = new Error(error.message);
      apiError.statusCode = 500;
      apiError.code = 'DATABASE_ERROR';
      throw apiError;
    }

    res.json({
      data: data || [],
      meta: {
        query: q,
        total: data?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/locations/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        categories (id, name, icon),
        reviews (id, rating, comment, created_at, user_id)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const apiError: ApiError = new Error('Location not found');
        apiError.statusCode = 404;
        apiError.code = 'NOT_FOUND';
        throw apiError;
      }
      const apiError: ApiError = new Error(error.message);
      apiError.statusCode = 500;
      apiError.code = 'DATABASE_ERROR';
      throw apiError;
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
