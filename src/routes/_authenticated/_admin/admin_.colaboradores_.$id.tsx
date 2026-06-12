import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, X, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin_/colaboradores_/$id")({
  component: ColaboradorDetail,
});

function ColaboradorDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [obs, setObs] = useState<Record<string, string>>({});

  const { data } = useQuery({
    queryKey: ["colab", id],
    queryFn: async () => {
      const [p, e, f, c, b, d, s] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("enderecos").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("funcoes_colaborador").select("*").eq("user_id", id),
        supabase.from("certificacoes").select("*").eq("user_id", id),
        supabase.from("dados_bancarios").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("documentos").select("*").eq("user_id", id),
        supabase.from("submissoes").select("*").eq("user_id", id),
      ]);
      return { p: p.data, e: e.data, f: f.data ?? [], c: c.data ?? [], b: b.data, d: d.data ?? [], s: s.data ?? [] };
    },
  });

  const updateDoc = async (docId: string, status: string, observacao?: string) => {
    if ((status === "reprovado" || status === "correcao_solicitada") && !observacao?.trim()) {
      return toast.error("Informe o motivo da rejeição/correção.");
    }
    const { error } = await supabase.from("documentos").update({ status: status as any, observacao_admin: observacao || null }).eq("id", docId);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
    qc.invalidateQueries({ queryKey: ["colab", id] });
  };

  const updateStatus = async (status: string) => {
    await supabase.from("profiles").update({ status: status as any }).eq("id", id);
    toast.success("Status atualizado");
    qc.invalidateQueries({ queryKey: ["colab", id] });
  };

  const getUrl = async (path: string) => {
    const bucket = path.includes("assinatura") ? "assinaturas" : "documentos";
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (!data?.p) return <div className="p-10 text-sm text-muted-foreground">A carregar…</div>;

  const { p, e, f, c, b, d } = data;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/admin/colaboradores" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="h-3 w-3" /> Voltar
      </Link>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{p.nome || "Sem nome"}</h1>
          <p className="text-sm text-muted-foreground">NIF {p.nif} · {p.email}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => updateStatus("aprovado")}>Aprovar tudo</Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus("correcao_solicitada")}>Pedir correção</Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus("reprovado")}>Reprovar</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Dados Pessoais">
          <Row k="Nome" v={p.nome} /><Row k="NIF" v={p.nif} /><Row k="NISS" v={p.niss} />
          <Row k="Telefone" v={p.telefone} /><Row k="Estado civil" v={p.estado_civil} />
          <Row k="Escolaridade" v={p.escolaridade} />
        </Section>
        <Section title="Morada">
          <Row k="CP" v={e?.codigo_postal} /><Row k="Cidade" v={e?.cidade} />
          <Row k="Distrito" v={e?.distrito} /><Row k="Rua" v={e?.rua} />
        </Section>
        <Section title="Profissional">
          <Row k="Funções" v={f.map((x: any) => x.funcao).join(", ")} />
          <Row k="Certificações" v={c.map((x: any) => x.nome).join(", ") || "—"} />
        </Section>
        <Section title="Bancário">
          <Row k="IBAN" v={b?.iban} />
          <Row k="Confirmou titular" v={b?.titular_confirmado ? "Sim" : "Não"} />
        </Section>
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">Documentos</h2>
      <div className="space-y-3">
        {d.length === 0 && <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>}
        {d.map((doc: any) => (
          <div key={doc.id} className="border border-border rounded-md p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-medium text-sm">{doc.tipo.replace(/_/g, " ")}</div>
                <div className="text-xs text-muted-foreground">{doc.file_name}</div>
                <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border mt-2 inline-block">{doc.status}</span>
                {doc.observacao_admin && (
                  <div className="text-xs mt-2 italic text-muted-foreground">"{doc.observacao_admin}"</div>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => getUrl(doc.file_url)}>Ver</Button>
                <Button size="sm" variant="outline" onClick={() => updateDoc(doc.id, "aprovado")}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateDoc(doc.id, "reprovado", obs[doc.id])}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Textarea className="mt-3 text-xs" rows={2} placeholder="Observação para correção…"
              value={obs[doc.id] ?? ""} onChange={(ev) => setObs({ ...obs, [doc.id]: ev.target.value })} />
            <Button size="sm" variant="ghost" className="mt-1" onClick={() => updateDoc(doc.id, "correcao_solicitada", obs[doc.id])}>
              <MessageSquare className="h-3 w-3 mr-1" /> Solicitar correção
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="border border-border rounded-lg p-5">
      <h3 className="font-semibold text-sm uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Row({ k, v }: any) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v || "—"}</span>
    </div>
  );
}
