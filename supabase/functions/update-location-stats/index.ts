import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpdateLocationStatsRequest {
  location_id: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

interface LocationStats {
  id: string;
  average_rating: number;
  review_count: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for backend operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse and validate request body
    const body: UpdateLocationStatsRequest = await req.json();

    // Validate required parameters
    if (!body.location_id || typeof body.location_id !== "string") {
      const errorResponse: ApiError = {
        error: "Invalid parameters. location_id is required and must be a string (UUID).",
        code: "INVALID_PARAMETERS",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.location_id)) {
      const errorResponse: ApiError = {
        error: "Invalid location_id format. Must be a valid UUID.",
        code: "INVALID_UUID",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify location exists
    const { data: location, error: locationError } = await supabaseClient
      .from("locations")
      .select("id")
      .eq("id", body.location_id)
      .single();

    if (locationError || !location) {
      const errorResponse: ApiError = {
        error: "Location not found",
        code: "LOCATION_NOT_FOUND",
        details: locationError,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate new stats from reviews
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from("reviews")
      .select("rating")
      .eq("location_id", body.location_id);

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      const errorResponse: ApiError = {
        error: "Failed to fetch reviews for location",
        code: "DATABASE_ERROR",
        details: reviewsError,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate average rating and count
    const reviewCount = reviews?.length ?? 0;
    let averageRating = 0;

    if (reviewCount > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = Math.round((totalRating / reviewCount) * 10) / 10; // Round to 1 decimal
    }

    // Update location stats
    const { data: updatedLocation, error: updateError } = await supabaseClient
      .from("locations")
      .update({
        average_rating: averageRating,
        review_count: reviewCount,
      })
      .eq("id", body.location_id)
      .select("id, average_rating, review_count")
      .single();

    if (updateError) {
      console.error("Error updating location stats:", updateError);
      const errorResponse: ApiError = {
        error: "Failed to update location statistics",
        code: "UPDATE_ERROR",
        details: updateError,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return successful response
    const response: ApiResponse<LocationStats> = {
      data: {
        id: updatedLocation.id,
        average_rating: updatedLocation.average_rating,
        review_count: updatedLocation.review_count,
      },
      message: `Location stats updated successfully. Average rating: ${averageRating}, Review count: ${reviewCount}`,
    };

    console.log(
      `Location ${body.location_id} stats updated:`,
      response.message
    );

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
