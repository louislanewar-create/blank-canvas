import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/avisos")({
  component: AvisosPage,
});

const DOC_LABELS: Record<string, string> = {
  passaporte: "Passaporte",
  titulo_residencia: "Título de residência",
  carta_conducao: "Carta de condução",
  cartao_saude: "Cartão de saúde",
  comprovativo_morada: "Comprovativo de morada",
  comprovativo_bancario: "Comprovativo bancário",
  assinatura: "Assinatura",
};

const daysUntil = (d?: string | null) => {
  if (!d) return null;
  return Math.floor((new Date(d).getTime() - Date.now()) / 86400000);
};

function AvisosPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["avisos", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("documentos").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const docs = data ?? [];
  const rejeitados = docs.filter((d) => d.status === "reprovado" || d.status === "correcao_solicitada");
  const expirados = docs.filter((d) => {
    const days = daysUntil(d.data_validade);
    return days !== null && days < 0;
  });
  const proximos = docs.filter((d) => {
    const days = daysUntil(d.data_validade);
    return days !== null && days >= 0 && days <= 30;
  });

  const total = rejeitados.length + expirados.length + proximos.length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Avisos</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {total === 0 ? "Sem avisos no momento." : `${total} aviso(s) a verificar.`}
      </p>

      <Group icon={XCircle} tone="danger" title="Documentos rejeitados ou com pedido de correção" items={rejeitados.map((d) => ({
        label: DOC_LABELS[d.tipo] ?? d.tipo,
        detail: d.observacao_admin || "Reenvie o documento corrigido.",
      }))} />
      <Group icon={AlertCircle} tone="danger" title="Documentos expirados" items={expirados.map((d) => ({
        label: DOC_LABELS[d.tipo] ?? d.tipo,
        detail: `Validade: ${d.data_validade}`,
      }))} />
      <Group icon={Clock} tone="warning" title="Documentos próximos do vencimento (30 dias)" items={proximos.map((d) => ({
        label: DOC_LABELS[d.tipo] ?? d.tipo,
        detail: `Vence em ${daysUntil(d.data_validade)} dia(s)`,
      }))} />
    </div>
  );
}

function Group({ icon: Icon, tone, title, items }: any) {
  if (items.length === 0) return null;
  const toneCls = tone === "danger" ? "border-destructive/40 bg-destructive/5" : "border-warning/40 bg-warning/5";
  return (
    <section className={`border rounded-lg p-5 mb-4 ${toneCls}`}>
      <h2 className="font-semibold flex items-center gap-2 mb-3"><Icon className="h-4 w-4" /> {title}</h2>
      <ul className="space-y-2">
        {items.map((it: any, i: number) => (
          <li key={i} className="text-sm border-l-2 border-foreground/20 pl-3">
            <div className="font-medium">{it.label}</div>
            <div className="text-xs text-muted-foreground">{it.detail}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
