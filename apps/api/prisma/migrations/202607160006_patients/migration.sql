CREATE TYPE "PatientRegistrationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "patients" (
  "id" uuid NOT NULL,
  "clinic_id" uuid NOT NULL,
  "full_name" varchar(180) NOT NULL,
  "cpf" char(11) NOT NULL,
  "birth_date" date,
  "phone" varchar(20),
  "whatsapp" varchar(20),
  "email" varchar(320),
  "address_line" varchar(500),
  "administrative_notes" varchar(1000),
  "registration_status" "PatientRegistrationStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(3) NOT NULL,
  "created_by" uuid NOT NULL,
  "updated_by" uuid NOT NULL,
  "deleted_at" timestamptz(3),
  CONSTRAINT "patients_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "patients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "patients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "patient_clinic_cpf_key" ON "patients"("clinic_id", "cpf");
CREATE INDEX "patient_clinic_status_name_idx" ON "patients"("clinic_id", "registration_status", "full_name", "id");
CREATE INDEX "patient_clinic_created_idx" ON "patients"("clinic_id", "created_at", "id");

ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patients" FORCE ROW LEVEL SECURITY;

CREATE POLICY "patients_tenant_all" ON "patients"
FOR ALL USING (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
)
WITH CHECK (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'odontogest_app') THEN
    GRANT SELECT, INSERT, UPDATE ON TABLE public.patients TO odontogest_app;
    REVOKE DELETE ON TABLE public.patients FROM odontogest_app;
  END IF;
END
$$;
