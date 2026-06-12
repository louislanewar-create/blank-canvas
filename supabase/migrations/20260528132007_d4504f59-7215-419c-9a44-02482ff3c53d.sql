
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.documentos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.enderecos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.funcoes_colaborador TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.certificacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dados_bancarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.submissoes TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.profiles, public.documentos, public.enderecos, public.funcoes_colaborador, public.certificacoes, public.dados_bancarios, public.submissoes, public.user_roles TO service_role;
NOTIFY pgrst, 'reload schema';
