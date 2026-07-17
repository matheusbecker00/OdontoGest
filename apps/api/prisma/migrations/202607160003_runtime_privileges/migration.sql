-- Keep the runtime role unable to hard-delete data, mutate the authorization
-- catalog, or rewrite append-only evidence. The role may not exist in every
-- migration environment, so grants are also mirrored by the provisioning script.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'odontogest_app') THEN
    REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM odontogest_app;
    REVOKE INSERT, UPDATE, DELETE ON TABLE
      public.roles,
      public.permissions,
      public.role_permissions
    FROM odontogest_app;
    REVOKE UPDATE, DELETE ON TABLE
      public.audit_logs,
      public.security_events,
      public.terms_acceptances
    FROM odontogest_app;

    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      REVOKE DELETE ON TABLES FROM odontogest_app;
  END IF;
END
$$;
