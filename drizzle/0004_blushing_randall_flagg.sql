CREATE TABLE `encuestas_varias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_number` int NOT NULL,
	`question_text` text NOT NULL,
	`option_o1` varchar(255) NOT NULL,
	`option_o2` varchar(255) NOT NULL,
	`option_oo` varchar(255) NOT NULL,
	`votes_o1` int NOT NULL DEFAULT 0,
	`votes_o2` int NOT NULL DEFAULT 0,
	`votes_oo` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `encuestas_varias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respuestas_encuestas_varias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`encuesta_id` int NOT NULL,
	`question_number` int NOT NULL,
	`selected_option` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respuestas_encuestas_varias_id` PRIMARY KEY(`id`)
);
