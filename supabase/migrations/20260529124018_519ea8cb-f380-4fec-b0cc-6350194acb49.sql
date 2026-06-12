REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO service_role;

NOTIFY pgrst, 'reload schema';