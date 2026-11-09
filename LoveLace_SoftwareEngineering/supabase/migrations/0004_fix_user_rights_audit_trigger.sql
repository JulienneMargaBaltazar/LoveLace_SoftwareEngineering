DROP TRIGGER IF EXISTS user_rights_audit_trigger ON public.user_rights;
DROP FUNCTION IF EXISTS public.trg_audit_log() CASCADE;
