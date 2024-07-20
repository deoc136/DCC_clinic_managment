CREATE TABLE IF NOT EXISTS "catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"description" varchar(100) NOT NULL,
	"code" varchar(100) NOT NULL,
	"enabled" boolean NOT NULL,
	"parent_catalog_id" integer,
	"catalog_type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalogType" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(100) NOT NULL,
	"code" varchar(100) NOT NULL,
	"enabled" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinic_identification" (
	"id" serial PRIMARY KEY NOT NULL,
	"clinic_id" integer NOT NULL,
	"identification_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinic" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"web_page" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"slug" varchar(70) NOT NULL,
	"country" integer NOT NULL,
	"currency_id" integer,
	"identification_id" integer NOT NULL,
	"profile_picture_url" text NOT NULL,
	"identification" text NOT NULL,
	"administrator_id" text,
	"hide_for_therapist" boolean DEFAULT false,
	"hide_for_receptionist" boolean DEFAULT false,
	"hide_for_patients" boolean DEFAULT false,
	"removed" boolean DEFAULT false,
	"clinic_policies" integer,
	"terms_and_conditions" integer,
	"service_policies" integer,
	"cancelation_hours" integer DEFAULT 0 NOT NULL,
	"paypal_id" text NOT NULL,
	"paypal_secret_key" text NOT NULL,
	CONSTRAINT "clinic_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "currency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"file_name" text NOT NULL,
	"public_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "software_owner" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"phone" text NOT NULL,
	"address" varchar(70) NOT NULL,
	"email" varchar(50) NOT NULL,
	"enabled" boolean NOT NULL,
	"cognito_id" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog" ADD CONSTRAINT "catalog_catalog_type_id_catalogType_id_fk" FOREIGN KEY ("catalog_type_id") REFERENCES "catalogType"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_identification" ADD CONSTRAINT "clinic_identification_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_identification" ADD CONSTRAINT "clinic_identification_identification_id_catalog_id_fk" FOREIGN KEY ("identification_id") REFERENCES "catalog"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic" ADD CONSTRAINT "clinic_country_catalog_id_fk" FOREIGN KEY ("country") REFERENCES "catalog"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic" ADD CONSTRAINT "clinic_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic" ADD CONSTRAINT "clinic_identification_id_catalog_id_fk" FOREIGN KEY ("identification_id") REFERENCES "catalog"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic" ADD CONSTRAINT "clinic_clinic_policies_file_id_fk" FOREIGN KEY ("clinic_policies") REFERENCES "file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic" ADD CONSTRAINT "clinic_terms_and_conditions_file_id_fk" FOREIGN KEY ("terms_and_conditions") REFERENCES "file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic" ADD CONSTRAINT "clinic_service_policies_file_id_fk" FOREIGN KEY ("service_policies") REFERENCES "file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
