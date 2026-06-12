import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileWarning, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date();
      const in30 = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
      const todayIso = today.toISOString().slice(0, 10);
      const [users, pending, expired, expiring] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("documentos").select("id", { count: "exact", head: true }).eq("status", "pendente"),
        supabase.from("documentos").select("id", { count: "exact", head: true }).lt("data_validade", todayIso),
        supabase.from("documentos").select("id", { count: "exact", head: true }).gte("data_validade", todayIso).lte("data_validade", in30),
      ]);
      return {
        users: users.count ?? 0,
        pending: pending.count ?? 0,
        expired: expired.count ?? 0,
        expiring: expiring.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Colaboradores", value: stats?.users, Icon: Users },
    { label: "Documentos pendentes", value: stats?.pending, Icon: Clock },
    { label: "Próximos do vencimento", value: stats?.expiring, Icon: AlertTriangle },
    { label: "Vencidos", value: stats?.expired, Icon: FileWarning },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Administração</p>
        <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="border border-border rounded-lg p-5 bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{value ?? "—"}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/admin/colaboradores"
          className="inline-block border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-muted">
          Ver colaboradores →
        </Link>
        <Link to="/admin/solicitar-utilizadores"
          className="inline-block border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-muted">
          Solicitar utilizadores →
        </Link>
      </div>
    </div>
  );
}
