import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabla de partidos generales
export const partidosGenerales = mysqlTable("partidos_generales", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  escanos: int("escanos").default(0),
  logoPath: text("logo_path"),
});

export type PartidoGeneral = typeof partidosGenerales.$inferSelect;
export type InsertPartidoGeneral = typeof partidosGenerales.$inferInsert;

// Tabla de asociaciones juveniles
export const asociacionesJuveniles = mysqlTable("asociaciones_juveniles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  escanos: int("escanos").default(0),
  logoPath: text("logo_path"),
});

export type AsociacionJuvenil = typeof asociacionesJuveniles.$inferSelect;
export type InsertAsociacionJuvenil = typeof asociacionesJuveniles.$inferInsert;

// Tabla de archivos
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: int("file_size"),
  fileType: varchar("file_type", { length: 100 }),
  s3Key: text("s3_key").notNull(),
  s3Url: text("s3_url"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// Tabla de entradas del blog
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }).default("Batalla Cultural"),
  featuredImage: text("featured_image"),
  published: int("published").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;