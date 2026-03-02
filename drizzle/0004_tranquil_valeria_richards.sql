CREATE TABLE "party_changes_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "party_changes_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"party_key" varchar(100) NOT NULL,
	"change_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"changed_by" integer,
	"user_name" varchar(255),
	"change_details" text,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "party_comparison_snapshots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "party_comparison_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"snapshot_date" timestamp with time zone DEFAULT now() NOT NULL,
	"party_key" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"color" varchar(7) NOT NULL,
	"logo_url" text NOT NULL,
	"total_votes" integer,
	"average_rating" numeric(3, 2)
);
--> statement-breakpoint
CREATE TABLE "party_configuration" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "party_configuration_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"party_key" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"color" varchar(7) NOT NULL,
	"logo_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"party_type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	CONSTRAINT "party_configuration_party_key_unique" UNIQUE("party_key")
);
--> statement-breakpoint
CREATE TABLE "party_logo_history_v2" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "party_logo_history_v2_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"party_key" varchar(100) NOT NULL,
	"change_type" varchar(20) NOT NULL,
	"old_display_name" varchar(255),
	"new_display_name" varchar(255),
	"old_color" varchar(7),
	"new_color" varchar(7),
	"old_logo_url" text,
	"new_logo_url" text,
	"changed_by" integer,
	"changed_by_name" varchar(255),
	"change_reason" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"is_reverted" boolean DEFAULT false NOT NULL,
	"reverted_by" integer,
	"reverted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "party_statistics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "party_statistics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"party_key" varchar(100) NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"total_mentions" integer DEFAULT 0 NOT NULL,
	"general_elections_votes" integer DEFAULT 0 NOT NULL,
	"autonomous_elections_votes" integer DEFAULT 0 NOT NULL,
	"municipal_elections_votes" integer DEFAULT 0 NOT NULL,
	"european_elections_votes" integer DEFAULT 0 NOT NULL,
	"youth_association_votes" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "party_statistics_party_key_unique" UNIQUE("party_key")
);
--> statement-breakpoint
CREATE INDEX "idx_changes_log_party" ON "party_changes_log" USING btree ("party_key");--> statement-breakpoint
CREATE INDEX "idx_changes_log_timestamp" ON "party_changes_log" USING btree ("change_timestamp");--> statement-breakpoint
CREATE INDEX "idx_changes_log_user" ON "party_changes_log" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_snapshots_date" ON "party_comparison_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "idx_snapshots_party" ON "party_comparison_snapshots" USING btree ("party_key");--> statement-breakpoint
CREATE INDEX "idx_party_config_key" ON "party_configuration" USING btree ("party_key");--> statement-breakpoint
CREATE INDEX "idx_party_config_type" ON "party_configuration" USING btree ("party_type");--> statement-breakpoint
CREATE INDEX "idx_party_config_active" ON "party_configuration" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_party_config_updated" ON "party_configuration" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_party_history_v2_key" ON "party_logo_history_v2" USING btree ("party_key");--> statement-breakpoint
CREATE INDEX "idx_party_history_v2_timestamp" ON "party_logo_history_v2" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_party_history_v2_changed_by" ON "party_logo_history_v2" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "idx_party_history_v2_type" ON "party_logo_history_v2" USING btree ("change_type");--> statement-breakpoint
CREATE INDEX "idx_party_stats_key" ON "party_statistics" USING btree ("party_key");--> statement-breakpoint
CREATE INDEX "idx_party_stats_total_votes" ON "party_statistics" USING btree ("total_votes");--> statement-breakpoint
CREATE INDEX "idx_party_stats_last_updated" ON "party_statistics" USING btree ("last_updated");