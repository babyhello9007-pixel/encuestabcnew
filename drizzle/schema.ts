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

// Tabla de respuestas de encuestas
export const respuestas = mysqlTable("respuestas", {
  id: int("id").autoincrement().primaryKey(),
  edad: int("edad"),
  provincia: varchar("provincia", { length: 100 }),
  ccaa: varchar("ccaa", { length: 100 }),
  nacionalidad: varchar("nacionalidad", { length: 100 }),
  voto_generales: varchar("voto_generales", { length: 100 }),
  voto_autonomicas: varchar("voto_autonomicas", { length: 100 }),
  voto_municipales: varchar("voto_municipales", { length: 100 }),
  voto_europeas: varchar("voto_europeas", { length: 100 }),
  nota_ejecutivo: int("nota_ejecutivo"),
  val_feijoo: int("val_feijoo"),
  val_sanchez: int("val_sanchez"),
  val_abascal: int("val_abascal"),
  val_alvise: int("val_alvise"),
  val_yolanda_diaz: int("val_yolanda_diaz"),
  val_irene_montero: int("val_irene_montero"),
  val_ayuso: int("val_ayuso"),
  val_buxade: int("val_buxade"),
  voto_asociacion_juvenil: varchar("voto_asociacion_juvenil", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Respuesta = typeof respuestas.$inferSelect;
export type InsertRespuesta = typeof respuestas.$inferInsert;

// Tabla de encuestas varias
export const encuestasVarias = mysqlTable("encuestas_varias", {
  id: int("id").autoincrement().primaryKey(),
  questionNumber: int("question_number").notNull(),
  questionText: text("question_text").notNull(),
  optionO1: varchar("option_o1", { length: 255 }).notNull(),
  optionO2: varchar("option_o2", { length: 255 }).notNull(),
  optionOO: varchar("option_oo", { length: 255 }).notNull(),
  votesO1: int("votes_o1").default(0).notNull(),
  votesO2: int("votes_o2").default(0).notNull(),
  votesOO: int("votes_oo").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EncuestaVaria = typeof encuestasVarias.$inferSelect;
export type InsertEncuestaVaria = typeof encuestasVarias.$inferInsert;

// Tabla de respuestas de encuestas varias
export const respuestasEncuestasVarias = mysqlTable("respuestas_encuestas_varias", {
  id: int("id").autoincrement().primaryKey(),
  encuestaId: int("encuesta_id").notNull(),
  questionNumber: int("question_number").notNull(),
  selectedOption: varchar("selected_option", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RespuestaEncuestaVaria = typeof respuestasEncuestasVarias.$inferSelect;
export type InsertRespuestaEncuestaVaria = typeof respuestasEncuestasVarias.$inferInsert;
