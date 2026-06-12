GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_nif(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_nif(text) TO service_role;

NOTIFY pgrst, 'reload schema';