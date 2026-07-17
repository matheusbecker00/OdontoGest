-- Bind every tenant context to an active membership as defense in depth. The
-- function is SECURITY DEFINER so membership RLS cannot recurse into itself.
CREATE OR REPLACE FUNCTION app_private.is_active_member(target_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinic_memberships membership
    WHERE membership.clinic_id = target_clinic_id
      AND membership.user_id = app_private.current_user_id()
      AND membership.status = 'ACTIVE'
      AND membership.deleted_at IS NULL
  )
$$;

REVOKE ALL ON FUNCTION app_private.is_active_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.is_active_member(uuid) TO PUBLIC;

DROP POLICY "clinics_update_in_context" ON "clinics";
CREATE POLICY "clinics_update_in_context" ON "clinics"
FOR UPDATE USING (
  "id" = app_private.current_clinic_id()
  AND app_private.is_active_member("id")
)
WITH CHECK (
  "id" = app_private.current_clinic_id()
  AND app_private.is_active_member("id")
);

DROP POLICY "memberships_select_scoped" ON "clinic_memberships";
CREATE POLICY "memberships_select_scoped" ON "clinic_memberships"
FOR SELECT USING (
  "user_id" = app_private.current_user_id()
  OR (
    "clinic_id" = app_private.current_clinic_id()
    AND app_private.is_active_member("clinic_id")
  )
);

DROP POLICY "memberships_insert_scoped" ON "clinic_memberships";
CREATE POLICY "memberships_insert_scoped" ON "clinic_memberships"
FOR INSERT WITH CHECK (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DROP POLICY "memberships_update_scoped" ON "clinic_memberships";
CREATE POLICY "memberships_update_scoped" ON "clinic_memberships"
FOR UPDATE USING (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
)
WITH CHECK (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DROP POLICY "clinic_settings_tenant_all" ON "clinic_settings";
CREATE POLICY "clinic_settings_tenant_all" ON "clinic_settings"
FOR ALL USING (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
)
WITH CHECK (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DROP POLICY "terms_acceptances_select" ON "terms_acceptances";
CREATE POLICY "terms_acceptances_select" ON "terms_acceptances"
FOR SELECT USING (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DROP POLICY "terms_acceptances_insert" ON "terms_acceptances";
CREATE POLICY "terms_acceptances_insert" ON "terms_acceptances"
FOR INSERT WITH CHECK (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DROP POLICY "audit_logs_select" ON "audit_logs";
CREATE POLICY "audit_logs_select" ON "audit_logs"
FOR SELECT USING (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);

DROP POLICY "audit_logs_insert" ON "audit_logs";
CREATE POLICY "audit_logs_insert" ON "audit_logs"
FOR INSERT WITH CHECK (
  "clinic_id" = app_private.current_clinic_id()
  AND app_private.is_active_member("clinic_id")
);
