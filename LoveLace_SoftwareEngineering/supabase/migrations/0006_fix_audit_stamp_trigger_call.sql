CREATE OR REPLACE FUNCTION public.audit_stamp(p_action TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $function$
    SELECT p_action || ' ' ||
           COALESCE(NULLIF(auth.jwt() ->> 'email', ''), current_user) || ' ' ||
           to_char(now() AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD HH12:MI AM');
$function$;
