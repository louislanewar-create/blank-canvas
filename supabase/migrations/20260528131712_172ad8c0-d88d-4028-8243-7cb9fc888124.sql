
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;
GRANT ALL ON public.documentos TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enderecos TO authenticated;
GRANT ALL ON public.enderecos TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcoes_colaborador TO authenticated;
GRANT ALL ON public.funcoes_colaborador TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificacoes TO authenticated;
GRANT ALL ON public.certificacoes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dados_bancarios TO authenticated;
GRANT ALL ON public.dados_bancarios TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissoes TO authenticated;
GRANT ALL ON public.submissoes TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
