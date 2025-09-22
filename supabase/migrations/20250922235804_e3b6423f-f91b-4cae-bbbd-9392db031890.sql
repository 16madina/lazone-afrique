-- Create RPC function to save push tokens (workaround for TypeScript types)
CREATE OR REPLACE FUNCTION public.save_push_token(
  p_user_id UUID,
  p_token TEXT,
  p_platform TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_push_tokens (user_id, token, platform)
  VALUES (p_user_id, p_token, p_platform)
  ON CONFLICT (user_id, platform) 
  DO UPDATE SET 
    token = EXCLUDED.token,
    updated_at = now();
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;