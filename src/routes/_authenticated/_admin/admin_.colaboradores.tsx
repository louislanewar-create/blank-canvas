import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { deleteUser, resetUserPassword } from "@/lib/admin.functions";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin_/colaboradores")({
  component: ColaboradoresList,
});

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
  correcao_solicitada: "Correção",
};

function ColaboradoresList() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const qc = useQueryClient();
  const fnDelete = useServerFn(deleteUser);
  const fnReset = useServerFn(resetUserPassword);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: list } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = (list ?? []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(ql) ||
      p.nif?.includes(q) ||
      p.email?.toLowerCase().includes(ql)
    );
  });

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await fnDelete({ data: { userId: id } });
      toast.success("Utilizador excluído");
      qc.invalidateQueries({ queryKey: ["colaboradores"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao excluir");
    } finally {
      setBusyId(null);
    }
  };

  const handleReset = async (id: string) => {
    setBusyId(id);
    try {
      await fnReset({ data: { userId: id } });
      toast.success("Senha redefinida para 123456");
      qc.invalidateQueries({ queryKey: ["colaboradores"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao redefinir");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Colaboradores</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <Input className="max-w-sm" placeholder="Buscar por nome, NIF ou e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground self-center ml-auto">
          {filtered.length} colaborador(es)
        </div>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">NIF</th>
              <th className="text-left px-4 py-2">E-mail</th>
              <th className="text-left px-4 py-2">Etapa</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-4 py-2">
                  <Link to="/admin/colaboradores/$id" params={{ id: p.id }} className="font-medium hover:underline">
                    {p.nome || "—"}
                  </Link>
                </td>
                <td className="px-4 py-2">{p.nif}</td>
                <td className="px-4 py-2 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-2">{p.etapa_atual}/6</td>
                <td className="px-4 py-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border">{STATUS_LABEL[p.status] || p.status}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={busyId === p.id} title="Redefinir senha">
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Redefinir senha?</AlertDialogTitle>
                          <AlertDialogDescription>
                            A senha de <strong>{p.nome || p.nif}</strong> será redefinida para <code>123456</code>.
                            O colaborador será obrigado a definir uma nova no próximo login.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleReset(p.id)}>Redefinir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={busyId === p.id} title="Excluir">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação é permanente. Todos os dados e documentos de{" "}
                            <strong>{p.nome || p.nif}</strong> serão removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum colaborador encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
