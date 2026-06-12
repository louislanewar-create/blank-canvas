
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'colaborador');
CREATE TYPE public.submission_status AS ENUM ('rascunho', 'enviado', 'aprovado', 'reprovado', 'correcao_solicitada');
CREATE TYPE public.documento_tipo AS ENUM (
  'passaporte', 'titulo_residencia', 'carta_conducao', 'cartao_saude',
  'comprovativo_morada', 'comprovativo_bancario', 'certificacao', 'assinatura', 'outro'
);
CREATE TYPE public.documento_status AS ENUM ('pendente', 'aprovado', 'reprovado', 'correcao_solicitada');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nif TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  nome TEXT,
  niss TEXT,
  telefone TEXT,
  estado_civil TEXT,
  escolaridade TEXT,
  etapa_atual INT NOT NULL DEFAULT 1,
  status public.submission_status NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Endereços
CREATE TABLE public.enderecos (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_postal TEXT,
  rua TEXT,
  numero TEXT,
  complemento TEXT,
  cidade TEXT,
  distrito TEXT,
  pais TEXT DEFAULT 'Portugal',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funções
CREATE TABLE public.funcoes_colaborador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  funcao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certificações
CREATE TABLE public.certificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  data_emissao DATE,
  data_validade DATE,
  documento_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados bancários
CREATE TABLE public.dados_bancarios (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  iban TEXT,
  comprovativo_url TEXT,
  titular_confirmado BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo public.documento_tipo NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  data_validade DATE,
  status public.documento_status NOT NULL DEFAULT 'pendente',
  observacao_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Submissões
CREATE TABLE public.submissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lgpd_aceito BOOLEAN NOT NULL DEFAULT FALSE,
  assinatura_url TEXT,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_bancarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissoes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Generic owner-or-admin policies helper
CREATE POLICY "own or admin select" ON public.enderecos FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert" ON public.enderecos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own or admin update" ON public.enderecos FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own or admin select" ON public.funcoes_colaborador FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert" ON public.funcoes_colaborador FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own delete" ON public.funcoes_colaborador FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own or admin select" ON public.certificacoes FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert" ON public.certificacoes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own update" ON public.certificacoes FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own delete" ON public.certificacoes FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own or admin select" ON public.dados_bancarios FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert" ON public.dados_bancarios FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own or admin update" ON public.dados_bancarios FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own or admin select" ON public.documentos FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert" ON public.documentos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own or admin update" ON public.documentos FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own delete" ON public.documentos FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own or admin select" ON public.submissoes FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own insert" ON public.submissoes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_enderecos_updated BEFORE UPDATE ON public.enderecos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_dados_bancarios_updated BEFORE UPDATE ON public.dados_bancarios FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_documentos_updated BEFORE UPDATE ON public.documentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nif, email, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nif', NEW.id::text),
    NEW.email,
    NEW.raw_user_meta_data->>'nome'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'colaborador');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('assinaturas', 'assinaturas', false);

-- Storage policies (path prefix = user id)
CREATE POLICY "users upload own docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('documentos', 'assinaturas') AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "users read own docs" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id IN ('documentos', 'assinaturas') AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')
  )
);
CREATE POLICY "users update own docs" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id IN ('documentos', 'assinaturas') AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "users delete own docs" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id IN ('documentos', 'assinaturas') AND (storage.foldername(name))[1] = auth.uid()::text
);
