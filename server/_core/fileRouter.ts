import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { getDb } from "../db";
import { files } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut, storageGet } from "../storage";

export const fileRouter = router({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        fileType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user.id;

        // Convertir base64 a buffer
        const buffer = Buffer.from(input.fileData, "base64");

        // Subir a S3
        const s3Key = `uploads/${userId}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(
          s3Key,
          buffer,
          input.fileType || "application/octet-stream"
        );

        // Guardar en BD
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(files).values({
          userId,
          fileName: input.fileName,
          fileSize: buffer.length,
          fileType: input.fileType || "application/octet-stream",
          s3Key,
          s3Url: url,
        });

        return { success: true, url, s3Key };
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Error al subir archivo");
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userFiles = await db
        .select()
        .from(files)
        .where(eq(files.userId, userId));

      return userFiles;
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error("Error al listar archivos");
    }
  }),

  download: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.user.id;
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const file = await db
          .select()
          .from(files)
          .where(eq(files.id, input.id))
          .limit(1);

        if (!file.length || file[0].userId !== userId) {
          throw new Error("Archivo no encontrado");
        }

        // Obtener URL firmada
        const { url } = await storageGet(file[0].s3Key!);
        return { url };
      } catch (error) {
        console.error("Error downloading file:", error);
        throw new Error("Error al descargar archivo");
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.user.id;
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const file = await db
          .select()
          .from(files)
          .where(eq(files.id, input.id))
          .limit(1);

        if (!file.length || file[0].userId !== userId) {
          throw new Error("Archivo no encontrado");
        }

        // Eliminar de BD
        await db.delete(files).where(eq(files.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Error al eliminar archivo");
      }
    }),

  getProjectFiles: protectedProcedure
    .query(async () => {
      return [
        { path: "client/src/main.tsx", content: "// Main entry point" },
        { path: "client/src/App.tsx", content: "// App router" },
        { path: "client/src/index.css", content: "/* Global styles */" },
        { path: "drizzle/schema.ts", content: "// Database schema" },
        { path: "server/index.ts", content: "// Server entry" },
        { path: "package.json", content: "// Project config" },
      ];
    }),

  // Leer archivos reales del proyecto
  readProjectFile: protectedProcedure
    .input(z.object({ filePath: z.string() }))
    .query(async ({ input }) => {
      try {
        const fs = await import("fs").then(m => m.promises);
        const path = await import("path");
        
        // Validar ruta para seguridad
        const projectRoot = path.resolve(process.cwd());
        const fullPath = path.resolve(projectRoot, input.filePath);
        
        if (!fullPath.startsWith(projectRoot)) {
          throw new Error("Acceso denegado");
        }
        
        const content = await fs.readFile(fullPath, "utf-8");
        return { content, success: true };
      } catch (error) {
        console.error("Error reading file:", error);
        throw new Error("Error al leer archivo");
      }
    }),

  // Escribir archivos reales del proyecto
  writeProjectFile: protectedProcedure
    .input(z.object({ filePath: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const fs = await import("fs").then(m => m.promises);
        const path = await import("path");
        
        // Validar ruta para seguridad
        const projectRoot = path.resolve(process.cwd());
        const fullPath = path.resolve(projectRoot, input.filePath);
        
        if (!fullPath.startsWith(projectRoot)) {
          throw new Error("Acceso denegado");
        }
        
        await fs.writeFile(fullPath, input.content, "utf-8");
        return { success: true };
      } catch (error) {
        console.error("Error writing file:", error);
        throw new Error("Error al guardar archivo");
      }
    }),

  // Listar archivos del proyecto
  listProjectFiles: protectedProcedure
    .query(async () => {
      try {
        const fs = await import("fs").then(m => m.promises);
        const path = await import("path");
        
        const projectRoot = path.resolve(process.cwd());
        const files: string[] = [];
        
        const walk = async (dir: string) => {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (["node_modules", ".git", "dist", "build", ".next"].includes(entry.name)) continue;
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(projectRoot, fullPath);
            
            if (entry.isDirectory()) {
              await walk(fullPath);
            } else {
              files.push(relativePath);
            }
          }
        };
        
        await walk(projectRoot);
        return files.slice(0, 100); // Limitar a 100 archivos
      } catch (error) {
        console.error("Error listing files:", error);
        throw new Error("Error al listar archivos");
      }
    }),
});
