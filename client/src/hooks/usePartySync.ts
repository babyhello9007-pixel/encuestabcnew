import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { trpc } from "@/lib/trpc";

export function usePartySync() {
  const utils = trpc.useUtils();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Evitar crear múltiples conexiones
    if (socketRef.current?.connected) {
      return;
    }

    // Conectar a WebSocket
    socketRef.current = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    // Escuchar eventos de actualización de partidos
    socket.on("party:updated", (data) => {
      console.log("[WebSocket] Partido actualizado:", data);
      // Invalidar queries para refrescar datos
      utils.parties.getAll.invalidate();
      utils.parties.getByKey.invalidate();
    });

    socket.on("party:created", (data) => {
      console.log("[WebSocket] Partido creado:", data);
      utils.parties.getAll.invalidate();
    });

    socket.on("party:deleted", (data) => {
      console.log("[WebSocket] Partido eliminado:", data);
      utils.parties.getAll.invalidate();
    });

    socket.on("connect", () => {
      console.log("[WebSocket] Conectado al servidor");
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Desconectado del servidor");
    });

    socket.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [utils]);

  return socketRef.current;
}
