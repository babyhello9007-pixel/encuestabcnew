CREATE TABLE `encuestadoras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`sigla` varchar(20),
	`pais` varchar(50) DEFAULT 'España',
	`sitio_web` text,
	`credibilidad` int DEFAULT 50,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `encuestadoras_id` PRIMARY KEY(`id`),
	CONSTRAINT `encuestadoras_nombre_unique` UNIQUE(`nombre`),
	CONSTRAINT `encuestadoras_sigla_unique` UNIQUE(`sigla`)
);
--> statement-breakpoint
CREATE TABLE `encuestas_externas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`encuestadora_id` int NOT NULL,
	`tipo_encuesta` varchar(50) NOT NULL,
	`ambito` varchar(50) NOT NULL,
	`ccaa_o_provincia` varchar(100),
	`fecha_publicacion` timestamp NOT NULL,
	`fecha_encuesta_inicio` timestamp,
	`fecha_encuesta_fin` timestamp,
	`tamano_muestra` int,
	`margen_error` int,
	`metodologia` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `encuestas_externas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resultados_encuestas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`encuesta_id` int NOT NULL,
	`partido_id` varchar(100) NOT NULL,
	`votos` int,
	`porcentaje` int,
	`escanos` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resultados_encuestas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tendencias_agregadas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partido_id` varchar(100) NOT NULL,
	`tipo_encuesta` varchar(50) NOT NULL,
	`ambito` varchar(50),
	`ccaa_o_provincia` varchar(100),
	`fecha` timestamp NOT NULL,
	`media_7_dias` int,
	`media_14_dias` int,
	`media_30_dias` int,
	`tendencia` varchar(20),
	`cambio_7_dias` int,
	`cambio_30_dias` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tendencias_agregadas_id` PRIMARY KEY(`id`)
);
