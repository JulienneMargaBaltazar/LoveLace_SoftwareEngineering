-- 1. Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID,
    user_email TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Restrict DELETE/UPDATE access (Append-only security)
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated, anon;

-- 3. Drop existing function if present
DROP FUNCTION IF EXISTS public.audit_user() CASCADE;

-- 4. Create the audit_user function
CREATE OR REPLACE FUNCTION public.audit_user()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    current_user_id := NULLIF(auth.uid()::text, '')::UUID;
    current_user_email := NULLIF(auth.jwt() ->> 'email', '');

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_log (table_name, operation, user_id, user_email, old_data)
        VALUES (TG_TABLE_NAME, TG_OP, current_user_id, current_user_email, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_log (table_name, operation, user_id, user_email, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, current_user_id, current_user_email, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_log (table_name, operation, user_id, user_email, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, current_user_id, current_user_email, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;