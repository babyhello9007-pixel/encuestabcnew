import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

    // Escuchar eventos de cambios de partidos
    socket.on("party:updated", (data) => {
      console.log(`[WebSocket] Partido actualizado: ${data.partyKey}`);
      // Emitir a todos los clientes conectados
      io?.emit("party:updated", data);
    });

    socket.on("party:created", (data) => {
      console.log(`[WebSocket] Partido creado: ${data.partyKey}`);
      io?.emit("party:created", data);
    });

    socket.on("party:deleted", (data) => {
      console.log(`[WebSocket] Partido eliminado: ${data.partyKey}`);
      io?.emit("party:deleted", data);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

export function getWebSocketServer() {
  return io;
}

export function emitPartyUpdate(data: any) {
  if (io) {
    io.emit("party:updated", data);
  }
}

export function emitPartyCreate(data: any) {
  if (io) {
    io.emit("party:created", data);
  }
}

export function emitPartyDelete(data: any) {
  if (io) {
    io.emit("party:deleted", data);
  }
}
