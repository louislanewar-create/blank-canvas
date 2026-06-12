
-- Lookup email by NIF (used at login since users authenticate with NIF, not email)
CREATE OR REPLACE FUNCTION public.lookup_email_by_nif(_nif TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE nif = _nif LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_email_by_nif(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_nif(TEXT) TO anon, authenticated;

-- Whether the current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
