DROP INDEX "idx_resultados_partido";--> statement-breakpoint
DROP INDEX "idx_resultados_encuesta";--> statement-breakpoint
DROP INDEX "idx_tendencias_partido";--> statement-breakpoint
DROP INDEX "idx_tendencias_fecha";--> statement-breakpoint
DROP INDEX "idx_tendencias_tipo";--> statement-breakpoint
ALTER TABLE "encuestadoras" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "encuestadoras" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "encuestadoras" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "encuestas_externas" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "encuestas_externas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "encuestas_externas" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "encuestas_externas" ALTER COLUMN "encuestadora_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "resultados_encuestas" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "resultados_encuestas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "resultados_encuestas" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "resultados_encuestas" ALTER COLUMN "encuesta_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tendencias_agregadas" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tendencias_agregadas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tendencias_agregadas" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "encuestadoras" ADD COLUMN "logo_url" text;--> statement-breakpoint
CREATE INDEX "idx_encuestas_externas_fecha" ON "encuestas_externas" USING btree ("fecha_publicacion");--> statement-breakpoint
CREATE INDEX "idx_encuestas_externas_tipo" ON "encuestas_externas" USING btree ("tipo_encuesta");--> statement-breakpoint
CREATE INDEX "idx_encuestas_externas_ambito" ON "encuestas_externas" USING btree ("ambito");--> statement-breakpoint
CREATE INDEX "idx_encuestas_externas_encuestadora" ON "encuestas_externas" USING btree ("encuestadora_id");--> statement-breakpoint
CREATE INDEX "idx_encuestas_externas_ccaa_provincia" ON "encuestas_externas" USING btree ("ccaa_o_provincia");--> statement-breakpoint
CREATE INDEX "idx_resultados_encuestas_partido" ON "resultados_encuestas" USING btree ("partido_id");--> statement-breakpoint
CREATE INDEX "idx_resultados_encuestas_encuesta" ON "resultados_encuestas" USING btree ("encuesta_id");--> statement-breakpoint
CREATE INDEX "idx_tendencias_agregadas_partido" ON "tendencias_agregadas" USING btree ("partido_id");--> statement-breakpoint
CREATE INDEX "idx_tendencias_agregadas_fecha" ON "tendencias_agregadas" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "idx_tendencias_agregadas_tipo" ON "tendencias_agregadas" USING btree ("tipo_encuesta");