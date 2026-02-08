CREATE TABLE "voting_cooldown" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "voting_cooldown_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ip_address" varchar(45) NOT NULL,
	"last_vote_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voting_cooldown_ip_address_unique" UNIQUE("ip_address")
);
--> statement-breakpoint
CREATE INDEX "idx_voting_cooldown_ip" ON "voting_cooldown" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_voting_cooldown_last_vote" ON "voting_cooldown" USING btree ("last_vote_time");