import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NearbyLocationsRequest {
  lat: number;
  lng: number;
  radius_km?: number;
  category_id?: string;
  limit?: number;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    radius_km?: number;
  };
  message?: string;
}

interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse and validate request body
    const body: NearbyLocationsRequest = await req.json();

    // Validate required parameters
    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      const errorResponse: ApiError = {
        error: "Invalid parameters. Both lat and lng are required and must be numbers.",
        code: "INVALID_PARAMETERS",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate latitude range (-90 to 90)
    if (body.lat < -90 || body.lat > 90) {
      const errorResponse: ApiError = {
        error: "Latitude must be between -90 and 90",
        code: "INVALID_LATITUDE",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate longitude range (-180 to 180)
    if (body.lng < -180 || body.lng > 180) {
      const errorResponse: ApiError = {
        error: "Longitude must be between -180 and 180",
        code: "INVALID_LONGITUDE",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Set defaults
    const radiusKm = body.radius_km ?? 5; // Default 5km
    const radiusMeters = radiusKm * 1000;
    const limit = body.limit ?? 50;

    // Validate radius (max 100km)
    if (radiusKm <= 0 || radiusKm > 100) {
      const errorResponse: ApiError = {
        error: "Radius must be between 0 and 100 km",
        code: "INVALID_RADIUS",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate limit (max 200)
    if (limit <= 0 || limit > 200) {
      const errorResponse: ApiError = {
        error: "Limit must be between 1 and 200",
        code: "INVALID_LIMIT",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call the PostGIS function
    const { data, error } = await supabaseClient.rpc("get_nearby_locations", {
      lat: body.lat,
      lng: body.lng,
      radius_meters: radiusMeters,
      category_filter: body.category_id ?? null,
      result_limit: limit,
    });

    if (error) {
      console.error("Database error:", error);
      const errorResponse: ApiError = {
        error: "Failed to fetch nearby locations",
        code: "DATABASE_ERROR",
        details: error,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return successful response
    const response: ApiResponse<typeof data> = {
      data: data ?? [],
      meta: {
        total: data?.length ?? 0,
        radius_km: radiusKm,
      },
      message: `Found ${data?.length ?? 0} locations within ${radiusKm}km`,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    const errorResponse: ApiError = {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      details: error,
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
