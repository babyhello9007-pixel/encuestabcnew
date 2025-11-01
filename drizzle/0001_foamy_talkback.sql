CREATE TABLE `asociaciones_juveniles` (
	`id` varchar(64) NOT NULL,
	`nombre_completo` text NOT NULL,
	`escanos` int DEFAULT 0,
	`logo_path` text,
	CONSTRAINT `asociaciones_juveniles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_size` int,
	`file_type` varchar(100),
	`s3_key` text NOT NULL,
	`s3_url` text,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partidos_generales` (
	`id` varchar(64) NOT NULL,
	`nombre_completo` text NOT NULL,
	`escanos` int DEFAULT 0,
	`logo_path` text,
	CONSTRAINT `partidos_generales_id` PRIMARY KEY(`id`)
);
