import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Esquema de validación para envío de respuestas
const submitResponseSchema = z.object({
  apiKey: z.string().min(32, 'API key inválida'),
  questionId: z.string().min(1, 'Question ID requerido'),
  responseValue: z.union([z.string(), z.number(), z.boolean()]),
  userIp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const bcapiRouter = router({
  /**
   * Endpoint para enviar respuestas desde terceros
   * POST /api/trpc/bcapi.submitResponse
   *
   * Ejemplo de request:
   * {
   *   "apiKey": "bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
   *   "questionId": "voto_generales",
   *   "responseValue": "PP",
   *   "userIp": "192.168.1.1",
   *   "metadata": {
   *     "source": "external_website",
   *     "campaign": "2025_election"
   *   }
   * }
   */
  submitResponse: publicProcedure
    .input(submitResponseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Implementar validación de API key
        // 1. Buscar API key en tabla bcapi_keys
        // 2. Verificar que no esté revocada
        // 3. Verificar rate limit

        // TODO: Implementar validación de origen
        // 1. Obtener IP del cliente
        // 2. Validar CORS si es necesario

        // TODO: Implementar guardado de respuesta
        // 1. Insertar en tabla bcapi_responses
        // 2. Integrar con tabla respuestas para que cuente en estadísticas

        return {
          success: true,
          message: 'Respuesta registrada exitosamente',
          id: 'bcapi_response_' + Date.now(),
        };
      } catch (error) {
        console.error('[BCApi] Error submitting response:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al registrar la respuesta',
        });
      }
    }),

  /**
   * Endpoint para validar una API key
   * GET /api/trpc/bcapi.validateKey
   */
  validateKey: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      try {
        // TODO: Implementar validación de API key
        // 1. Buscar API key en tabla bcapi_keys
        // 2. Verificar que no esté revocada
        // 3. Retornar información de la clave

        return {
          valid: true,
          website: 'example.com',
          rateLimit: 1000,
          requestsToday: 150,
        };
      } catch (error) {
        console.error('[BCApi] Error validating key:', error);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'API key inválida',
        });
      }
    }),

  /**
   * Endpoint para obtener estadísticas de uso de una API key
   * GET /api/trpc/bcapi.getStats
   */
  getStats: publicProcedure
    .input(z.object({ apiKey: z.string() }))
    .query(async ({ input }) => {
      try {
        // TODO: Implementar obtención de estadísticas
        // 1. Buscar API key en tabla bcapi_keys
        // 2. Contar respuestas en tabla bcapi_responses
        // 3. Calcular estadísticas de uso

        return {
          apiKey: input.apiKey,
          website: 'example.com',
          totalRequests: 1500,
          requestsToday: 150,
          requestsThisMonth: 5000,
          rateLimit: 1000,
          rateResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          responsesIntegrated: 1500,
          lastRequest: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        };
      } catch (error) {
        console.error('[BCApi] Error getting stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al obtener estadísticas',
        });
      }
    }),
});
