#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER ausente}"
: "${POSTGRES_DB:?POSTGRES_DB ausente}"
: "${ODONTOGEST_DB_APP_PASSWORD:?ODONTOGEST_DB_APP_PASSWORD ausente}"

psql \
  --set=ON_ERROR_STOP=1 \
  --set=owner_name="$POSTGRES_USER" \
  --set=database_name="$POSTGRES_DB" \
  --set=app_password="$ODONTOGEST_DB_APP_PASSWORD" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<'SQL'
SELECT format(
  'CREATE ROLE odontogest_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS',
  :'app_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'odontogest_app')
\gexec

SELECT format('ALTER ROLE odontogest_app PASSWORD %L', :'app_password')
\gexec

GRANT CONNECT ON DATABASE :"database_name" TO odontogest_app;
GRANT USAGE ON SCHEMA public TO odontogest_app;

SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO odontogest_app',
  :'owner_name'
)
\gexec

SELECT format(
  'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO odontogest_app',
  :'owner_name'
)
\gexec
SQL
