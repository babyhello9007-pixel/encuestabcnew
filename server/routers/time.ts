import { publicProcedure, router } from '../_core/trpc';

export const timeRouter = router({
  /**
   * Obtiene la hora actual del servidor en milisegundos desde epoch
   * Se usa para sincronizar el reloj del cliente con el servidor
   * y evitar manipulaciones del tiempo del cliente
   */
  getCurrentTime: publicProcedure.query(async () => {
    return {
      timestamp: Date.now(),
      iso: new Date().toISOString(),
    };
  }),
});
