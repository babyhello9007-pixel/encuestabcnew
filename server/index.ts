import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { registerSurveysRoutes } from "./routes/surveys.js";
import { registerMiscSurveysRoutes } from "./routes/misc-surveys.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware: Parse JSON
  app.use(express.json());

  // Resolve the static path
  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  // Register surveys routes FIRST (before static files)
  await registerSurveysRoutes(app);
  
  // Register misc surveys routes FIRST (before static files)
  await registerMiscSurveysRoutes(app);

  // Endpoint para poblar encuestadoras
  app.post("/api/populate-encuestadoras", async (req, res) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://hlhzxxeqfznwutgkdvdp.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHp4eGVxZnpud3V0Z2tkdmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzOTExMSwiZXhwIjoyMDc2OTE1MTExfQ.xQKvvPrjCEYZNBjlEAzpGFHNEqHEKXGCnLPqFIHhZjk';
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const encuestadoras = [
        { nombre: 'Centro de Investigaciones Sociológicas', sigla: 'CIS', pais: 'España', sitio_web: 'https://www.cis.es', logo_url: 'https://www.cis.es/cis/export/sites/default/galerias/ficheros/logo-cis.png', credibilidad: 95 },
        { nombre: 'Metroscopia', sigla: 'Metroscopia', pais: 'España', sitio_web: 'https://www.metroscopia.org', logo_url: 'https://www.metroscopia.org/images/logo-metroscopia.png', credibilidad: 88 },
        { nombre: 'GAD3', sigla: 'GAD3', pais: 'España', sitio_web: 'https://www.gad3.com', logo_url: 'https://www.gad3.com/images/logo-gad3.png', credibilidad: 82 },
        { nombre: 'Sigma Dos', sigla: 'Sigma Dos', pais: 'España', sitio_web: 'https://www.sigmados.es', logo_url: 'https://www.sigmados.es/images/logo-sigmados.png', credibilidad: 85 },
        { nombre: 'DYM', sigla: 'DYM', pais: 'España', sitio_web: 'https://www.dym.es', logo_url: 'https://www.dym.es/images/logo-dym.png', credibilidad: 78 },
        { nombre: 'Celeste-Tel', sigla: 'Celeste-Tel', pais: 'España', sitio_web: 'https://www.celestetel.com', logo_url: 'https://www.celestetel.com/images/logo-celestetel.png', credibilidad: 75 },
        { nombre: 'Invymark', sigla: 'Invymark', pais: 'España', sitio_web: 'https://www.invymark.com', logo_url: 'https://www.invymark.com/images/logo-invymark.png', credibilidad: 72 },
        { nombre: 'Electomania', sigla: 'Electomania', pais: 'España', sitio_web: 'https://www.electomania.es', logo_url: 'https://www.electomania.es/images/logo-electomania.png', credibilidad: 70 },
        { nombre: 'Sondea', sigla: 'Sondea', pais: 'España', sitio_web: 'https://www.sondea.es', logo_url: 'https://www.sondea.es/images/logo-sondea.png', credibilidad: 68 },
        { nombre: 'Iop Consulting', sigla: 'IOP', pais: 'España', sitio_web: 'https://www.iopconsulting.com', logo_url: 'https://www.iopconsulting.com/images/logo-iop.png', credibilidad: 65 },
        { nombre: 'La Encuesta de Batalla Cultural', sigla: 'BC', pais: 'España', sitio_web: 'https://encuestabc.manus.space', logo_url: 'https://encuestabc.manus.space/logo-bc.svg', credibilidad: 100 },
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

  // Middleware: Serve static files with proper headers
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

  // Middleware: Serve index.html for client-side routing
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

