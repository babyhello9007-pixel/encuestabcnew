CREATE TABLE "asociaciones_juveniles" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"nombre_completo" text NOT NULL,
	"escanos" integer DEFAULT 0,
	"logo_path" text
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blog_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"author" varchar(255) DEFAULT 'Batalla Cultural',
	"featured_image" text,
	"published" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "encuestadoras" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "encuestadoras_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nombre" varchar(100) NOT NULL,
	"sigla" varchar(20),
	"pais" varchar(50) DEFAULT 'España',
	"sitio_web" text,
	"credibilidad" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "encuestadoras_nombre_unique" UNIQUE("nombre"),
	CONSTRAINT "encuestadoras_sigla_unique" UNIQUE("sigla")
);
--> statement-breakpoint
CREATE TABLE "encuestas_externas" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "encuestas_externas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"encuestadora_id" bigint NOT NULL,
	"tipo_encuesta" varchar(50) NOT NULL,
	"ambito" varchar(50) NOT NULL,
	"ccaa_o_provincia" varchar(100),
	"fecha_publicacion" timestamp with time zone NOT NULL,
	"fecha_encuesta_inicio" timestamp with time zone,
	"fecha_encuesta_fin" timestamp with time zone,
	"tamano_muestra" integer,
	"margen_error" integer,
	"metodologia" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "encuestas_varias" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "encuestas_varias_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question_number" integer NOT NULL,
	"question_text" text NOT NULL,
	"option_o1" varchar(255) NOT NULL,
	"option_o2" varchar(255) NOT NULL,
	"option_oo" varchar(255) NOT NULL,
	"votes_o1" integer DEFAULT 0 NOT NULL,
	"votes_o2" integer DEFAULT 0 NOT NULL,
	"votes_oo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer,
	"file_type" varchar(100),
	"s3_key" text NOT NULL,
	"s3_url" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partidos_generales" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"nombre_completo" text NOT NULL,
	"escanos" integer DEFAULT 0,
	"logo_path" text
);
--> statement-breakpoint
CREATE TABLE "respuestas_encuestas_varias" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "respuestas_encuestas_varias_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"encuesta_id" integer NOT NULL,
	"question_number" integer NOT NULL,
	"selected_option" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resultados_encuestas" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resultados_encuestas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"encuesta_id" bigint NOT NULL,
	"partido_id" varchar(100) NOT NULL,
	"votos" integer,
	"porcentaje" integer,
	"escanos" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_encuesta_partido" UNIQUE("encuesta_id","partido_id")
);
--> statement-breakpoint
CREATE TABLE "tendencias_agregadas" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tendencias_agregadas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"partido_id" varchar(100) NOT NULL,
	"tipo_encuesta" varchar(50) NOT NULL,
	"ambito" varchar(50) NOT NULL,
	"ccaa_o_provincia" varchar(100),
	"fecha" timestamp with time zone NOT NULL,
	"media_7_dias" integer,
	"media_14_dias" integer,
	"media_30_dias" integer,
	"tendencia" varchar(20),
	"cambio_7_dias" integer,
	"cambio_30_dias" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_tendencia" UNIQUE("partido_id","tipo_encuesta","ambito","ccaa_o_provincia","fecha")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "encuestas_externas" ADD CONSTRAINT "encuestas_externas_encuestadora_id_encuestadoras_id_fk" FOREIGN KEY ("encuestadora_id") REFERENCES "public"."encuestadoras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resultados_encuestas" ADD CONSTRAINT "resultados_encuestas_encuesta_id_encuestas_externas_id_fk" FOREIGN KEY ("encuesta_id") REFERENCES "public"."encuestas_externas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_resultados_partido" ON "resultados_encuestas" USING btree ("partido_id");--> statement-breakpoint
CREATE INDEX "idx_resultados_encuesta" ON "resultados_encuestas" USING btree ("encuesta_id");--> statement-breakpoint
CREATE INDEX "idx_tendencias_partido" ON "tendencias_agregadas" USING btree ("partido_id");--> statement-breakpoint
CREATE INDEX "idx_tendencias_fecha" ON "tendencias_agregadas" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "idx_tendencias_tipo" ON "tendencias_agregadas" USING btree ("tipo_encuesta");