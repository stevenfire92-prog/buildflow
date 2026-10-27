-- Defensive database hardening for independent BuildFlow storage.
-- These tables MUST only be queried through a backend that verifies a session
-- and scopes all data to the authenticated owner. No public SQL access.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
-- Application DB role must not be owner/superuser/BYPASSRLS.
-- Example policy requires transaction-local user id set *after* session validation:
CREATE POLICY projects_owner_only ON projects
  FOR ALL TO PUBLIC
  USING (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (owner_id = NULLIF(current_setting('app.user_id', true), '')::uuid);
-- Ensure the application DB role cannot bypass RLS.
