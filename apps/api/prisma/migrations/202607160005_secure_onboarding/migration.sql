-- The runtime role cannot insert tenant roots directly. This narrowly scoped
-- security-definer function creates the initial clinic aggregate atomically.
CREATE OR REPLACE FUNCTION app_private.create_firebase_onboarding(
  p_user_id uuid,
  p_firebase_uid varchar(128),
  p_name varchar(160),
  p_email varchar(320),
  p_email_canonical varchar(320),
  p_clinic_id uuid,
  p_membership_id uuid,
  p_settings_id uuid,
  p_terms_id uuid,
  p_privacy_id uuid,
  p_audit_id uuid,
  p_clinic_name varchar(180),
  p_terms_version varchar(40),
  p_evidence_digest char(64),
  p_request_id varchar(80),
  p_ip_prefix varchar(64),
  p_user_agent_summary varchar(255),
  p_accepted_at timestamptz
)
RETURNS TABLE("userId" uuid, "clinicId" uuid, "created" boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, app_private
SET row_security = off
AS $$
DECLARE
  v_user_id uuid;
  v_clinic_id uuid;
  v_owner_role_id uuid;
BEGIN
  IF length(trim(p_firebase_uid)) < 1
    OR length(trim(p_name)) < 2
    OR length(trim(p_clinic_name)) < 2
    OR p_email_canonical <> lower(trim(p_email_canonical))
    OR p_evidence_digest !~ '^[a-f0-9]{64}$'
  THEN
    RAISE EXCEPTION 'invalid onboarding input' USING ERRCODE = '22023';
  END IF;

  SELECT users.id
  INTO v_user_id
  FROM public.users
  WHERE users.firebase_uid = p_firebase_uid
  FOR UPDATE;

  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = v_user_id
        AND users.email_canonical = p_email_canonical
        AND users.deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'firebase identity conflict' USING ERRCODE = '23505';
    END IF;

    SELECT memberships.clinic_id
    INTO v_clinic_id
    FROM public.clinic_memberships AS memberships
    WHERE memberships.user_id = v_user_id
      AND memberships.status = 'ACTIVE'
      AND memberships.deleted_at IS NULL
    ORDER BY memberships.created_at ASC
    LIMIT 1;

    IF v_clinic_id IS NOT NULL THEN
      RETURN QUERY SELECT v_user_id, v_clinic_id, false;
      RETURN;
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.users
      WHERE users.email_canonical = p_email_canonical
    ) THEN
      RAISE EXCEPTION 'email identity conflict' USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.users (
      id,
      name,
      email,
      email_canonical,
      firebase_uid,
      password_hash,
      password_hash_version,
      status,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      trim(p_name),
      trim(p_email),
      p_email_canonical,
      p_firebase_uid,
      '!firebase-managed!',
      0,
      'PENDING_VERIFICATION',
      p_accepted_at,
      p_accepted_at
    );
    v_user_id := p_user_id;
  END IF;

  SELECT roles.id
  INTO v_owner_role_id
  FROM public.roles
  WHERE roles.code = 'OWNER';

  IF v_owner_role_id IS NULL THEN
    RAISE EXCEPTION 'OWNER role is not provisioned' USING ERRCODE = '55000';
  END IF;

  INSERT INTO public.clinics (
    id, legal_name, trade_name, created_at, updated_at
  ) VALUES (
    p_clinic_id, trim(p_clinic_name), trim(p_clinic_name), p_accepted_at, p_accepted_at
  );
  v_clinic_id := p_clinic_id;

  INSERT INTO public.clinic_settings (
    id, clinic_id, created_at, updated_at, created_by, updated_by
  ) VALUES (
    p_settings_id, v_clinic_id, p_accepted_at, p_accepted_at, v_user_id, v_user_id
  );

  INSERT INTO public.clinic_memberships (
    id,
    clinic_id,
    user_id,
    role_id,
    status,
    accepted_at,
    created_at,
    updated_at
  ) VALUES (
    p_membership_id,
    v_clinic_id,
    v_user_id,
    v_owner_role_id,
    'ACTIVE',
    p_accepted_at,
    p_accepted_at,
    p_accepted_at
  );

  INSERT INTO public.terms_acceptances (
    id,
    clinic_id,
    user_id,
    document_type,
    document_version,
    accepted_at,
    ip_prefix,
    user_agent_summary,
    evidence_digest,
    created_at,
    updated_at
  ) VALUES (
    p_terms_id,
    v_clinic_id,
    v_user_id,
    'TERMS_OF_USE',
    p_terms_version,
    p_accepted_at,
    p_ip_prefix,
    p_user_agent_summary,
    p_evidence_digest,
    p_accepted_at,
    p_accepted_at
  );

  INSERT INTO public.audit_logs (
    id,
    clinic_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    outcome,
    request_id,
    ip_prefix,
    user_agent_summary,
    occurred_at,
    created_at,
    updated_at
  ) VALUES (
    p_audit_id,
    v_clinic_id,
    v_user_id,
    'CLINIC_ONBOARDING_CREATED',
    'Clinic',
    v_clinic_id,
    'SUCCESS',
    p_request_id,
    p_ip_prefix,
    p_user_agent_summary,
    p_accepted_at,
    p_accepted_at,
    p_accepted_at
  );

  INSERT INTO public.terms_acceptances (
    id,
    clinic_id,
    user_id,
    document_type,
    document_version,
    accepted_at,
    ip_prefix,
    user_agent_summary,
    evidence_digest,
    created_at,
    updated_at
  ) VALUES (
    p_privacy_id,
    v_clinic_id,
    v_user_id,
    'PRIVACY_POLICY',
    p_terms_version,
    p_accepted_at,
    p_ip_prefix,
    p_user_agent_summary,
    p_evidence_digest,
    p_accepted_at,
    p_accepted_at
  );

  RETURN QUERY SELECT v_user_id, v_clinic_id, true;
END;
$$;

REVOKE ALL ON FUNCTION app_private.create_firebase_onboarding(
  uuid, varchar, varchar, varchar, varchar, uuid, uuid, uuid, uuid, uuid, uuid,
  varchar, varchar, char, varchar, varchar, varchar, timestamptz
) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'odontogest_app') THEN
    GRANT EXECUTE ON FUNCTION app_private.create_firebase_onboarding(
      uuid, varchar, varchar, varchar, varchar, uuid, uuid, uuid, uuid, uuid, uuid,
      varchar, varchar, char, varchar, varchar, varchar, timestamptz
    ) TO odontogest_app;
  END IF;
END
$$;
