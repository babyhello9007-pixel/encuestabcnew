import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { blogPosts, InsertBlogPost } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Función para generar slug a partir del título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const blogRouter = router({
  // Obtener todas las entradas publicadas
  getPublished: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.published, 1))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(100);
      return posts;
    } catch (error) {
      console.error("[Blog] Error fetching published posts:", error);
      return [];
    }
  }),

  // Obtener una entrada por slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const post = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, input.slug))
          .limit(1);
        return post[0] || null;
      } catch (error) {
        console.error("[Blog] Error fetching post by slug:", error);
        return null;
      }
    }),

  // Obtener todas las entradas (admin)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Solo admins pueden ver todas las entradas
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) return [];

    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt))
        .limit(100);
      return posts;
    } catch (error) {
      console.error("[Blog] Error fetching all posts:", error);
      return [];
    }
  }),

  // Crear nueva entrada (admin)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        author: z.string().optional(),
        featuredImage: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Solo admins pueden crear entradas
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const slug = generateSlug(input.title);
        const newPost: InsertBlogPost = {
          title: input.title,
          slug,
          excerpt: input.excerpt || null,
          content: input.content,
          author: input.author || "Batalla Cultural",
          featuredImage: input.featuredImage || null,
          published: input.published ? 1 : 0,
          publishedAt: input.published ? new Date() : null,
        };

        await db.insert(blogPosts).values(newPost);
        return { success: true };
      } catch (error) {
        console.error("[Blog] Error creating post:", error);
        throw new Error("Failed to create blog post");
      }
    }),

  // Actualizar entrada (admin)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        author: z.string().optional(),
        featuredImage: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Solo admins pueden actualizar entradas
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updateData: Record<string, any> = {};

        if (input.title) {
          updateData.title = input.title;
          updateData.slug = generateSlug(input.title);
        }
        if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
        if (input.content) updateData.content = input.content;
        if (input.author !== undefined) updateData.author = input.author;
        if (input.featuredImage !== undefined)
          updateData.featuredImage = input.featuredImage;

        if (input.published !== undefined) {
          updateData.published = input.published ? 1 : 0;
          if (input.published) {
            updateData.publishedAt = new Date();
          }
        }

        await db
          .update(blogPosts)
          .set(updateData)
          .where(eq(blogPosts.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Blog] Error updating post:", error);
        throw new Error("Failed to update blog post");
      }
    }),

  // Eliminar entrada (admin)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Solo admins pueden eliminar entradas
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("[Blog] Error deleting post:", error);
        throw new Error("Failed to delete blog post");
      }
    }),
});
