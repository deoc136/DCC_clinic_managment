CREATE TABLE IF NOT EXISTS "appointment" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"state" text NOT NULL,
	"date" text NOT NULL,
	"hour" integer NOT NULL,
	"creation_date" text NOT NULL,
	"price" numeric NOT NULL,
	"headquarter_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"from_package" boolean DEFAULT false,
	"payment_method" text,
	"hidden" boolean DEFAULT false,
	"assistance" text,
	"order_id" text,
	"invoice_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clinic_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"date" text NOT NULL,
	"hour" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"therapist_id" integer NOT NULL,
	"appointment_id" integer NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"file_name" text NOT NULL,
	"public_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "headquarter" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" integer NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"index" integer NOT NULL,
	"removed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "package" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric NOT NULL,
	"description" text NOT NULL,
	"service_id" integer NOT NULL,
	"quantity" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating" (
	"id" serial PRIMARY KEY NOT NULL,
	"quality" integer NOT NULL,
	"kindness" integer NOT NULL,
	"punctuality" integer NOT NULL,
	"knowledge" integer NOT NULL,
	"appointment_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"therapist_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule_day" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"day" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule_hour" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"start_hour" numeric NOT NULL,
	"end_hour" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric NOT NULL,
	"service_duration" numeric NOT NULL,
	"pause_duration" numeric,
	"has_pause" boolean NOT NULL,
	"description" text NOT NULL,
	"active" boolean NOT NULL,
	"removed" boolean DEFAULT false,
	"picture_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submitted_form" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"file_name" text NOT NULL,
	"form_id" integer NOT NULL,
	"patient_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(70) NOT NULL,
	"last_names" varchar(70) NOT NULL,
	"phone" text NOT NULL,
	"address" varchar(200) NOT NULL,
	"email" varchar(50) NOT NULL,
	"enabled" boolean NOT NULL,
	"profile_picture" text NOT NULL,
	"cognito_id" varchar NOT NULL,
	"role_id" text NOT NULL,
	"identification" text,
	"identification_type" integer,
	"headquarter_id" integer,
	"retired" boolean DEFAULT false,
	"birth_date" text,
	"genre" text,
	"residence_country" integer,
	"residence_city" integer,
	"nationality" integer,
	"date_created" text NOT NULL,
	CONSTRAINT "user_cognito_id_unique" UNIQUE("cognito_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_service" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment" ADD CONSTRAINT "appointment_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment" ADD CONSTRAINT "appointment_headquarter_id_headquarter_id_fk" FOREIGN KEY ("headquarter_id") REFERENCES "headquarter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment" ADD CONSTRAINT "appointment_therapist_id_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_history" ADD CONSTRAINT "clinic_history_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_history" ADD CONSTRAINT "clinic_history_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_history" ADD CONSTRAINT "clinic_history_therapist_id_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clinic_history" ADD CONSTRAINT "clinic_history_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "package" ADD CONSTRAINT "package_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating" ADD CONSTRAINT "rating_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating" ADD CONSTRAINT "rating_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating" ADD CONSTRAINT "rating_therapist_id_user_id_fk" FOREIGN KEY ("therapist_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule_day" ADD CONSTRAINT "schedule_day_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule_hour" ADD CONSTRAINT "schedule_hour_schedule_id_schedule_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedule" ADD CONSTRAINT "schedule_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submitted_form" ADD CONSTRAINT "submitted_form_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submitted_form" ADD CONSTRAINT "submitted_form_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_headquarter_id_headquarter_id_fk" FOREIGN KEY ("headquarter_id") REFERENCES "headquarter"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_service" ADD CONSTRAINT "user_service_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_service" ADD CONSTRAINT "user_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
