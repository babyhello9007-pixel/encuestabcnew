import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";

// ============================================================================
// FUNCIÓN AUXILIAR PARA OBTENER CLIENTE SUPABASE
// ============================================================================

async function getSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = "https://hlhzxxeqfznwutgkdvdp.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzkxMTEsImV4cCI6MjA3NjkxNTExMX0.PQD752L7jIc-XH76BkqI5owpGFW3QA_TIIe7zYCq7HQ";
  return createClient(supabaseUrl, supabaseAnonKey);
}

// ============================================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================================

const FiltrosEncuestasSchema = z.object({
  tipoEncuesta: z
    .enum(["generales", "autonomicas", "municipales", "europeas"])
    .default("generales"),
  ambito: z.enum(["nacional", "autonomico", "provincial"]).default("nacional"),
  ccaaOProvincia: z.string().optional(),
  diasAtras: z.number().default(30),
});

const FiltrosPorPartidoSchema = z.object({
  partidoId: z.string(),
  tipoEncuesta: z
    .enum(["generales", "autonomicas", "municipales", "europeas"])
    .default("generales"),
  ambito: z.enum(["nacional", "autonomico", "provincial"]).default("nacional"),
  ccaaOProvincia: z.string().optional(),
});

// ============================================================================
// PROCEDIMIENTOS tRPC
// ============================================================================

export const elAnalisisRouter = router({
  /**
   * Obtener resultados brutos de encuestas
   * Capa 1: Datos crudos por encuesta, partido y fecha
   */
  obtenerResultadosBrutos: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_resultados_brutos")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito)
          .gte(
            "fecha_publicacion",
            new Date(
              Date.now() - input.diasAtras * 24 * 60 * 60 * 1000
            ).toISOString()
          )
          .order("fecha_publicacion", { ascending: false });

        if (error) {
          console.error("Error fetching resultados brutos:", error);
          return [];
        }

        // Filtrar por CCAA/Provincia si se proporciona
        if (input.ccaaOProvincia) {
          return (
            data?.filter((r: any) => r.ccaa_o_provincia === input.ccaaOProvincia) || []
          );
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerResultadosBrutos:", error);
        return [];
      }
    }),

  /**
   * Obtener media de encuestas por fecha
   * Capa 2: Agregación de resultados
   */
  obtenerMediaEncuestas: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_media_encuestas_por_fecha")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito)
          .gte(
            "fecha",
            new Date(Date.now() - input.diasAtras * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )
          .order("fecha", { ascending: false });

        if (error) {
          console.error("Error fetching media encuestas:", error);
          return [];
        }

        // Filtrar por CCAA/Provincia si se proporciona
        if (input.ccaaOProvincia) {
          return (
            data?.filter((r: any) => r.ccaa_o_provincia === input.ccaaOProvincia) || []
          );
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerMediaEncuestas:", error);
        return [];
      }
    }),

  /**
   * Obtener tendencias de últimos 7 días
   */
  obtenerTendencias7Dias: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_tendencias_7_dias")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito);

        if (error) {
          console.error("Error fetching tendencias 7 días:", error);
          return [];
        }

        // Filtrar por CCAA/Provincia si se proporciona
        if (input.ccaaOProvincia) {
          return (
            data?.filter((r: any) => r.ccaa_o_provincia === input.ccaaOProvincia) || []
          );
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerTendencias7Dias:", error);
        return [];
      }
    }),

  /**
   * Obtener tendencias de últimos 30 días
   */
  obtenerTendencias30Dias: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_tendencias_30_dias")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito);

        if (error) {
          console.error("Error fetching tendencias 30 días:", error);
          return [];
        }

        // Filtrar por CCAA/Provincia si se proporciona
        if (input.ccaaOProvincia) {
          return (
            data?.filter((r: any) => r.ccaa_o_provincia === input.ccaaOProvincia) || []
          );
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerTendencias30Dias:", error);
        return [];
      }
    }),

  /**
   * Obtener comparativa de encuestadoras
   * Últimas encuestas de cada encuestadora
   */
  obtenerComparativaEncuestadoras: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_comparativa_encuestadoras")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("posicion", 1) // Solo la última encuesta de cada encuestadora
          .order("nombre_corto", { ascending: true });

        if (error) {
          console.error("Error fetching comparativa encuestadoras:", error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerComparativaEncuestadoras:", error);
        return [];
      }
    }),

  /**
   * Obtener ranking de partidos por media de encuestas
   */
  obtenerRankingPartidos: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_ranking_partidos_media")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito)
          .order("ranking", { ascending: true });

        if (error) {
          console.error("Error fetching ranking partidos:", error);
          return [];
        }

        // Filtrar por CCAA/Provincia si se proporciona
        if (input.ccaaOProvincia) {
          return (
            data?.filter((r: any) => r.ccaa_o_provincia === input.ccaaOProvincia) || []
          );
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerRankingPartidos:", error);
        return [];
      }
    }),

  /**
   * Obtener alertas políticas
   * Cambios significativos en los últimos 14 días
   */
  obtenerAlertasPoliticas: publicProcedure
    .input(FiltrosEncuestasSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from("v_alertas_politicas")
          .select("*")
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito)
          .order("cambio", { ascending: false });

        if (error) {
          console.error("Error fetching alertas políticas:", error);
          return [];
        }

        // Filtrar por CCAA/Provincia si se proporciona
        if (input.ccaaOProvincia) {
          return (
            data?.filter((r: any) => r.ccaa_o_provincia === input.ccaaOProvincia) || []
          );
        }

        return data || [];
      } catch (error) {
        console.error("Error en obtenerAlertasPoliticas:", error);
        return [];
      }
    }),

  /**
   * Obtener datos de un partido específico
   */
  obtenerDatosPartido: publicProcedure
    .input(FiltrosPorPartidoSchema)
    .query(async ({ input }) => {
      try {
        const supabase = await getSupabaseClient();

        // Obtener resultados brutos del partido
        const { data: resultados, error: errorResultados } = await supabase
          .from("v_resultados_brutos")
          .select("*")
          .eq("partido_id", input.partidoId)
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito)
          .order("fecha_publicacion", { ascending: false });

        if (errorResultados) {
          console.error("Error fetching datos partido:", errorResultados);
          return { resultados: [], tendencias: [] };
        }

        // Obtener tendencias del partido
        const { data: tendencias, error: errorTendencias } = await supabase
          .from("v_tendencias_30_dias")
          .select("*")
          .eq("partido_id", input.partidoId)
          .eq("tipo_encuesta", input.tipoEncuesta)
          .eq("ambito", input.ambito);

        if (errorTendencias) {
          console.error("Error fetching tendencias partido:", errorTendencias);
        }

        return {
          resultados: resultados || [],
          tendencias: tendencias || [],
        };
      } catch (error) {
        console.error("Error en obtenerDatosPartido:", error);
        return { resultados: [], tendencias: [] };
      }
    }),

  /**
   * Obtener lista de encuestadoras activas
   */
  obtenerEncuestadoras: publicProcedure.query(async () => {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("encuestadoras")
        .select("*")
        .eq("activa", true)
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error fetching encuestadoras:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error en obtenerEncuestadoras:", error);
      return [];
    }
  }),
});
