import { publicProcedure, router } from "./_core/trpc";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

// Crear cliente de Supabase si la clave está disponible
function getSupabaseClient() {
  if (!ENV.supabaseKey) {
    console.warn("[Survey] Supabase key not configured");
    return null;
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseKey);
}

export const surveyRouter = router({
  // Obtener total de respuestas
  getTotalResponses: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return 0;

      const { data: viewData, error: viewError } = await client
        .from("total_respuestas_view")
        .select("total_respuestas");

      if (!viewError && viewData && viewData.length > 0) {
        return viewData[0].total_respuestas;
      }

      const { count, error: countError } = await client
        .from("respuestas")
        .select("*", { count: "exact", head: true });

      if (!countError && count !== null) {
        return count;
      }

      return 0;
    } catch (error) {
      console.error("[Survey] Error fetching total responses:", error);
      return 0;
    }
  }),

  // Obtener votos generales
  getGeneralVotes: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("votos_generales_totales")
        .select("*");

      if (error) {
        console.error("[Survey] Error fetching general votes:", error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error("[Survey] Error fetching general votes:", error);
      return null;
    }
  }),

  // Obtener votos juveniles
  getYouthVotes: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("votos_juveniles_totales")
        .select("*");

      if (error) {
        console.error("[Survey] Error fetching youth votes:", error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error("[Survey] Error fetching youth votes:", error);
      return null;
    }
  }),

  // Obtener valoraciones de líderes
  getLeaderRatings: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("valoraciones_lideres_view")
        .select("*");

      if (error) {
        console.error("[Survey] Error fetching leader ratings:", error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error("[Survey] Error fetching leader ratings:", error);
      return null;
    }
  }),

  // Obtener edad promedio
  getAverageAge: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("edad_promedio")
        .select("edad_promedio");

      if (error) {
        console.error("[Survey] Error fetching average age:", error);
        return null;
      }

      return data?.[0]?.edad_promedio || null;
    } catch (error) {
      console.error("[Survey] Error fetching average age:", error);
      return null;
    }
  }),

  // Obtener ideología promedio
  getAverageIdeology: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("ideologia_promedio")
        .select("ideologia_promedio");

      if (error) {
        console.error("[Survey] Error fetching average ideology:", error);
        return null;
      }

      return data?.[0]?.ideologia_promedio || null;
    } catch (error) {
      console.error("[Survey] Error fetching average ideology:", error);
      return null;
    }
  }),

  // Obtener métricas por partido (edad e ideología)
  getGeneralMetrics: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("edad_ideologia_por_partido")
        .select("*");

      if (error) {
        console.error("[Survey] Error fetching general metrics:", error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error("[Survey] Error fetching general metrics:", error);
      return null;
    }
  }),

  // Obtener métricas por asociación (edad e ideología)
  getYouthMetrics: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("edad_ideologia_por_asociacion")
        .select("*");

      if (error) {
        console.error("[Survey] Error fetching youth metrics:", error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error("[Survey] Error fetching youth metrics:", error);
      return null;
    }
  }),

  // Obtener historial de votos por fecha
  getVoteHistory: publicProcedure.query(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return null;

      const { data, error } = await client
        .from("historial_votos_por_fecha")
        .select("*");

      if (error) {
        console.error("[Survey] Error fetching vote history:", error);
        return null;
      }

      return data || [];
    } catch (error) {
      console.error("[Survey] Error fetching vote history:", error);
      return null;
    }
  }),
});

