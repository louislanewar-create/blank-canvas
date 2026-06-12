REVOKE ALL ON FUNCTION public.lookup_email_by_nif(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_email_by_nif(text) FROM anon;
REVOKE ALL ON FUNCTION public.lookup_email_by_nif(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_nif(text) TO service_role;

NOTIFY pgrst, 'reload schema';