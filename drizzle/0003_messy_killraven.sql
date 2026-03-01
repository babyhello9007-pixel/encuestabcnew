CREATE TABLE "party_logo_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "party_logo_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"party_key" varchar(100) NOT NULL,
	"old_logo_url" text,
	"new_logo_url" text NOT NULL,
	"changed_by" integer,
	"change_type" varchar(20) NOT NULL,
	"change_reason" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_party_logo_history_party" ON "party_logo_history" USING btree ("party_key");--> statement-breakpoint
CREATE INDEX "idx_party_logo_history_timestamp" ON "party_logo_history" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_party_logo_history_changed_by" ON "party_logo_history" USING btree ("changed_by");