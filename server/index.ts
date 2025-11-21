import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

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
        // Add headers to prevent adblocker from blocking images
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
      } else if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
      return express.static(staticPath)(req, res, next);
    }
    
    next();
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

