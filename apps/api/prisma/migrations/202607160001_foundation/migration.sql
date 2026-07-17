-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'DISABLED');

-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('ACTIVE', 'READ_ONLY', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('OWNER', 'ADMIN', 'DENTIST', 'RECEPTIONIST', 'FINANCE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'DENIED', 'FAILURE');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "email_canonical" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "password_hash_version" INTEGER NOT NULL DEFAULT 1,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "email_verified_at" TIMESTAMPTZ(3),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),
    "session_version" INTEGER NOT NULL DEFAULT 1,
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" UUID NOT NULL,
    "legal_name" VARCHAR(180) NOT NULL,
    "trade_name" VARCHAR(180) NOT NULL,
    "status" "ClinicStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo',
    "locale" VARCHAR(16) NOT NULL DEFAULT 'pt-BR',
    "currency" CHAR(3) NOT NULL DEFAULT 'BRL',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "default_appointment_minutes" INTEGER NOT NULL DEFAULT 30,
    "grace_period_days" INTEGER NOT NULL DEFAULT 7,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" "RoleCode" NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(240) NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" VARCHAR(240) NOT NULL,
    "risk_level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "clinic_memberships" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "authorization_version" INTEGER NOT NULL DEFAULT 1,
    "invited_by" UUID,
    "invited_at" TIMESTAMPTZ(3),
    "accepted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "clinic_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "active_clinic_id" UUID,
    "family_id" UUID NOT NULL,
    "parent_session_id" UUID,
    "replaced_by_session_id" UUID,
    "token_hash" CHAR(64) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "issued_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ(3),
    "idle_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "absolute_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "revoke_reason" VARCHAR(120),
    "ip_prefix" VARCHAR(64),
    "user_agent_summary" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_acceptances" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_type" VARCHAR(40) NOT NULL,
    "document_version" VARCHAR(40) NOT NULL,
    "accepted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_prefix" VARCHAR(64),
    "user_agent_summary" VARCHAR(255),
    "evidence_digest" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "terms_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "clinic_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" UUID,
    "outcome" "AuditOutcome" NOT NULL,
    "request_id" VARCHAR(80) NOT NULL,
    "ip_prefix" VARCHAR(64),
    "user_agent_summary" VARCHAR(255),
    "before_redacted" JSONB,
    "after_redacted" JSONB,
    "metadata_redacted" JSONB,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "outcome" "AuditOutcome" NOT NULL,
    "request_id" VARCHAR(80) NOT NULL,
    "ip_prefix" VARCHAR(64),
    "user_agent_summary" VARCHAR(255),
    "metadata_redacted" JSONB,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL,
    "clinic_id" UUID,
    "aggregate_type" VARCHAR(80) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload_minimized" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ(3),
    "last_error_code" VARCHAR(80),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_canonical_key" ON "users"("email_canonical");

-- CreateIndex
CREATE INDEX "clinic_status_created_idx" ON "clinics"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_settings_clinic_key" ON "clinic_settings"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "membership_user_status_clinic_idx" ON "clinic_memberships"("user_id", "status", "clinic_id");

-- CreateIndex
CREATE INDEX "membership_clinic_status_role_idx" ON "clinic_memberships"("clinic_id", "status", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_clinic_user_key" ON "clinic_memberships"("clinic_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_session_token_hash_key" ON "refresh_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_session_user_status_exp_idx" ON "refresh_sessions"("user_id", "status", "absolute_expires_at");

-- CreateIndex
CREATE INDEX "refresh_session_family_status_idx" ON "refresh_sessions"("family_id", "status", "issued_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "email_verification_user_exp_idx" ON "email_verification_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_user_exp_idx" ON "password_reset_tokens"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "terms_acceptance_clinic_date_idx" ON "terms_acceptances"("clinic_id", "accepted_at");

-- CreateIndex
CREATE UNIQUE INDEX "terms_acceptance_version_key" ON "terms_acceptances"("clinic_id", "user_id", "document_type", "document_version");

-- CreateIndex
CREATE INDEX "audit_clinic_date_idx" ON "audit_logs"("clinic_id", "occurred_at", "id");

-- CreateIndex
CREATE INDEX "audit_clinic_actor_date_idx" ON "audit_logs"("clinic_id", "actor_user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_clinic_entity_idx" ON "audit_logs"("clinic_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "security_event_date_action_idx" ON "security_events"("occurred_at", "action");

-- CreateIndex
CREATE INDEX "security_event_user_date_idx" ON "security_events"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "outbox_status_attempt_idx" ON "outbox_events"("status", "next_attempt_at", "occurred_at");

-- CreateIndex
CREATE INDEX "outbox_clinic_date_idx" ON "outbox_events"("clinic_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "clinic_settings" ADD CONSTRAINT "clinic_settings_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_memberships" ADD CONSTRAINT "clinic_memberships_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_active_clinic_id_fkey" FOREIGN KEY ("active_clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Security context helpers. SET LOCAL is applied by PrismaService for every
-- tenant-aware transaction so pooled connections cannot retain tenant context.
CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app_private.current_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT NULLIF(current_setting('app.current_clinic_id', true), '')::uuid
$$;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.current_clinic_id() TO PUBLIC;

-- Tenant root: users can discover only clinics for which they have an active
-- membership. Updates additionally require an established tenant context.
ALTER TABLE "clinics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clinics" FORCE ROW LEVEL SECURITY;

CREATE POLICY "clinics_select_by_membership" ON "clinics"
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM "clinic_memberships" membership
    WHERE membership."clinic_id" = "clinics"."id"
      AND membership."user_id" = app_private.current_user_id()
      AND membership."status" = 'ACTIVE'
      AND membership."deleted_at" IS NULL
  )
);

CREATE POLICY "clinics_update_in_context" ON "clinics"
FOR UPDATE USING ("id" = app_private.current_clinic_id())
WITH CHECK ("id" = app_private.current_clinic_id());

-- Membership reads are available to the member or to a validated active clinic.
-- Writes are possible only inside the validated clinic context.
ALTER TABLE "clinic_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clinic_memberships" FORCE ROW LEVEL SECURITY;

CREATE POLICY "memberships_select_scoped" ON "clinic_memberships"
FOR SELECT USING (
  "clinic_id" = app_private.current_clinic_id()
  OR "user_id" = app_private.current_user_id()
);

CREATE POLICY "memberships_insert_scoped" ON "clinic_memberships"
FOR INSERT WITH CHECK ("clinic_id" = app_private.current_clinic_id());

CREATE POLICY "memberships_update_scoped" ON "clinic_memberships"
FOR UPDATE USING ("clinic_id" = app_private.current_clinic_id())
WITH CHECK ("clinic_id" = app_private.current_clinic_id());

-- Standard tenant-owned mutable tables.
ALTER TABLE "clinic_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clinic_settings" FORCE ROW LEVEL SECURITY;

CREATE POLICY "clinic_settings_tenant_all" ON "clinic_settings"
FOR ALL USING ("clinic_id" = app_private.current_clinic_id())
WITH CHECK ("clinic_id" = app_private.current_clinic_id());

-- Terms and audit are append-only at the database policy layer.
ALTER TABLE "terms_acceptances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "terms_acceptances" FORCE ROW LEVEL SECURITY;

CREATE POLICY "terms_acceptances_select" ON "terms_acceptances"
FOR SELECT USING ("clinic_id" = app_private.current_clinic_id());

CREATE POLICY "terms_acceptances_insert" ON "terms_acceptances"
FOR INSERT WITH CHECK ("clinic_id" = app_private.current_clinic_id());

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select" ON "audit_logs"
FOR SELECT USING ("clinic_id" = app_private.current_clinic_id());

CREATE POLICY "audit_logs_insert" ON "audit_logs"
FOR INSERT WITH CHECK ("clinic_id" = app_private.current_clinic_id());

COMMENT ON TABLE "outbox_events" IS
  'System queue table. Global events have clinic_id NULL; tenant payloads must be minimized and scoped by workers.';
