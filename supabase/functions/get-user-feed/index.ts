import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetUserFeedRequest {
  user_id?: string; // Optional, defaults to authenticated user
  limit?: number;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
  };
  message?: string;
}

interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

interface FeedItem {
  id: string;
  type: "favorite" | "review";
  location: {
    id: string;
    name: string;
    description: string | null;
    photos: string[];
    average_rating: number;
    review_count: number;
    address: string | null;
  };
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
  // Review-specific fields
  rating?: number;
  comment?: string;
  review_photos?: string[];
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

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiError = {
        error: "Unauthorized. Please provide a valid authentication token.",
        code: "UNAUTHORIZED",
        details: authError,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body (GET or POST)
    let body: GetUserFeedRequest = {};
    if (req.method === "POST") {
      body = await req.json();
    }

    // Use authenticated user if no user_id provided
    const targetUserId = body.user_id ?? user.id;
    const limit = body.limit ?? 50;

    // Validate limit
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

    // NOTE: Since there's no followers/following table in the current schema,
    // we'll create a feed based on:
    // 1. Recent reviews from all users (public activity)
    // 2. Popular locations (high rated)
    // For a real social feed, you would need a "follows" table to filter by followed users

    const feedItems: FeedItem[] = [];

    // Fetch recent reviews with location and user details
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        photos,
        created_at,
        user_id,
        profiles!reviews_user_id_fkey (
          id,
          username,
          avatar_url
        ),
        locations!reviews_location_id_fkey (
          id,
          name,
          description,
          photos,
          average_rating,
          review_count,
          address
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(Math.floor(limit / 2)); // Get half of limit for reviews

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
      const errorResponse: ApiError = {
        error: "Failed to fetch reviews for feed",
        code: "DATABASE_ERROR",
        details: reviewsError,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add reviews to feed
    if (reviews) {
      for (const review of reviews) {
        if (review.profiles && review.locations) {
          feedItems.push({
            id: review.id,
            type: "review",
            location: {
              id: review.locations.id,
              name: review.locations.name,
              description: review.locations.description,
              photos: review.locations.photos ?? [],
              average_rating: review.locations.average_rating ?? 0,
              review_count: review.locations.review_count ?? 0,
              address: review.locations.address,
            },
            user: {
              id: review.profiles.id,
              username: review.profiles.username,
              avatar_url: review.profiles.avatar_url,
            },
            created_at: review.created_at,
            rating: review.rating,
            comment: review.comment,
            review_photos: review.photos ?? [],
          });
        }
      }
    }

    // Fetch recent favorites with location and user details
    const { data: favorites, error: favoritesError } = await supabaseClient
      .from("favorites")
      .select(
        `
        id,
        created_at,
        user_id,
        profiles!favorites_user_id_fkey (
          id,
          username,
          avatar_url
        ),
        locations!favorites_location_id_fkey (
          id,
          name,
          description,
          photos,
          average_rating,
          review_count,
          address
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(Math.floor(limit / 2)); // Get half of limit for favorites

    if (favoritesError) {
      console.error("Error fetching favorites:", favoritesError);
      // Don't fail the entire request if favorites fail, just log it
    }

    // Add favorites to feed
    if (favorites) {
      for (const favorite of favorites) {
        if (favorite.profiles && favorite.locations) {
          feedItems.push({
            id: favorite.id,
            type: "favorite",
            location: {
              id: favorite.locations.id,
              name: favorite.locations.name,
              description: favorite.locations.description,
              photos: favorite.locations.photos ?? [],
              average_rating: favorite.locations.average_rating ?? 0,
              review_count: favorite.locations.review_count ?? 0,
              address: favorite.locations.address,
            },
            user: {
              id: favorite.profiles.id,
              username: favorite.profiles.username,
              avatar_url: favorite.profiles.avatar_url,
            },
            created_at: favorite.created_at,
          });
        }
      }
    }

    // Sort all feed items by created_at (most recent first)
    feedItems.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Limit final results
    const limitedFeedItems = feedItems.slice(0, limit);

    // Return successful response
    const response: ApiResponse<FeedItem[]> = {
      data: limitedFeedItems,
      meta: {
        total: limitedFeedItems.length,
      },
      message: `Retrieved ${limitedFeedItems.length} feed items`,
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
