import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "../../client/src/lib/surveyData";
import { getDb } from "../db";

// Schema para validar actualizaciones de partidos
const partyUpdateSchema = z.object({
  partyKey: z.string().min(1, "Party key is required"),
  displayName: z.string().min(1, "Display name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  logoUrl: z.string().url("Invalid URL"),
  isActive: z.boolean().default(true),
});

// Cache en memoria para cambios de partidos
const partyConfigCache = new Map<string, any>();

export const partiesRouter = router({
  // Obtener todas las configuraciones de partidos
  getAll: protectedProcedure.query(async () => {
    try {
      const parties = Object.entries(PARTIES_GENERAL).map(([key, party]) => {
        const cached = partyConfigCache.get(key);
        return {
          partyKey: key,
          displayName: cached?.displayName || party.name,
          color: cached?.color || party.color,
          logoUrl: cached?.logoUrl || party.logo,
          isActive: cached?.isActive !== false,
          type: "general",
        };
      });

      const youth = Object.entries(YOUTH_ASSOCIATIONS).map(([key, assoc]) => {
        const cached = partyConfigCache.get(key);
        return {
          partyKey: key,
          displayName: cached?.displayName || assoc.name,
          color: cached?.color || assoc.color,
          logoUrl: cached?.logoUrl || assoc.logo,
          isActive: cached?.isActive !== false,
          type: "youth",
        };
      });

      return {
        parties,
        youth,
        total: parties.length + youth.length,
      };
    } catch (error) {
      console.error("[Parties Router] Error fetching parties:", error);
      throw error;
    }
  }),

  // Obtener un partido específico
  getByKey: protectedProcedure
    .input(z.object({ partyKey: z.string() }))
    .query(async ({ input }) => {
      try {
        const cached = partyConfigCache.get(input.partyKey);
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        
        if (party) {
          return {
            partyKey: input.partyKey,
            displayName: cached?.displayName || party.name,
            color: cached?.color || party.color,
            logoUrl: cached?.logoUrl || party.logo,
            isActive: cached?.isActive !== false,
            type: "general",
          };
        }

        const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];
        if (youth) {
          return {
            partyKey: input.partyKey,
            displayName: cached?.displayName || youth.name,
            color: cached?.color || youth.color,
            logoUrl: cached?.logoUrl || youth.logo,
            isActive: cached?.isActive !== false,
            type: "youth",
          };
        }

        throw new Error("Party not found");
      } catch (error) {
        console.error("[Parties Router] Error fetching party:", error);
        throw error;
      }
    }),

  // Actualizar configuración de un partido
  update: protectedProcedure
    .input(partyUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar que el partido existe
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];

        if (!party && !youth) {
          throw new Error("Party not found");
        }

        // Obtener valor anterior para historial
        const cached = partyConfigCache.get(input.partyKey);
        const oldLogoUrl = cached?.logoUrl || party?.logo || youth?.logo;

        // Guardar en cache en memoria
        partyConfigCache.set(input.partyKey, {
          displayName: input.displayName,
          color: input.color,
          logoUrl: input.logoUrl,
          isActive: input.isActive,
          updatedAt: new Date(),
          updatedBy: ctx.user?.id,
        });

        // Registrar en historial (cuando BD esté disponible)
        const db = await getDb();
        if (db) {
          try {
            console.log(`[Parties Router] Recorded history for party: ${input.partyKey}`, {
              oldLogoUrl,
              newLogoUrl: input.logoUrl,
              changedBy: ctx.user?.id,
              timestamp: new Date(),
            });
            // TODO: Guardar en party_logo_history cuando tabla esté disponible
          } catch (dbError) {
            console.warn("[Parties Router] Could not record history:", dbError);
          }
        }

        console.log(`[Parties Router] Updated party: ${input.partyKey}`, input);

        return {
          success: true,
          message: `Party ${input.displayName} updated successfully`,
          data: input,
        };
      } catch (error) {
        console.error("[Parties Router] Error updating party:", error);
        throw error;
      }
    }),

  // Agregar nuevo partido
  create: protectedProcedure
    .input(
      z.object({
        partyKey: z.string().min(1),
        displayName: z.string().min(1),
        color: z.string().regex(/^#[0-9A-F]{6}$/i),
        logoUrl: z.string().url(),
        type: z.enum(["general", "youth"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar que no existe ya
        const existing = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        const existingYouth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];

        if (existing || existingYouth) {
          throw new Error("Party key already exists");
        }

        // Guardar en cache
        partyConfigCache.set(input.partyKey, {
          displayName: input.displayName,
          color: input.color,
          logoUrl: input.logoUrl,
          isActive: true,
          createdAt: new Date(),
          createdBy: ctx.user?.id,
        });

        console.log(`[Parties Router] Created new party: ${input.partyKey}`, input);

        return {
          success: true,
          message: `Party ${input.displayName} created successfully`,
          data: input,
        };
      } catch (error) {
        console.error("[Parties Router] Error creating party:", error);
        throw error;
      }
    }),

  // Eliminar partido
  delete: protectedProcedure
    .input(z.object({ partyKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar que existe
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];

        if (!party && !youth) {
          throw new Error("Party not found");
        }

        // Marcar como inactivo en cache
        const cached = partyConfigCache.get(input.partyKey) || {};
        partyConfigCache.set(input.partyKey, {
          ...cached,
          isActive: false,
          deletedAt: new Date(),
          deletedBy: ctx.user?.id,
        });

        console.log(`[Parties Router] Deleted party: ${input.partyKey}`);

        return {
          success: true,
          message: `Party deleted successfully`,
        };
      } catch (error) {
        console.error("[Parties Router] Error deleting party:", error);
        throw error;
      }
    }),
});

export type PartiesRouter = typeof partiesRouter;
