import { int, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Tabla bcapi_keys: Almacena las claves API para terceros
 * Cada clave es única y asociada a un website/proyecto
 */
export const bcapiKeys = mysqlTable("bcapi_keys", {
  id: int("id").autoincrement().primaryKey(),
  
  // Clave API única (formato: bcapi_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
  apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
  
  // Información del website/proyecto
  websiteName: varchar("website_name", { length: 255 }).notNull(),
  websiteUrl: varchar("website_url", { length: 255 }),
  
  // Contacto
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  
  // Configuración
  rateLimit: int("rate_limit").default(1000).notNull(), // requests por día
  isActive: boolean("is_active").default(true).notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  revokeReason: text("revoke_reason"),
  
  // Estadísticas
  totalRequests: int("total_requests").default(0).notNull(),
  successfulRequests: int("successful_requests").default(0).notNull(),
  failedRequests: int("failed_requests").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
  
  // Notas
  notes: text("notes"),
});

/**
 * Tabla bcapi_responses: Almacena las respuestas enviadas a través de BCApi
 * Se integran automáticamente en las estadísticas globales
 */
export const bcapiResponses = mysqlTable("bcapi_responses", {
  id: int("id").autoincrement().primaryKey(),
  
  // Referencia a la clave API
  apiKeyId: int("api_key_id").notNull(),
  
  // Pregunta y respuesta
  questionId: varchar("question_id", { length: 100 }).notNull(),
  responseValue: varchar("response_value", { length: 500 }).notNull(),
  
  // Información del usuario
  userIp: varchar("user_ip", { length: 45 }), // Soporta IPv4 e IPv6
  userAgent: text("user_agent"),
  
  // Metadata
  metadata: text("metadata"), // JSON stringificado
  source: varchar("source", { length: 100 }).default("bcapi").notNull(),
  campaign: varchar("campaign", { length: 255 }),
  
  // Estado
  isProcessed: boolean("is_processed").default(false).notNull(),
  isIntegratedToStats: boolean("is_integrated_to_stats").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  processedAt: timestamp("processed_at"),
  
  // Referencia a respuesta integrada (si aplica)
  integratedResponseId: int("integrated_response_id"),
});

/**
 * Tabla bcapi_usage_logs: Log detallado de uso de cada API key
 * Para auditoría y análisis de patrones
 */
export const bcapiUsageLogs = mysqlTable("bcapi_usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Referencia a la clave API
  apiKeyId: int("api_key_id").notNull(),
  
  // Información de la solicitud
  endpoint: varchar("endpoint", { length: 100 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: int("status_code"),
  
  // Detalles
  requestSize: int("request_size"), // bytes
  responseSize: int("response_size"), // bytes
  processingTimeMs: int("processing_time_ms"),
  
  // Información del cliente
  userIp: varchar("user_ip", { length: 45 }),
  userAgent: text("user_agent"),
  
  // Error (si aplica)
  errorMessage: text("error_message"),
  
  // Timestamp
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

/**
 * Tipos exportados para TypeScript
 */
export type BcapiKey = typeof bcapiKeys.$inferSelect;
export type InsertBcapiKey = typeof bcapiKeys.$inferInsert;

export type BcapiResponse = typeof bcapiResponses.$inferSelect;
export type InsertBcapiResponse = typeof bcapiResponses.$inferInsert;

export type BcapiUsageLog = typeof bcapiUsageLogs.$inferSelect;
export type InsertBcapiUsageLog = typeof bcapiUsageLogs.$inferInsert;
