CREATE OR REPLACE FUNCTION public.audit_user(
  p_actor_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT,
  p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $function$
DECLARE
  v_actor_email TEXT;
BEGIN
  SELECT email
  INTO v_actor_email
  FROM app_user
  WHERE user_id = p_actor_user_id;

  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    user_email,
    new_data
  )
  VALUES (
    p_table_name,
    p_action,
    p_actor_user_id,
    v_actor_email,
    jsonb_build_object('record_id', p_record_id) || COALESCE(p_details, '{}'::JSONB)
  );
END;
$function$;
