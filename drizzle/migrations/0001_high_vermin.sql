CREATE TYPE "public"."roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"otp_number" varchar(6),
	"otp_number_expiry_date" timestamp,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refresh_token" text NOT NULL,
	"refresh_token_expiry" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid,
	CONSTRAINT "tokens_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "roles" "roles" DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "otp_number_idx" ON "otps" USING btree ("otp_number");--> statement-breakpoint
CREATE INDEX "refresh_token_idx" ON "tokens" USING btree ("refresh_token");