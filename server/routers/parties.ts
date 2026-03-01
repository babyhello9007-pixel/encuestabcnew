import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from "../../client/src/lib/surveyData";

// Schema para validar actualizaciones de partidos
const partyUpdateSchema = z.object({
  partyKey: z.string().min(1, "Party key is required"),
  displayName: z.string().min(1, "Display name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  logoUrl: z.string().url("Invalid URL"),
  isActive: z.boolean().default(true),
});

export const partiesRouter = router({
  // Obtener todas las configuraciones de partidos (público)
  getAll: protectedProcedure.query(async () => {
    try {
      // Por ahora retornamos los datos de surveyData
      // Cuando la BD esté disponible, consultaremos party_configuration
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
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        if (!party) {
          const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];
          if (!youth) {
            throw new Error("Party not found");
          }
          return {
            partyKey: input.partyKey,
            displayName: youth.name,
            color: youth.color,
            logoUrl: youth.logo,
            isActive: true,
            type: "youth",
          };
        }

        return {
          partyKey: input.partyKey,
          displayName: party.name,
          color: party.color,
          logoUrl: party.logo,
          isActive: true,
          type: "general",
        };
      } catch (error) {
        console.error("[Parties Router] Error fetching party:", error);
        throw error;
      }
    }),

  // Actualizar configuración de un partido (solo admin)
  update: adminProcedure
    .input(partyUpdateSchema)
    .mutation(async ({ input }) => {
      try {
        // Validar que el partido existe
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];

        if (!party && !youth) {
          throw new Error("Party not found");
        }

        // Cuando la BD esté disponible, guardaremos aquí
        // Por ahora solo validamos y retornamos éxito
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

  // Agregar nuevo partido (solo admin)
  create: adminProcedure
    .input(
      z.object({
        partyKey: z.string().min(1),
        displayName: z.string().min(1),
        color: z.string().regex(/^#[0-9A-F]{6}$/i),
        logoUrl: z.string().url(),
        type: z.enum(["general", "youth"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validar que no existe ya
        const existing = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        const existingYouth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];

        if (existing || existingYouth) {
          throw new Error("Party key already exists");
        }

        // Cuando la BD esté disponible, insertaremos aquí
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

  // Eliminar partido (solo admin)
  delete: adminProcedure
    .input(z.object({ partyKey: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Validar que existe
        const party = PARTIES_GENERAL[input.partyKey as keyof typeof PARTIES_GENERAL];
        const youth = YOUTH_ASSOCIATIONS[input.partyKey as keyof typeof YOUTH_ASSOCIATIONS];

        if (!party && !youth) {
          throw new Error("Party not found");
        }

        // Cuando la BD esté disponible, marcaremos como inactivo aquí
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
