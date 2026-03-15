import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { trpc } from "@/lib/trpc";

let globalSocket: Socket | null = null;

export function usePartySync() {
  const utils = trpc.useUtils();
  const socketRef = useRef<Socket | null>(null);
  const connectingRef = useRef(false);

  useEffect(() => {
    // Si ya hay una conexión global, usarla
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      return;
    }

    // Evitar intentos de conexión simultáneos
    if (connectingRef.current) {
      return;
    }

    connectingRef.current = true;

    try {
      // Conectar a WebSocket con timeout
      const socket = io(window.location.origin, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 3,
        transports: ["websocket", "polling"],
        timeout: 5000,
      });

      socketRef.current = socket;
      globalSocket = socket;

      // Escuchar eventos de actualización de partidos
      socket.on("party:updated", (data) => {
        console.log("[WebSocket] Partido actualizado:", data);
        try {
          utils.parties.getAll.invalidate();
          utils.parties.getByKey.invalidate();
        } catch (e) {
          console.warn("[WebSocket] Error invalidating queries:", e);
        }
      });

      socket.on("party:created", (data) => {
        console.log("[WebSocket] Partido creado:", data);
        try {
          utils.parties.getAll.invalidate();
        } catch (e) {
          console.warn("[WebSocket] Error invalidating queries:", e);
        }
      });

      socket.on("party:deleted", (data) => {
        console.log("[WebSocket] Partido eliminado:", data);
        try {
          utils.parties.getAll.invalidate();
        } catch (e) {
          console.warn("[WebSocket] Error invalidating queries:", e);
        }
      });

      socket.on("connect", () => {
        console.log("[WebSocket] Conectado al servidor");
        connectingRef.current = false;
      });

      socket.on("disconnect", () => {
        console.log("[WebSocket] Desconectado del servidor");
        globalSocket = null;
      });

      socket.on("error", (error) => {
        console.warn("[WebSocket] Error de conexión:", error);
        connectingRef.current = false;
      });

      socket.on("connect_error", (error) => {
        console.warn("[WebSocket] Error de conexión:", error);
        connectingRef.current = false;
      });
    } catch (error) {
      console.warn("[WebSocket] Error al inicializar socket:", error);
      connectingRef.current = false;
    }

    return () => {
      // No desconectar globalmente, solo limpiar referencia local
      socketRef.current = null;
    };
  }, [utils]);

  return socketRef.current;
}
