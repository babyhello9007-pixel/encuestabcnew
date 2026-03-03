import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerDiscordOAuthRoutes } from "./discordOAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import uploadRouter from "../routes/upload";
import { initializeWebSocket } from "../websocket";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Inicializar WebSocket
  initializeWebSocket(server);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Discord OAuth callback under /api/auth/discord/callback
  registerDiscordOAuthRoutes(app);
  // Upload router
  app.use('/api', uploadRouter);
  // Endpoint para poblar encuestadoras
  app.post("/api/populate-encuestadoras", async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://hlhzxxeqfznwutgkdvdp.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzkxMTEsImV4cCI6MjA3NjkxNTExMX0.PQD752L7jIc-XH76BkqI5owpGFW3QA_TIIe7zYCq7HQ';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const encuestadoras = [
        { nombre: 'Centro de Investigaciones Sociológicas', sigla: 'CIS', pais: 'España', sitio_web: 'https://www.cis.es', logo: 'https://www.cis.es/cis/export/sites/default/galerias/ficheros/logo-cis.png', credibilidad: 95 },
        { nombre: 'Metroscopia', sigla: 'Metroscopia', pais: 'España', sitio_web: 'https://www.metroscopia.org', logo: 'https://www.metroscopia.org/images/logo-metroscopia.png', credibilidad: 88 },
        { nombre: 'GAD3', sigla: 'GAD3', pais: 'España', sitio_web: 'https://www.gad3.com', logo: 'https://www.gad3.com/images/logo-gad3.png', credibilidad: 82 },
        { nombre: 'Sigma Dos', sigla: 'Sigma Dos', pais: 'España', sitio_web: 'https://www.sigmados.es', logo: 'https://www.sigmados.es/images/logo-sigmados.png', credibilidad: 85 },
        { nombre: 'DYM', sigla: 'DYM', pais: 'España', sitio_web: 'https://www.dym.es', logo: 'https://www.dym.es/images/logo-dym.png', credibilidad: 78 },
        { nombre: 'Celeste-Tel', sigla: 'Celeste-Tel', pais: 'España', sitio_web: 'https://www.celestetel.com', logo: 'https://www.celestetel.com/images/logo-celestetel.png', credibilidad: 75 },
        { nombre: 'Invymark', sigla: 'Invymark', pais: 'España', sitio_web: 'https://www.invymark.com', logo: 'https://www.invymark.com/images/logo-invymark.png', credibilidad: 72 },
        { nombre: 'Electomania', sigla: 'Electomania', pais: 'España', sitio_web: 'https://www.electomania.es', logo: 'https://www.electomania.es/images/logo-electomania.png', credibilidad: 70 },
        { nombre: 'Sondea', sigla: 'Sondea', pais: 'España', sitio_web: 'https://www.sondea.es', logo: 'https://www.sondea.es/images/logo-sondea.png', credibilidad: 68 },
        { nombre: 'Iop Consulting', sigla: 'IOP', pais: 'España', sitio_web: 'https://www.iopconsulting.com', logo: 'https://www.iopconsulting.com/images/logo-iop.png', credibilidad: 65 },
        { nombre: 'La Encuesta de Batalla Cultural', sigla: 'BC', pais: 'España', sitio_web: 'https://encuestabc.manus.space', logo: 'https://encuestabc.manus.space/logo-bc.svg', credibilidad: 100 },
      ];
      
      const { data, error } = await supabase.from('encuestadoras').upsert(encuestadoras, { onConflict: 'nombre' });
      
      if (error) {
        console.error('Error al insertar encuestadoras:', error);
        res.status(500).json({ error: error.message });
      } else {
        res.json({ success: true, count: encuestadoras.length });
      }
    } catch (err) {
      console.error('Error en populate:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
