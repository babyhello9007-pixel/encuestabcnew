import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { registerSurveysRoutes } from "./routes/surveys.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware: Parse JSON
  app.use(express.json());

  // Resolve the static path
  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  // Middleware 1: Serve static files with proper headers
  app.use((req, res, next) => {
    // Check if the request is for a static file
    const fullPath = path.join(staticPath, req.path);
    
    // If it's a file that exists, serve it
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      // Set cache headers for assets
      if (req.path.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      } else if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
      return express.static(staticPath)(req, res, next);
    }
    
    next();
  });

  // Register surveys routes
  await registerSurveysRoutes(app);

  // Endpoint para eliminar OTROS_VOTOS
  app.post("/api/cleanup-otros-votos", async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://hlhzxxeqfznwutgkdvdp.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzkxMTEsImV4cCI6MjA3NjkxNTExMX0.PQD752L7jIc-XH76BkqI5owpGFW3QA_TIIe7zYCq7HQ';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Eliminar registros de OTROS_VOTOS
      const { error } = await supabase
        .from('votos_generales')
        .delete()
        .eq('partido_id', 'OTROS_VOTOS');
      
      if (error) {
        console.error('Error eliminando OTROS_VOTOS:', error);
        res.status(500).json({ error: error.message });
      } else {
        res.json({ success: true, message: 'OTROS_VOTOS eliminado correctamente' });
      }
    } catch (err) {
      console.error('Error en cleanup:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  // Middleware 2: Serve index.html for client-side routing
  // This handles all non-file routes (like /resultados, /encuesta, etc.)
  app.get("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Not Found");
    }
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

