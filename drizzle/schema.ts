import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  integer, 
  varchar,
  uniqueIndex,
  index,
  foreignKey,
  unique,
} from "drizzle-orm/pg-core";

/**
 * PostgreSQL Schema for Encuesta BC
 * Designed for Supabase PostgreSQL with UUID primary keys
 */

// ============================================================================
// 1. TABLA: ENCUESTADORAS (External Polling Organizations)
// ============================================================================
export const encuestadoras = pgTable("encuestadoras", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
  sigla: varchar("sigla", { length: 20 }).unique(),
  pais: varchar("pais", { length: 50 }).default("España"),
  sitioWeb: text("sitio_web"),
  logoUrl: text("logo_url"),
  credibilidad: integer("credibilidad"), // 0-100
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Encuestadora = typeof encuestadoras.$inferSelect;
export type InsertEncuestadora = typeof encuestadoras.$inferInsert;

// ============================================================================
// 2. TABLA: ENCUESTAS_EXTERNAS (External Surveys)
// ============================================================================
export const encuestasExternas = pgTable("encuestas_externas", {
  id: uuid("id").primaryKey().defaultRandom(),
  encuestadoraId: uuid("encuestadora_id").notNull().references(() => encuestadoras.id, { onDelete: "cascade" }),
  tipoEncuesta: varchar("tipo_encuesta", { length: 50 }).notNull(), // 'generales', 'autonomicas', 'municipales', 'europeas'
  ambito: varchar("ambito", { length: 50 }).notNull(), // 'nacional', 'ccaa', 'provincia'
  ccaaOProvincia: varchar("ccaa_o_provincia", { length: 100 }),
  fechaPublicacion: timestamp("fecha_publicacion", { withTimezone: true }).notNull(),
  fechaEncuestaInicio: timestamp("fecha_encuesta_inicio", { withTimezone: true }),
  fechaEncuestaFin: timestamp("fecha_encuesta_fin", { withTimezone: true }),
  tamanoMuestra: integer("tamano_muestra"),
  margenError: integer("margen_error"), // 0-100
  metodologia: text("metodologia"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxFecha: index("idx_encuestas_externas_fecha").on(table.fechaPublicacion),
  idxTipo: index("idx_encuestas_externas_tipo").on(table.tipoEncuesta),
  idxAmbito: index("idx_encuestas_externas_ambito").on(table.ambito),
  idxEncuestadora: index("idx_encuestas_externas_encuestadora").on(table.encuestadoraId),
  idxCcaa: index("idx_encuestas_externas_ccaa_provincia").on(table.ccaaOProvincia),
}));

export type EncuestaExterna = typeof encuestasExternas.$inferSelect;
export type InsertEncuestaExterna = typeof encuestasExternas.$inferInsert;

// ============================================================================
// 3. TABLA: RESULTADOS_ENCUESTAS (Survey Results)
// ============================================================================
export const resultadosEncuestas = pgTable("resultados_encuestas", {
  id: uuid("id").primaryKey().defaultRandom(),
  encuestaId: uuid("encuesta_id").notNull().references(() => encuestasExternas.id, { onDelete: "cascade" }),
  partidoId: varchar("partido_id", { length: 100 }).notNull(),
  votos: integer("votos"),
  porcentaje: integer("porcentaje"), // 0-100
  escanos: integer("escanos"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueEncuestaPartido: unique("unique_encuesta_partido").on(table.encuestaId, table.partidoId),
  idxPartido: index("idx_resultados_encuestas_partido").on(table.partidoId),
  idxEncuesta: index("idx_resultados_encuestas_encuesta").on(table.encuestaId),
}));

export type ResultadoEncuesta = typeof resultadosEncuestas.$inferSelect;
export type InsertResultadoEncuesta = typeof resultadosEncuestas.$inferInsert;

// ============================================================================
// 4. TABLA: TENDENCIAS_AGREGADAS (Aggregated Trends)
// ============================================================================
export const tendenciasAgregadas = pgTable("tendencias_agregadas", {
  id: uuid("id").primaryKey().defaultRandom(),
  partidoId: varchar("partido_id", { length: 100 }).notNull(),
  tipoEncuesta: varchar("tipo_encuesta", { length: 50 }).notNull(),
  ambito: varchar("ambito", { length: 50 }).notNull(),
  ccaaOProvincia: varchar("ccaa_o_provincia", { length: 100 }),
  fecha: timestamp("fecha", { withTimezone: true }).notNull(),
  media7Dias: integer("media_7_dias"), // 0-100
  media14Dias: integer("media_14_dias"),
  media30Dias: integer("media_30_dias"),
  tendencia: varchar("tendencia", { length: 20 }), // 'subida', 'bajada', 'estable'
  cambio7Dias: integer("cambio_7_dias"), // -100 to 100
  cambio30Dias: integer("cambio_30_dias"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueTendencia: unique("unique_tendencia").on(
    table.partidoId,
    table.tipoEncuesta,
    table.ambito,
    table.ccaaOProvincia,
    table.fecha
  ),
  idxPartido: index("idx_tendencias_agregadas_partido").on(table.partidoId),
  idxFecha: index("idx_tendencias_agregadas_fecha").on(table.fecha),
  idxTipo: index("idx_tendencias_agregadas_tipo").on(table.tipoEncuesta),
}));

export type TendenciaAgregada = typeof tendenciasAgregadas.$inferSelect;
export type InsertTendenciaAgregada = typeof tendenciasAgregadas.$inferInsert;

// ============================================================================
// LEGACY TABLES (Keep for backward compatibility)
// ============================================================================

// Core user table backing auth flow
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'user' | 'admin'
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabla de partidos generales
export const partidosGenerales = pgTable("partidos_generales", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  escanos: integer("escanos").default(0),
  logoPath: text("logo_path"),
});

export type PartidoGeneral = typeof partidosGenerales.$inferSelect;
export type InsertPartidoGeneral = typeof partidosGenerales.$inferInsert;

// Tabla de asociaciones juveniles
export const asociacionesJuveniles = pgTable("asociaciones_juveniles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nombreCompleto: text("nombre_completo").notNull(),
  escanos: integer("escanos").default(0),
  logoPath: text("logo_path"),
});

export type AsociacionJuvenil = typeof asociacionesJuveniles.$inferSelect;
export type InsertAsociacionJuvenil = typeof asociacionesJuveniles.$inferInsert;

// Tabla de archivos
export const files = pgTable("files", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type", { length: 100 }),
  s3Key: text("s3_key").notNull(),
  s3Url: text("s3_url"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

// Tabla de entradas del blog
export const blogPosts = pgTable("blog_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }).default("Batalla Cultural"),
  featuredImage: text("featured_image"),
  published: integer("published").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Tabla de encuestas varias
export const encuestasVarias = pgTable("encuestas_varias", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionNumber: integer("question_number").notNull(),
  questionText: text("question_text").notNull(),
  optionO1: varchar("option_o1", { length: 255 }).notNull(),
  optionO2: varchar("option_o2", { length: 255 }).notNull(),
  optionOO: varchar("option_oo", { length: 255 }).notNull(),
  votesO1: integer("votes_o1").default(0).notNull(),
  votesO2: integer("votes_o2").default(0).notNull(),
  votesOO: integer("votes_oo").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type EncuestaVaria = typeof encuestasVarias.$inferSelect;
export type InsertEncuestaVaria = typeof encuestasVarias.$inferInsert;

// Tabla de respuestas de encuestas varias
export const respuestasEncuestasVarias = pgTable("respuestas_encuestas_varias", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  encuestaId: integer("encuesta_id").notNull(),
  questionNumber: integer("question_number").notNull(),
  selectedOption: varchar("selected_option", { length: 10 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type RespuestaEncuestaVaria = typeof respuestasEncuestasVarias.$inferSelect;
export type InsertRespuestaEncuestaVaria = typeof respuestasEncuestasVarias.$inferInsert;

// Tabla de cooldown de votación por IP (30 minutos entre votos)
export const votingCooldown = pgTable("voting_cooldown", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull().unique(), // Soporta IPv4 e IPv6
  lastVoteTime: timestamp("last_vote_time", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  idxIpAddress: index("idx_voting_cooldown_ip").on(table.ipAddress),
  idxLastVoteTime: index("idx_voting_cooldown_last_vote").on(table.lastVoteTime),
}));

export type VotingCooldown = typeof votingCooldown.$inferSelect;
export type InsertVotingCooldown = typeof votingCooldown.$inferInsert;
