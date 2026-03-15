import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "../../client/src/lib/surveyData";
import { getDb } from "../db";
import { partyConfiguration, partyStatistics, partyLogoHistoryUpdated } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { emitPartyUpdate, emitPartyCreate, emitPartyDelete } from "../websocket";

// Schema para validar actualizaciones de partidos
const partyUpdateSchema = z.object({
  partyKey: z.string().min(1, "Party key is required"),
  displayName: z.string().min(1, "Display name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  logoUrl: z.string().url("Invalid URL"),
  isActive: z.boolean().default(true),
});

export const partiesRouter = router({
  // Obtener todas las configuraciones de partidos desde BD
  getAll: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      let dbConfigs: any[] = [];
      
      // Obtener configuraciones de BD si está disponible
      if (db) {
        try {
          dbConfigs = await db.select().from(partyConfiguration);
        } catch (dbError) {
          console.warn("[Parties Router] Error reading party_configuration table, using defaults:", dbError);
          // Continuar con datos por defecto
          dbConfigs = [];
        }
      }
      
      const configMap = new Map(dbConfigs.map(c => [c.partyKey, c]));

      // Combinar con datos por defecto
      const parties = Object.entries(PARTIES_GENERAL).map(([key, party]) => {
        const dbConfig = configMap.get(key);
        return {
          partyKey: key,
          displayName: dbConfig?.displayName || party.name,
          color: dbConfig?.color || party.color,
          logoUrl: dbConfig?.logoUrl || party.logo,
          isActive: dbConfig?.isActive !== false,
          type: "general",
        };
      });

      const youth = Object.entries(YOUTH_ASSOCIATIONS).map(([key, assoc]) => {
        const dbConfig = configMap.get(key);
        return {
          partyKey: key,
          displayName: dbConfig?.displayName || assoc.name,
          color: dbConfig?.color || assoc.color,
          logoUrl: dbConfig?.logoUrl || assoc.logo,
          isActive: dbConfig?.isActive !== false,
          type: "youth",
        };
      });

      return {
        parties,
        youth,
        total: parties.length + youth.length,
      };
    } catch (error) {
      console.error("[Parties Router] Error in getAll:", error);
      // Fallback a datos por defecto si todo falla
      const parties = Object.entries(PARTIES_GENERAL).map(([key, party]) => ({
        partyKey: key,
        displayName: party.name,
        color: party.color,
        logoUrl: party.logo,
        isActive: true,
        type: "general",
      }));

      const youth = Object.entries(YOUTH_ASSOCIATIONS).map(([key, assoc]) => ({
        partyKey: key,
        displayName: assoc.name,
        color: assoc.color,
        logoUrl: assoc.logo,
        isActive: true,
        type: "youth",
      }));

      return {
        parties,
        youth,
        total: parties.length + youth.length,
      };
    }
  }),

  // Obtener un partido específico
  getByKey: protectedProcedure
    .input(z.object({ partyKey: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        // Buscar en BD
        const dbConfig = db ? (await db.select().from(partyConfiguration).where(eq(partyConfiguration.partyKey, input.partyKey)).limit(1))[0] : null;
        
        if (dbConfig) {
          return {
            partyKey: dbConfig.partyKey,
            displayName: dbConfig.displayName,
            color: dbConfig.color,
            logoUrl: dbConfig.logoUrl,
            isActive: dbConfig.isActive,
            type: dbConfig.partyType,
          };
        }

        // Fallback a datos por defecto
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        if (party) {
          return {
            partyKey: input.partyKey,
            displayName: party.name,
            color: party.color,
            logoUrl: party.logo,
            isActive: true,
            type: "general",
          };
        }

        const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];
        if (youth) {
          return {
            partyKey: input.partyKey,
            displayName: youth.name,
            color: youth.color,
            logoUrl: youth.logo,
            isActive: true,
            type: "youth",
          };
        }

        throw new Error("Party not found");
      } catch (error) {
        console.error("[Parties Router] Error fetching party:", error);
        throw error;
      }
    }),

  // Actualizar configuración de un partido en BD
  update: publicProcedure
    .input(partyUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Obtener configuración actual
        const existing = (await db.select().from(partyConfiguration).where(eq(partyConfiguration.partyKey, input.partyKey)).limit(1))[0];

        if (existing) {
          // Registrar cambio en historial
          await db.insert(partyLogoHistoryUpdated).values({
            partyKey: input.partyKey,
            changeType: "edit",
            oldDisplayName: existing.displayName,
            newDisplayName: input.displayName,
            oldColor: existing.color,
            newColor: input.color,
            oldLogoUrl: existing.logoUrl,
            newLogoUrl: input.logoUrl,
            changedBy: ctx.user?.id,
            changedByName: ctx.user?.name,
            timestamp: new Date(),
          });

          // Actualizar configuración
          await db.update(partyConfiguration)
            .set({
              displayName: input.displayName,
              color: input.color,
              logoUrl: input.logoUrl,
              isActive: input.isActive,
              updatedAt: new Date(),
              updatedBy: ctx.user?.id,
            })
            .where(eq(partyConfiguration.partyKey, input.partyKey));
        } else {
          // Crear nueva configuración
          await db.insert(partyConfiguration).values({
            partyKey: input.partyKey,
            displayName: input.displayName,
            color: input.color,
            logoUrl: input.logoUrl,
            isActive: input.isActive,
            partyType: "general",
            createdBy: ctx.user?.id,
            updatedBy: ctx.user?.id,
          });
        }

        // Emitir evento WebSocket
        emitPartyUpdate({
          partyKey: input.partyKey,
          displayName: input.displayName,
          color: input.color,
          logoUrl: input.logoUrl,
          isActive: input.isActive,
          updatedBy: ctx.user?.name,
          timestamp: new Date(),
        });

        return {
          success: true,
          partyKey: input.partyKey,
          displayName: input.displayName,
        };
      } catch (error) {
        console.error("[Parties Router] Error updating party:", error);
        throw error;
      }
    }),

  // Crear nuevo partido
  create: publicProcedure
    .input(partyUpdateSchema.extend({ partyType: z.enum(["general", "youth"]) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(partyConfiguration).values({
          partyKey: input.partyKey,
          displayName: input.displayName,
          color: input.color,
          logoUrl: input.logoUrl,
          isActive: input.isActive,
          partyType: input.partyType,
          createdBy: ctx.user?.id,
          updatedBy: ctx.user?.id,
        });

        // Emitir evento WebSocket
        emitPartyCreate({
          partyKey: input.partyKey,
          displayName: input.displayName,
          color: input.color,
          logoUrl: input.logoUrl,
          isActive: input.isActive,
          partyType: input.partyType,
          createdBy: ctx.user?.name,
          timestamp: new Date(),
        });

        return {
          success: true,
          partyKey: input.partyKey,
        };
      } catch (error) {
        console.error("[Parties Router] Error creating party:", error);
        throw error;
      }
    }),

  // Eliminar partido
  delete: publicProcedure
    .input(z.object({ partyKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Registrar eliminación en historial
        const existing = (await db.select().from(partyConfiguration).where(eq(partyConfiguration.partyKey, input.partyKey)).limit(1))[0];
        
        if (existing) {
          await db.insert(partyLogoHistoryUpdated).values({
            partyKey: input.partyKey,
            changeType: "delete",
            oldDisplayName: existing.displayName,
            oldColor: existing.color,
            oldLogoUrl: existing.logoUrl,
            changedBy: ctx.user?.id,
            changedByName: ctx.user?.name,
            timestamp: new Date(),
          });

          await db.delete(partyConfiguration).where(eq(partyConfiguration.partyKey, input.partyKey));
        }

        // Emitir evento WebSocket
        emitPartyDelete({
          partyKey: input.partyKey,
          deletedBy: ctx.user?.name,
          timestamp: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error("[Parties Router] Error deleting party:", error);
        throw error;
      }
    }),

  // Obtener estadísticas de partidos
  getStatistics: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const stats = await db.select().from(partyStatistics);
      return stats;
    } catch (error) {
      console.error("[Parties Router] Error fetching statistics:", error);
      return [];
    }
  }),

  // Obtener historial de cambios
  getHistory: protectedProcedure
    .input(z.object({ partyKey: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db.select().from(partyLogoHistoryUpdated);
        
        if (input.partyKey) {
          query = query.where(eq(partyLogoHistoryUpdated.partyKey, input.partyKey));
        }

        const history = await query.limit(input.limit);
        return history;
      } catch (error) {
        console.error("[Parties Router] Error fetching history:", error);
        return [];
      }
    }),
});
