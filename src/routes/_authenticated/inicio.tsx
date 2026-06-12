import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/inicio")({
  component: InicioPage,
});

const STATUS_MAP: Record<string, { label: string; Icon: typeof Clock; tone: "neutral" | "info" | "success" | "warning" | "danger" }> = {
  rascunho: { label: "Em preenchimento", Icon: Clock, tone: "neutral" },
  enviado: { label: "Enviado — aguardando análise", Icon: Clock, tone: "warning" },
  aprovado: { label: "Aprovado", Icon: CheckCircle2, tone: "success" },
  reprovado: { label: "Reprovado", Icon: XCircle, tone: "danger" },
  correcao_solicitada: { label: "Correção solicitada", Icon: AlertCircle, tone: "danger" },
};

const TONE_CLS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary text-primary-foreground border-primary",
  success: "bg-success text-success-foreground border-success",
  warning: "bg-warning text-warning-foreground border-warning",
  danger: "bg-destructive text-destructive-foreground border-destructive",
};

const DOC_STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  aprovado: { label: "Aprovado", tone: "success" },
  pendente: { label: "Em análise", tone: "warning" },
  reprovado: { label: "Rejeitado", tone: "danger" },
  correcao_solicitada: { label: "Corrigir", tone: "danger" },
  expirado: { label: "Expirado", tone: "danger" },
  proximo_validade: { label: "Próximo da validade", tone: "warning" },
};

function effectiveDocStatus(doc: any): keyof typeof DOC_STATUS {
  if (doc.data_validade) {
    const days = Math.floor((new Date(doc.data_validade).getTime() - Date.now()) / 86400000);
    if (days < 0) return "expirado";
    if (days <= 30 && doc.status === "aprovado") return "proximo_validade";
  }
  return (doc.status as keyof typeof DOC_STATUS) ?? "pendente";
}

const DOC_LABELS: Record<string, string> = {
  passaporte: "Passaporte",
  titulo_residencia: "Título de residência",
  carta_conducao: "Carta de condução",
  cartao_saude: "Cartão de saúde",
  comprovativo_morada: "Comprovativo de morada",
  comprovativo_bancario: "Comprovativo bancário",
  assinatura: "Assinatura",
};

function Dot({ tone }: { tone: "success" | "warning" | "danger" | "neutral" }) {
  const map = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    neutral: "bg-muted-foreground/40",
  } as const;
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[tone]}`} />;
}

function InicioPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, isAdmin, navigate]);

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      const uid = user!.id;
      const [p, e, f, c, b, d] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("enderecos").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("funcoes_colaborador").select("*").eq("user_id", uid),
        supabase.from("certificacoes").select("*").eq("user_id", uid),
        supabase.from("dados_bancarios").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("documentos").select("*").eq("user_id", uid),
      ]);
      return { profile: p.data, endereco: e.data, funcoes: f.data ?? [], certs: c.data ?? [], bancario: b.data, docs: d.data ?? [] };
    },
    enabled: !!user && !isAdmin,
  });

  useEffect(() => {
    if (data?.profile?.must_change_password) navigate({ to: "/reset-password" });
  }, [data, navigate]);


  const profile = data?.profile;
  const status = profile?.status ?? "rascunho";
  const meta = STATUS_MAP[status] ?? STATUS_MAP.rascunho;
  const submitted = status !== "rascunho";

  const Row = ({ k, v }: { k: string; v: any }) => (
    <div className="flex justify-between gap-4 text-sm py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right break-words">{v || "—"}</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Olá{profile?.nome ? `, ${profile.nome}` : ""}</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Bem-vindo à sua área</h1>
      </div>

      <div className="border border-border rounded-lg overflow-hidden mb-6">
        <div className={`px-5 py-3 flex items-center gap-2 text-sm font-medium border-b ${TONE_CLS[meta.tone]}`}>
          <meta.Icon className="h-4 w-4" /> Status: {meta.label}
        </div>
        <div className="p-6">
          <h2 className="font-semibold mb-1">Envio de Documentações</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Cadastro em etapas: dados pessoais, morada, profissional, bancário, revisão e assinatura.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/cadastro">
              <FileText className="h-4 w-4 mr-2" />
              {status === "rascunho" ? "Iniciar envio" : status === "correcao_solicitada" ? "Corrigir informações" : "Revisar / atualizar"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          {!submitted && (
            <div className="text-xs text-muted-foreground mt-4">
              Etapa atual: <span className="font-medium text-foreground">{profile?.etapa_atual ?? 1}</span> de 6
            </div>
          )}
        </div>
      </div>

      {submitted && data && (
        <div className="space-y-6">
          {/* Documentos com cores */}
          <section className="border border-border rounded-lg p-5 bg-card">
            <h3 className="font-semibold mb-3">Documentos enviados</h3>
            {data.docs.length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento.</p>}
            <ul className="divide-y divide-border">
              {data.docs.map((doc: any) => {
                const eff = effectiveDocStatus(doc);
                const st = DOC_STATUS[eff];
                return (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <Dot tone={st.tone} />
                      <span className="font-medium truncate">{DOC_LABELS[doc.tipo] ?? doc.tipo}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TONE_CLS[st.tone]}`}>
                      {st.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            {data.docs.some((d: any) => d.observacao_admin) && (
              <div className="mt-4 space-y-2">
                {data.docs.filter((d: any) => d.observacao_admin).map((d: any) => (
                  <div key={d.id} className="text-xs border-l-2 border-destructive pl-3 py-1">
                    <span className="font-semibold">{DOC_LABELS[d.tipo] ?? d.tipo}:</span> {d.observacao_admin}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Dados Pessoais */}
          <section className="border border-border rounded-lg p-5 bg-card">
            <h3 className="font-semibold mb-3">Dados pessoais</h3>
            <Row k="Nome" v={profile?.nome} />
            <Row k="NIF" v={profile?.nif} />
            <Row k="NISS" v={profile?.niss} />
            <Row k="E-mail" v={profile?.email} />
            <Row k="Telefone" v={profile?.telefone} />
            <Row k="Estado civil" v={profile?.estado_civil} />
            <Row k="Escolaridade" v={profile?.escolaridade} />
          </section>

          {/* Morada */}
          <section className="border border-border rounded-lg p-5 bg-card">
            <h3 className="font-semibold mb-3">Morada</h3>
            <Row k="Código postal" v={data.endereco?.codigo_postal} />
            <Row k="Endereço" v={[data.endereco?.rua, data.endereco?.numero, data.endereco?.complemento].filter(Boolean).join(", ")} />
            <Row k="Cidade" v={data.endereco?.cidade} />
            <Row k="Distrito" v={data.endereco?.distrito} />
            <Row k="País" v={data.endereco?.pais} />
          </section>

          {/* Profissional */}
          <section className="border border-border rounded-lg p-5 bg-card">
            <h3 className="font-semibold mb-3">Profissional</h3>
            <Row k="Funções" v={data.funcoes.map((f: any) => f.funcao).join(", ")} />
            <Row k="Certificações" v={data.certs.map((c: any) => c.nome).join(", ")} />
          </section>

          {/* Bancário */}
          <section className="border border-border rounded-lg p-5 bg-card">
            <h3 className="font-semibold mb-3">Dados bancários</h3>
            <Row k="IBAN" v={data.bancario?.iban} />
            <Row k="Titular confirmado" v={data.bancario?.titular_confirmado ? "Sim" : "Não"} />
          </section>
        </div>
      )}
    </div>
  );
}
