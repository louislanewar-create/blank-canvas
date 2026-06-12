import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { bulkCreateUsers } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ChevronLeft, UserPlus, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/_admin/admin_/solicitar-utilizadores")({
  component: SolicitarPage,
});

function SolicitarPage() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ nif: string; status: string; message?: string }>>([]);
  const bulk = useServerFn(bulkCreateUsers);

  const parseNifs = (s: string) =>
    Array.from(new Set(s.split(/[,;\n\s]+/).map((x) => x.trim()).filter(Boolean)));

  const handleSubmit = async () => {
    const nifs = parseNifs(raw);
    if (!nifs.length) return toast.error("Cole pelo menos um NIF.");
    if (nifs.length > 200) return toast.error("Máximo de 200 NIFs por vez.");
    setLoading(true);
    try {
      const res = await bulk({ data: { nifs } });
      setResults(res.results);
      const ok = res.results.filter((r) => r.status === "criado").length;
      toast.success(`${ok} conta(s) criada(s).`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar utilizadores.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/admin" className="text-sm text-muted-foreground hover:underline inline-flex items-center mb-4">
        <ChevronLeft className="h-4 w-4" /> Voltar ao painel
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mb-1">Solicitar utilizadores</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Crie contas em lote. Cole os NIFs separados por vírgula, ponto-e-vírgula ou nova linha.
      </p>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex gap-2 text-xs bg-muted/60 border border-border rounded-md p-3">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            Cada conta é criada com a palavra-passe padrão <code className="px-1 py-0.5 bg-background border border-border rounded">123456</code>.
            O utilizador será obrigado a alterá-la no primeiro acesso.
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nifs">NIFs</Label>
          <Textarea
            id="nifs"
            rows={8}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="123456789, 987654321, 111222333..."
            className="font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground">
            {parseNifs(raw).length} NIF(s) detetado(s).
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} size="lg">
          <UserPlus className="h-4 w-4 mr-2" />
          {loading ? "A criar contas…" : "Criar contas"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="border border-border rounded-lg mt-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/40 text-sm font-semibold">
            Resultado ({results.length})
          </div>
          <ul className="divide-y divide-border">
            {results.map((r, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-mono">{r.nif}</span>
                <span className="flex items-center gap-1.5 text-xs">
                  {r.status === "criado" ? (
                    <><CheckCircle2 className="h-4 w-4 text-success" /> Criado</>
                  ) : r.status === "existe" ? (
                    <><AlertCircle className="h-4 w-4 text-warning" /> Já existe</>
                  ) : (
                    <><AlertCircle className="h-4 w-4 text-destructive" /> {r.message || "Erro"}</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
