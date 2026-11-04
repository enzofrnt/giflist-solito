-- Harden the public schema against Supabase's Data API roles.
--
-- Supabase grants `anon` and `authenticated` full DML on tables created in
-- `public` through `ALTER DEFAULT PRIVILEGES FOR ROLE postgres`. That is why
-- "Gift", "GiftList", "FavoriteList" and "_prisma_migrations" were reported
-- by the security advisors even though earlier migrations hardened other
-- tables: the hardening was per-table and applied by hand, so every new table
-- (FavoriteList included) was exposed again on creation.
--
-- This migration is therefore generic on purpose:
--   * every table currently in `public` gets RLS + its Data API grants removed;
--   * sequences and functions are revoked too ("REVOKE ALL ON TABLE" is not
--     "everything" -- SERIAL/IDENTITY sequences were never covered);
--   * default privileges are revoked so future Prisma tables are not exposed.
--
-- Why the application keeps working: Prisma connects as the project owner
-- (`postgres`). A table owner bypasses RLS unless FORCE is set, and the owner
-- is not named in any REVOKE below. So this is a no-op for the app and a hard
-- block for the Data API. FORCE ROW LEVEL SECURITY is deliberately NOT used:
-- it would also constrain the owner and break `prisma migrate deploy`
-- (it would see no recorded migrations and try to re-apply them).
--
-- No policy is created on purpose: default-deny is the intended state for
-- roles that must not reach these tables at all. Supabase will still show an
-- informational "RLS enabled, no policy" advisor -- that is expected and
-- correct here, not a regression.
--
-- Portability: local Docker has no `anon`/`authenticated`/`postgres` roles and
-- the pglite test fixture has no `_prisma_migrations`, so everything is guarded
-- and every table is handled dynamically. Idempotent by construction.

DO $$
DECLARE
  tbl record;
  creator text;
BEGIN
  -- Non-Supabase databases (local Docker, plain Postgres, CI) have nothing to
  -- harden: there is no Data API role to revoke from.
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    RAISE NOTICE 'Supabase Data API roles absent; skipping public schema hardening.';
    RETURN;
  END IF;

  -- 1. Every existing table in public: RLS on, Data API grants removed.
  --    Each table is isolated so an object we do not own cannot fail the whole
  --    deploy; the security test asserts that nothing was skipped.
  FOR tbl IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY c.relname
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl.relname);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', tbl.relname);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', tbl.relname);
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated', tbl.relname);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'Could not harden table public.% (%); it must be hardened manually.',
        tbl.relname, SQLERRM;
    END;
  END LOOP;

  -- 2. Sequences and functions: never covered by the previous per-table revokes.
  BEGIN
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE WARNING 'Could not revoke sequence privileges in public (%); review manually.', SQLERRM;
  END;

  BEGIN
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE WARNING 'Could not revoke function privileges in public (%); review manually.', SQLERRM;
  END;

  -- 3. Durability: objects created later must not inherit the Data API grants.
  --    Default privileges are per creating role, so cover `postgres` (Supabase)
  --    and the role actually running migrations (local Docker / CI).
  FOR creator IN
    SELECT r.rolname
    FROM pg_roles r
    WHERE r.rolname = current_user
       OR (
         r.rolname = 'postgres'
         AND pg_has_role(current_user, 'postgres', 'MEMBER')
       )
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated',
        creator);
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated',
        creator);
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated',
        creator);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'Could not revoke default privileges for role % (%).', creator, SQLERRM;
    END;
  END LOOP;
END $$;
